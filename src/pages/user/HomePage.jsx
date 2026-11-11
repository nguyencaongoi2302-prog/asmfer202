import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import QuizCard from '../../components/QuizCard';
import { useAuth } from '../../context/AuthContext';
import { attemptApi, questionApi, quizApi } from '../../services/api';

export default function HomePage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [quizData, questionData, attemptData] = await Promise.all([
          quizApi.getPublished(),
          questionApi.getAll(),
          attemptApi.getByUser(user.id),
        ]);
        setQuizzes(quizData);
        setQuestions(questionData);
        setAttempts(attemptData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id]);

  const filteredQuizzes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      const matchesSearch =
        !keyword ||
        quiz.title.toLowerCase().includes(keyword) ||
        quiz.description.toLowerCase().includes(keyword);
      const matchesLevel = level === 'all' || quiz.level === level;
      return matchesSearch && matchesLevel;
    });
  }, [quizzes, search, level]);

  if (loading) return <Loading />;

  return (
    <div className="container page-stack">
      <section className="hero-card">
        <div>
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Xin chào, {user.fullName}!</h1>
          <p>Chọn một bài thi, kiểm tra kiến thức và xem lại kết quả ngay sau khi nộp.</p>
        </div>
        <div className="hero-stat">
          <strong>{attempts.length}</strong>
          <span>Lượt đã làm</span>
        </div>
      </section>

      <section className="section-heading split-heading">
        <div>
          <h2>Danh sách bài thi</h2>
          <p>Các bài đang được quản trị viên công khai.</p>
        </div>
        <div className="filter-row">
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm bài thi..."
            aria-label="Tìm bài thi"
          />
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="all">Tất cả cấp độ</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </select>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {filteredQuizzes.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài thi"
          description="Hãy thử thay đổi từ khóa hoặc bộ lọc cấp độ."
        />
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => {
            const quizAttempts = attempts.filter(
              (attempt) => String(attempt.quizId) === String(quiz.id),
            );
            return (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                questionCount={questions.filter(
                  (question) => String(question.quizId) === String(quiz.id),
                ).length}
                latestAttempt={quizAttempts[0]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
