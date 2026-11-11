import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { quizApi } from '../../services/api';

const initialForm = {
  title: '',
  description: '',
  level: 'A2',
  durationMinutes: 10,
  passingScore: 70,
  published: false,
};

export default function QuizFormPage() {
  const { quizId } = useParams();
  const isEditing = Boolean(quizId);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    async function loadQuiz() {
      try {
        const quiz = await quizApi.getById(quizId);
        setForm({
          title: quiz.title,
          description: quiz.description,
          level: quiz.level,
          durationMinutes: quiz.durationMinutes,
          passingScore: quiz.passingScore,
          published: quiz.published,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [isEditing, quizId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        durationMinutes: Number(form.durationMinutes),
        passingScore: Number(form.passingScore),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await quizApi.update(quizId, payload);
        navigate('/admin');
      } else {
        const created = await quizApi.create({
          ...payload,
          createdAt: new Date().toISOString(),
        });
        navigate(`/admin/quizzes/${created.id}/questions`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container narrow-container page-stack">
      <Link className="back-link" to="/admin">
        ← Quay lại trang quản trị
      </Link>

      <section className="section-heading">
        <span className="eyebrow">QUIZ INFORMATION</span>
        <h1>{isEditing ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}</h1>
        <p>
          Khai báo thông tin chung. Sau khi tạo, bạn sẽ được chuyển sang màn hình thêm
          câu hỏi.
        </p>
      </section>

      <form className="card form-card" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>

        <label className="form-field">
          <span>Tên bài thi</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ví dụ: English Grammar - Present Tenses"
            required
            minLength="4"
          />
        </label>

        <label className="form-field">
          <span>Mô tả</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả ngắn về nội dung và mục tiêu của bài thi..."
            rows="4"
            required
          />
        </label>

        <div className="form-grid three-columns">
          <label className="form-field">
            <span>Cấp độ</span>
            <select name="level" value={form.level} onChange={handleChange}>
              <option value="A1">A1 - Beginner</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper Intermediate</option>
              <option value="C1">C1 - Advanced</option>
            </select>
          </label>

          <label className="form-field">
            <span>Thời gian (phút)</span>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              min="1"
              max="180"
              required
            />
          </label>

          <label className="form-field">
            <span>Điểm đạt (%)</span>
            <input
              type="number"
              name="passingScore"
              value={form.passingScore}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </label>
        </div>

        <label className="switch-field">
          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          <span className="switch-control" />
          <span>
            <strong>Công khai bài thi</strong>
            <small>Học viên có thể nhìn thấy và làm bài ngay.</small>
          </span>
        </label>

        <div className="form-actions">
          <Link className="button button-secondary" to="/admin">
            Hủy
          </Link>
          <button className="button button-primary" disabled={submitting}>
            {submitting
              ? 'Đang lưu...'
              : isEditing
                ? 'Lưu thay đổi'
                : 'Tạo và thêm câu hỏi'}
          </button>
        </div>
      </form>
    </div>
  );
}
