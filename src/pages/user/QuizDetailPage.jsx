import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { attemptApi, questionApi, quizApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [quizData, questionData, attemptData] = await Promise.all([
          quizApi.getById(quizId),
          questionApi.getByQuiz(quizId),
          attemptApi.getByUser(user.id),
        ]);
        if (!quizData.published) {
          throw new Error('Bài thi này chưa được công khai.');
        }
        setQuiz(quizData);
        setQuestions(questionData);
        setAttempts(
          attemptData.filter((attempt) => String(attempt.quizId) === String(quizId)),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [quizId, user.id]);

  if (loading) return <Loading />;
  if (error || !quiz) {
    return (
      <div className="container narrow-container page-stack">
        <div className="alert alert-error">{error || 'Không tìm thấy bài thi.'}</div>
        <Link className="button button-secondary" to="/quizzes">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container narrow-container page-stack">
      <Link className="back-link" to="/quizzes">
        ← Quay lại danh sách bài thi
      </Link>

      <section className="detail-card">
        <div className="detail-header">
          <div>
            <span className={`level-badge level-${quiz.level.toLowerCase()}`}>
              {quiz.level}
            </span>
            <h1>{quiz.title}</h1>
            <p>{quiz.description}</p>
          </div>
          <div className="quiz-icon">ABC</div>
        </div>

        <div className="detail-stat-grid">
          <div>
            <span>Số câu hỏi</span>
            <strong>{questions.length}</strong>
          </div>
          <div>
            <span>Thời gian</span>
            <strong>{quiz.durationMinutes} phút</strong>
          </div>
          <div>
            <span>Điểm đạt</span>
            <strong>{quiz.passingScore}%</strong>
          </div>
          <div>
            <span>Số lần đã làm</span>
            <strong>{attempts.length}</strong>
          </div>
        </div>

        <div className="instruction-box">
          <h3>Hướng dẫn</h3>
          <ul>
            <li>Mỗi câu hỏi chỉ chọn một đáp án.</li>
            <li>Đồng hồ sẽ bắt đầu ngay khi bạn vào trang làm bài.</li>
            <li>Bài thi tự động nộp khi hết thời gian.</li>
            <li>Bạn có thể xem đáp án và giải thích sau khi nộp.</li>
          </ul>
        </div>

        {questions.length > 0 ? (
          <Link className="button button-primary button-lg button-block" to="take">
            Bắt đầu làm bài
          </Link>
        ) : (
          <div className="alert alert-warning">Bài thi chưa có câu hỏi.</div>
        )}
      </section>

      {attempts.length > 0 && (
        <section className="card">
          <div className="section-heading">
            <h2>Kết quả gần đây</h2>
          </div>
          <div className="history-list compact-list">
            {attempts.slice(0, 3).map((attempt) => (
              <Link key={attempt.id} to={`/results/${attempt.id}`} className="history-item">
                <div>
                  <strong>{formatDateTime(attempt.submittedAt)}</strong>
                  <span>
                    {attempt.correctCount}/{attempt.questionCount} câu đúng
                  </span>
                </div>
                <span className={`score-pill ${attempt.passed ? 'passed' : 'failed'}`}>
                  {attempt.percent}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
