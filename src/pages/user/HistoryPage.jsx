import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { attemptApi, quizApi } from '../../services/api';
import { formatDateTime, formatDuration } from '../../utils/formatters';

export default function HistoryPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const [attemptData, quizData] = await Promise.all([
          attemptApi.getByUser(user.id),
          quizApi.getAll(),
        ]);
        setAttempts(attemptData);
        setQuizzes(quizData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user.id]);

  if (loading) return <Loading />;

  const quizMap = Object.fromEntries(quizzes.map((quiz) => [String(quiz.id), quiz]));
  const passedCount = attempts.filter((attempt) => attempt.passed).length;
  const average = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percent, 0) / attempts.length)
    : 0;

  return (
    <div className="container page-stack">
      <section className="section-heading">
        <span className="eyebrow">YOUR PROGRESS</span>
        <h1>Lịch sử làm bài</h1>
        <p>Theo dõi điểm số và mở lại phần chữa bài của từng lần thi.</p>
      </section>

      <section className="stats-grid three-columns">
        <div className="stat-card">
          <span>Tổng lượt làm</span>
          <strong>{attempts.length}</strong>
        </div>
        <div className="stat-card">
          <span>Số lượt đạt</span>
          <strong>{passedCount}</strong>
        </div>
        <div className="stat-card">
          <span>Điểm trung bình</span>
          <strong>{average}%</strong>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {attempts.length === 0 ? (
        <EmptyState
          title="Bạn chưa làm bài thi nào"
          description="Hãy chọn một bài thi để bắt đầu luyện tập."
          action={
            <Link className="button button-primary" to="/quizzes">
              Xem bài thi
            </Link>
          }
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Bài thi</th>
                  <th>Thời gian</th>
                  <th>Kết quả</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const quiz = quizMap[String(attempt.quizId)];
                  return (
                    <tr key={attempt.id}>
                      <td>
                        <strong>{quiz?.title || 'Bài thi đã xóa'}</strong>
                        <span className="table-subtext">
                          {formatDateTime(attempt.submittedAt)}
                        </span>
                      </td>
                      <td>{formatDuration(attempt.durationSeconds)}</td>
                      <td>
                        <strong>{attempt.percent}%</strong>
                        <span className="table-subtext">
                          {attempt.correctCount}/{attempt.questionCount} câu đúng
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${attempt.passed ? 'published' : 'draft'}`}>
                          {attempt.passed ? 'Đạt' : 'Chưa đạt'}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link className="button button-ghost button-sm" to={`/results/${attempt.id}`}>
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
