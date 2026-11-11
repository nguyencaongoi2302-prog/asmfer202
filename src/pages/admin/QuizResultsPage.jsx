import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { attemptApi, quizApi, userApi } from '../../services/api';
import { formatDateTime, formatDuration } from '../../utils/formatters';

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadResults() {
      try {
        const [quizData, attemptData, userData] = await Promise.all([
          quizApi.getById(quizId),
          attemptApi.getByQuiz(quizId),
          userApi.getAll(),
        ]);
        setQuiz(quizData);
        setAttempts(attemptData);
        setUsers(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [quizId]);

  const stats = useMemo(() => {
    const passed = attempts.filter((attempt) => attempt.passed).length;
    const average = attempts.length
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percent, 0) / attempts.length)
      : 0;
    const highest = attempts.length
      ? Math.max(...attempts.map((attempt) => attempt.percent))
      : 0;
    return { passed, average, highest };
  }, [attempts]);

  if (loading) return <Loading />;
  if (error || !quiz) {
    return <div className="container alert alert-error">{error || 'Không tìm thấy bài thi.'}</div>;
  }

  const userMap = Object.fromEntries(users.map((user) => [String(user.id), user]));

  return (
    <div className="container page-stack">
      <section className="admin-heading split-heading">
        <div>
          <Link className="back-link" to="/admin">
            ← Quay lại trang quản trị
          </Link>
          <span className="eyebrow">QUIZ ANALYTICS</span>
          <h1>Kết quả học viên</h1>
          <p>{quiz.title}</p>
        </div>
        <Link className="button button-secondary" to={`/admin/quizzes/${quiz.id}/questions`}>
          Quản lý câu hỏi
        </Link>
      </section>

      <section className="stats-grid four-columns">
        <div className="stat-card">
          <span>Lượt làm bài</span>
          <strong>{attempts.length}</strong>
        </div>
        <div className="stat-card">
          <span>Đã đạt</span>
          <strong>{stats.passed}</strong>
        </div>
        <div className="stat-card">
          <span>Điểm trung bình</span>
          <strong>{stats.average}%</strong>
        </div>
        <div className="stat-card">
          <span>Điểm cao nhất</span>
          <strong>{stats.highest}%</strong>
        </div>
      </section>

      {attempts.length === 0 ? (
        <EmptyState
          title="Chưa có kết quả"
          description="Chưa có học viên nào hoàn thành bài thi này."
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Ngày làm</th>
                  <th>Thời gian</th>
                  <th>Số câu đúng</th>
                  <th>Điểm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const learner = userMap[String(attempt.userId)];
                  return (
                    <tr key={attempt.id}>
                      <td>
                        <strong>{learner?.fullName || 'Tài khoản đã xóa'}</strong>
                        <span className="table-subtext">{learner?.email || '—'}</span>
                      </td>
                      <td>{formatDateTime(attempt.submittedAt)}</td>
                      <td>{formatDuration(attempt.durationSeconds)}</td>
                      <td>
                        {attempt.correctCount}/{attempt.questionCount}
                      </td>
                      <td>
                        <strong>{attempt.percent}%</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${attempt.passed ? 'published' : 'draft'}`}>
                          {attempt.passed ? 'Đạt' : 'Chưa đạt'}
                        </span>
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
