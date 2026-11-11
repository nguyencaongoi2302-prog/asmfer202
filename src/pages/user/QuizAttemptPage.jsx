import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { attemptApi, questionApi, quizApi } from '../../services/api';
import { formatDuration } from '../../utils/formatters';

export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());
  const submittedRef = useRef(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const [quizData, questionData] = await Promise.all([
          quizApi.getById(quizId),
          questionApi.getByQuiz(quizId),
        ]);
        if (!quizData.published) throw new Error('Bài thi này chưa được công khai.');
        if (questionData.length === 0) throw new Error('Bài thi chưa có câu hỏi.');
        setQuiz(quizData);
        setQuestions(questionData);
        setTimeLeft(Number(quizData.durationMinutes) * 60);
        startedAtRef.current = new Date().toISOString();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  const submitQuiz = useCallback(
    async (isAutoSubmit = false) => {
      if (!quiz || questions.length === 0 || submittedRef.current) return;

      const unanswered = questions.length - Object.keys(answers).length;
      if (!isAutoSubmit && unanswered > 0) {
        const shouldSubmit = window.confirm(
          `Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`,
        );
        if (!shouldSubmit) return;
      }

      submittedRef.current = true;
      setSubmitting(true);
      setError('');

      try {
        const totalPoints = questions.reduce(
          (sum, question) => sum + Number(question.points || 1),
          0,
        );
        let earnedPoints = 0;
        let correctCount = 0;

        const answerDetails = questions.map((question) => {
          const selectedOptionId = answers[question.id] || null;
          const isCorrect = selectedOptionId === question.correctOptionId;
          if (isCorrect) {
            correctCount += 1;
            earnedPoints += Number(question.points || 1);
          }
          return {
            questionId: question.id,
            selectedOptionId,
            isCorrect,
          };
        });

        const percent = totalPoints
          ? Math.round((earnedPoints / totalPoints) * 100)
          : 0;
        const submittedAt = new Date().toISOString();
        const durationSeconds = Math.max(
          0,
          Math.round(
            (new Date(submittedAt).getTime() -
              new Date(startedAtRef.current).getTime()) /
              1000,
          ),
        );

        const attempt = await attemptApi.create({
          userId: user.id,
          quizId: quiz.id,
          answers: answerDetails,
          score: earnedPoints,
          totalPoints,
          percent,
          passed: percent >= Number(quiz.passingScore),
          correctCount,
          questionCount: questions.length,
          startedAt: startedAtRef.current,
          submittedAt,
          durationSeconds,
          autoSubmitted: isAutoSubmit,
        });

        navigate(`/results/${attempt.id}`, { replace: true });
      } catch (err) {
        submittedRef.current = false;
        setError(err.message);
        setSubmitting(false);
      }
    },
    [answers, navigate, questions, quiz, user.id],
  );

  useEffect(() => {
    if (timeLeft === null || submittedRef.current) return undefined;
    if (timeLeft <= 0) {
      submitQuiz(true);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft, submitQuiz]);

  if (loading) return <Loading text="Đang chuẩn bị bài thi..." />;
  if (error && !quiz) {
    return (
      <div className="container narrow-container page-stack">
        <div className="alert alert-error">{error}</div>
        <button className="button button-secondary" onClick={() => navigate('/quizzes')}>
          Về danh sách bài thi
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-taking-page">
      <div className="quiz-taking-header">
        <div className="container quiz-taking-header-inner">
          <div>
            <span className="muted">Đang làm bài</span>
            <h1>{quiz.title}</h1>
          </div>
          <div className={`timer ${timeLeft <= 60 ? 'timer-danger' : ''}`}>
            <span>Thời gian còn lại</span>
            <strong>{formatDuration(timeLeft)}</strong>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="container quiz-workspace">
        <aside className="question-nav card">
          <div className="question-nav-title">
            <strong>Câu hỏi</strong>
            <span>
              {answeredCount}/{questions.length} đã trả lời
            </span>
          </div>
          <div className="question-number-grid">
            {questions.map((question, index) => (
              <button
                key={question.id}
                className={`question-number ${index === currentIndex ? 'active' : ''} ${
                  answers[question.id] ? 'answered' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Đến câu ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            className="button button-primary button-block"
            disabled={submitting}
            onClick={() => submitQuiz(false)}
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </aside>

        <section className="question-card card">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="question-kicker">
            Câu {currentIndex + 1} / {questions.length} · {currentQuestion.points || 1} điểm
          </div>
          <h2>{currentQuestion.content}</h2>

          <div className="option-list">
            {currentQuestion.options.map((option) => {
              const inputId = `question-${currentQuestion.id}-${option.id}`;
              return (
                <label
                  key={option.id}
                  htmlFor={inputId}
                  className={`option-item ${
                    answers[currentQuestion.id] === option.id ? 'selected' : ''
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [currentQuestion.id]: option.id,
                      }))
                    }
                  />
                  <span className="option-letter">{option.id}</span>
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>

          <div className="question-actions">
            <button
              className="button button-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
            >
              ← Câu trước
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                className="button button-primary"
                onClick={() => setCurrentIndex((index) => index + 1)}
              >
                Câu tiếp theo →
              </button>
            ) : (
              <button
                className="button button-primary"
                disabled={submitting}
                onClick={() => submitQuiz(false)}
              >
                Nộp bài
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
