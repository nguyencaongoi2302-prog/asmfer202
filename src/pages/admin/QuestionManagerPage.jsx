import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { questionApi, quizApi } from '../../services/api';

const emptyQuestion = {
  content: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOptionId: 'A',
  explanation: '',
  points: 1,
};

function questionToForm(question) {
  const optionMap = Object.fromEntries(question.options.map((option) => [option.id, option.text]));
  return {
    content: question.content,
    optionA: optionMap.A || '',
    optionB: optionMap.B || '',
    optionC: optionMap.C || '',
    optionD: optionMap.D || '',
    correctOptionId: question.correctOptionId,
    explanation: question.explanation || '',
    points: question.points || 1,
  };
}

export default function QuestionManagerPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyQuestion);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [quizData, questionData] = await Promise.all([
        quizApi.getById(quizId),
        questionApi.getByQuiz(quizId),
      ]);
      setQuiz(quizData);
      setQuestions(questionData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quizId]);

  const totalPoints = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.points || 1), 0),
    [questions],
  );

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyQuestion);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const options = ['A', 'B', 'C', 'D'].map((id) => ({
      id,
      text: form[`option${id}`].trim(),
    }));

    if (new Set(options.map((option) => option.text.toLowerCase())).size < 4) {
      setError('Bốn đáp án cần khác nhau.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        quizId: Number.isNaN(Number(quizId)) ? quizId : Number(quizId),
        content: form.content.trim(),
        options,
        correctOptionId: form.correctOptionId,
        explanation: form.explanation.trim(),
        points: Number(form.points),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await questionApi.update(editingId, payload);
        setSuccess('Đã cập nhật câu hỏi.');
      } else {
        await questionApi.create({
          ...payload,
          order: questions.length + 1,
          createdAt: new Date().toISOString(),
        });
        setSuccess('Đã thêm câu hỏi mới.');
      }

      resetForm();
      await loadData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setForm(questionToForm(question));
    setSuccess('');
    setError('');
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (question) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      await questionApi.remove(question.id);
      const remaining = questions.filter((item) => item.id !== question.id);
      await Promise.all(
        remaining.map((item, index) =>
          item.order === index + 1
            ? Promise.resolve()
            : questionApi.update(item.id, { order: index + 1 }),
        ),
      );
      await loadData();
      if (editingId === question.id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const moveQuestion = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const current = questions[index];
    const target = questions[targetIndex];
    try {
      await Promise.all([
        questionApi.update(current.id, { order: target.order }),
        questionApi.update(target.id, { order: current.order }),
      ]);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;
  if (!quiz) return <div className="container alert alert-error">Không tìm thấy bài thi.</div>;

  return (
    <div className="container page-stack">
      <div className="split-heading admin-heading">
        <div>
          <Link className="back-link" to="/admin">
            ← Quay lại trang quản trị
          </Link>
          <span className="eyebrow">QUESTION BANK</span>
          <h1>Quản lý câu hỏi</h1>
          <p>{quiz.title}</p>
        </div>
        <div className="inline-stats">
          <div>
            <strong>{questions.length}</strong>
            <span>Câu hỏi</span>
          </div>
          <div>
            <strong>{totalPoints}</strong>
            <span>Tổng điểm</span>
          </div>
        </div>
      </div>

      <div className="admin-two-column">
        <form id="question-form" className="card form-card sticky-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>{editingId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
            <p>Nhập nội dung, bốn lựa chọn và đánh dấu đáp án đúng.</p>
          </div>

          <Alert>{error}</Alert>
          <Alert type="success">{success}</Alert>

          <label className="form-field">
            <span>Nội dung câu hỏi</span>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows="3"
              placeholder="Ví dụ: She ____ to school every day."
              required
            />
          </label>

          <div className="option-editor-grid">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <label className="form-field option-editor" key={letter}>
                <span>Đáp án {letter}</span>
                <div>
                  <strong>{letter}</strong>
                  <input
                    name={`option${letter}`}
                    value={form[`option${letter}`]}
                    onChange={handleChange}
                    placeholder={`Nội dung đáp án ${letter}`}
                    required
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="form-grid two-columns">
            <label className="form-field">
              <span>Đáp án đúng</span>
              <select
                name="correctOptionId"
                value={form.correctOptionId}
                onChange={handleChange}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </label>

            <label className="form-field">
              <span>Điểm</span>
              <input
                type="number"
                name="points"
                value={form.points}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </label>
          </div>

          <label className="form-field">
            <span>Giải thích đáp án</span>
            <textarea
              name="explanation"
              value={form.explanation}
              onChange={handleChange}
              rows="3"
              placeholder="Giải thích ngắn giúp học viên hiểu kiến thức..."
            />
          </label>

          <div className="form-actions">
            {editingId && (
              <button type="button" className="button button-secondary" onClick={resetForm}>
                Hủy chỉnh sửa
              </button>
            )}
            <button className="button button-primary" disabled={submitting}>
              {submitting
                ? 'Đang lưu...'
                : editingId
                  ? 'Cập nhật câu hỏi'
                  : '+ Thêm câu hỏi'}
            </button>
          </div>
        </form>

        <section className="question-list-section">
          <div className="section-heading">
            <h2>Danh sách câu hỏi</h2>
            <p>Sắp xếp, chỉnh sửa hoặc xóa câu hỏi khỏi bài thi.</p>
          </div>

          {questions.length === 0 ? (
            <EmptyState
              title="Bài thi chưa có câu hỏi"
              description="Sử dụng biểu mẫu bên cạnh để thêm câu hỏi đầu tiên."
            />
          ) : (
            <div className="admin-question-list">
              {questions.map((question, index) => {
                const correct = question.options.find(
                  (option) => option.id === question.correctOptionId,
                );
                return (
                  <article className="admin-question-card card" key={question.id}>
                    <div className="admin-question-heading">
                      <span className="question-index">{index + 1}</span>
                      <div>
                        <h3>{question.content}</h3>
                        <span className="muted">{question.points || 1} điểm</span>
                      </div>
                    </div>
                    <div className="mini-options">
                      {question.options.map((option) => (
                        <span
                          key={option.id}
                          className={option.id === question.correctOptionId ? 'correct' : ''}
                        >
                          <strong>{option.id}</strong> {option.text}
                        </span>
                      ))}
                    </div>
                    <div className="correct-line">
                      Đáp án đúng: <strong>{correct?.id}. {correct?.text}</strong>
                    </div>
                    <div className="card-actions split-actions">
                      <div>
                        <button
                          className="icon-button"
                          disabled={index === 0}
                          onClick={() => moveQuestion(index, -1)}
                          title="Di chuyển lên"
                        >
                          ↑
                        </button>
                        <button
                          className="icon-button"
                          disabled={index === questions.length - 1}
                          onClick={() => moveQuestion(index, 1)}
                          title="Di chuyển xuống"
                        >
                          ↓
                        </button>
                      </div>
                      <div>
                        <button
                          className="button button-ghost button-sm"
                          onClick={() => handleEdit(question)}
                        >
                          Sửa
                        </button>
                        <button
                          className="button button-danger-ghost button-sm"
                          onClick={() => handleDelete(question)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
