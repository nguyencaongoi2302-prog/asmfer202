import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { attemptApi, questionApi, quizApi } from '../../services/api';
import { formatDateTime, formatDuration } from '../../utils/formatters';

export default function ResultPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadResult() {
      try {
        const attemptData = await attemptApi.getById(attemptId);
        if (String(attemptData.userId) !== String(user.id)) {
          throw new Error('Bạn không có quyền xem kết quả này.');
        }
        const [quizData, questionData] = await Promise.all([
          quizApi.getById(attemptData.quizId),
          questionApi.getByQuiz(attemptData.quizId),
        ]);
        setAttempt(attemptData);
        setQuiz(quizData);
        setQuestions(questionData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId, user.id]);

  const answersByQuestion = useMemo(() => {
    return Object.fromEntries(
      (attempt?.answers || []).map((answer) => [String(answer.questionId), answer]),
    );
  }, [attempt]);

  if (loading) return <Loading />;
  if (error || !attempt || !quiz) {
    return (
      <div className="container narrow-container page-stack">
        <div className="alert alert-error">{error || 'Không tìm thấy kết quả.'}</div>
        <Link className="button button-secondary" to="/quizzes">
          Về danh sách bài thi
        </Link>
      </div>
    );
  }

  return (
    <div className="container narrow-container page-stack">
      <section className={`result-hero ${attempt.passed ? 'result-passed' : 'result-failed'}`}>
        <div className="result-symbol">{attempt.passed ? '✓' : '!'}</div>
        <span className="eyebrow">KẾT QUẢ BÀI THI</span>
        <h1>{attempt.passed ? 'Chúc mừng, bạn đã đạt!' : 'Bạn chưa đạt lần này'}</h1>
        <p>{quiz.title}</p>
        <div className="result-score">{attempt.percent}%</div>
        <span>
          {attempt.correctCount}/{attempt.questionCount} câu đúng · Mức yêu cầu{' '}
          {quiz.passingScore}%
        </span>
      </section>

      <section className="result-summary card">
        <div>
          <span>Điểm</span>
          <strong>
            {attempt.score}/{attempt.totalPoints}
          </strong>
        </div>
        <div>
          <span>Thời gian làm</span>
          <strong>{formatDuration(attempt.durationSeconds)}</strong>
        </div>
        <div>
          <span>Nộp lúc</span>
          <strong>{formatDateTime(attempt.submittedAt)}</strong>
        </div>
        <div>
          <span>Trạng thái</span>
          <strong>{attempt.passed ? 'Đạt' : 'Chưa đạt'}</strong>
        </div>
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <h2>Xem lại đáp án</h2>
          <p>Đối chiếu lựa chọn của bạn với đáp án đúng.</p>
        </div>

        {questions.map((question, index) => {
          const answer = answersByQuestion[String(question.id)];
          const selected = question.options.find(
            (option) => option.id === answer?.selectedOptionId,
          );
          const correct = question.options.find(
            (option) => option.id === question.correctOptionId,
          );

          return (
            <article
              key={question.id}
              className={`review-card card ${answer?.isCorrect ? 'review-correct' : 'review-wrong'}`}
            >
              <div className="review-heading">
                <span>Câu {index + 1}</span>
                <strong>{answer?.isCorrect ? 'Đúng' : 'Sai'}</strong>
              </div>
              <h3>{question.content}</h3>
              <div className="review-answer-row">
                <span>Bạn chọn</span>
                <strong>{selected ? `${selected.id}. ${selected.text}` : 'Chưa trả lời'}</strong>
              </div>
              {!answer?.isCorrect && (
                <div className="review-answer-row correct-answer">
                  <span>Đáp án đúng</span>
                  <strong>{correct?.id}. {correct?.text}</strong>
                </div>
              )}
              {question.explanation && (
                <div className="explanation-box">
                  <strong>Giải thích:</strong> {question.explanation}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <div className="action-row centered-actions">
        <Link className="button button-secondary" to="/history">
          Xem lịch sử
        </Link>
        <Link className="button button-primary" to={`/quizzes/${quiz.id}/take`}>
          Làm lại bài thi
        </Link>
      </div>
    </div>
  );
}
