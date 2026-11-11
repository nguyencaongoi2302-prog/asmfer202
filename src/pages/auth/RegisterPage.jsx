import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/quizzes'} replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email,
        password: form.password,
      });
      navigate('/quizzes', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel auth-intro auth-intro-register">
        <div className="auth-intro-content">
          <span className="eyebrow">CREATE YOUR ACCOUNT</span>
          <h1>Bắt đầu luyện tập và theo dõi tiến bộ của bạn.</h1>
          <p>
            Tài khoản đăng ký tại đây luôn là tài khoản học viên. Chỉ quản trị viên
            được tạo và chỉnh sửa bài thi.
          </p>
        </div>
      </section>

      <section className="auth-panel auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-logo">EQ</div>
          <h2>Đăng ký học viên</h2>
          <p className="muted">Tạo tài khoản để tham gia các bài thi tiếng Anh.</p>

          <Alert>{error}</Alert>

          <label className="form-field">
            <span>Họ và tên</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              minLength="2"
              autoComplete="name"
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="form-field">
            <span>Mật khẩu</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              required
              minLength="6"
              autoComplete="new-password"
            />
          </label>

          <label className="form-field">
            <span>Xác nhận mật khẩu</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
              autoComplete="new-password"
            />
          </label>

          <button className="button button-primary button-block" disabled={submitting}>
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
