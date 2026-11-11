import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { attemptApi, questionApi, quizApi, userApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

export default function AdminDashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizData, questionData, attemptData, userData] = await Promise.all([
        quizApi.getAll(),
        questionApi.getAll(),
        attemptApi.getAll(),
        userApi.getAll(),
      ]);
      setQuizzes(quizData);
      setQuestions(questionData);
      setAttempts(attemptData);
      setUsers(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return quizzes;
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(keyword) ||
        quiz.description.toLowerCase().includes(keyword),
    );
  }, [quizzes, search]);

  const handleDelete = async (quiz) => {
    const confirmed = window.confirm(
      `Xóa bài thi “${quiz.title}”? Câu hỏi và kết quả liên quan cũng sẽ bị xóa.`,
    );
    if (!confirmed) return;

    try {
      const relatedQuestions = questions.filter(
        (question) => String(question.quizId) === String(quiz.id),
      );
      const relatedAttempts = attempts.filter(
        (attempt) => String(attempt.quizId) === String(quiz.id),
      );

      await Promise.all([
        ...relatedQuestions.map((question) => questionApi.remove(question.id)),
        ...relatedAttempts.map((attempt) => attemptApi.remove(attempt.id)),
      ]);
      await quizApi.remove(quiz.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePublished = async (quiz) => {
    try {
      await quizApi.update(quiz.id, {
        published: !quiz.published,
        updatedAt: new Date().toISOString(),
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;

  const learners = users.filter((user) => user.role === 'user');
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percent, 0) / attempts.length)
    : 0;

  return (
    <div className="container page-stack">
      <section className="admin-heading split-heading">
        <div>
          <span className="eyebrow">ADMIN DASHBOARD</span>
          <h1>Quản lý bài thi tiếng Anh</h1>
          <p>Tạo bài thi, quản lý câu hỏi và theo dõi kết quả học viên.</p>
        </div>
        <Link className="button button-primary" to="/admin/quizzes/new">
          + Tạo bài thi mới
        </Link>
      </section>

      <section className="stats-grid four-columns">
        <div className="stat-card">
          <span>Tổng bài thi</span>
          <strong>{quizzes.length}</strong>
          <small>{quizzes.filter((quiz) => quiz.published).length} đang công khai</small>
        </div>
        <div className="stat-card">
          <span>Ngân hàng câu hỏi</span>
          <strong>{questions.length}</strong>
          <small>Thuộc tất cả bài thi</small>
        </div>
        <div className="stat-card">
          <span>Học viên</span>
          <strong>{learners.length}</strong>
          <small>Tài khoản role user</small>
        </div>
        <div className="stat-card">
          <span>Điểm trung bình</span>
          <strong>{averageScore}%</strong>
          <small>{attempts.length} lượt làm bài</small>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card admin-table-section">
        <div className="split-heading section-heading">
          <div>
            <h2>Danh sách bài thi</h2>
            <p>Quản lý trạng thái, nội dung và câu hỏi của từng bài.</p>
          </div>
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm bài thi..."
            aria-label="Tìm bài thi"
          />
        </div>

        {filteredQuizzes.length === 0 ? (
          <EmptyState
            title="Chưa có bài thi"
            description="Tạo bài thi đầu tiên để bắt đầu xây dựng ngân hàng câu hỏi."
            action={
              <Link className="button button-primary" to="/admin/quizzes/new">
                Tạo bài thi
              </Link>
            }
          />
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Bài thi</th>
                  <th>Cấp độ</th>
                  <th>Câu hỏi</th>
                  <th>Lượt làm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => {
                  const questionCount = questions.filter(
                    (question) => String(question.quizId) === String(quiz.id),
                  ).length;
                  const attemptCount = attempts.filter(
                    (attempt) => String(attempt.quizId) === String(quiz.id),
                  ).length;

                  return (
                    <tr key={quiz.id}>
                      <td>
                        <strong>{quiz.title}</strong>
                        <span className="table-subtext">
                          Cập nhật {formatDateTime(quiz.updatedAt || quiz.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className={`level-badge level-${quiz.level.toLowerCase()}`}>
                          {quiz.level}
                        </span>
                      </td>
                      <td>{questionCount}</td>
                      <td>{attemptCount}</td>
                      <td>
                        <button
                          className={`status-badge status-button ${
                            quiz.published ? 'published' : 'draft'
                          }`}
                          onClick={() => handleTogglePublished(quiz)}
                          title="Nhấn để đổi trạng thái"
                        >
                          {quiz.published ? 'Công khai' : 'Bản nháp'}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            className="button button-ghost button-sm"
                            to={`/admin/quizzes/${quiz.id}/questions`}
                          >
                            Câu hỏi
                          </Link>
                          <Link
                            className="button button-ghost button-sm"
                            to={`/admin/quizzes/${quiz.id}/results`}
                          >
                            Kết quả
                          </Link>
                          <Link
                            className="button button-ghost button-sm"
                            to={`/admin/quizzes/${quiz.id}/edit`}
                          >
                            Sửa
                          </Link>
                          <button
                            className="button button-danger-ghost button-sm"
                            onClick={() => handleDelete(quiz)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
