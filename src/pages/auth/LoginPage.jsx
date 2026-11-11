import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
    setSubmitting(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      const requestedPath = location.state?.from?.pathname;
      navigate(
        requestedPath || (loggedInUser.role === 'admin' ? '/admin' : '/quizzes'),
        { replace: true },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel auth-intro">
        <div className="auth-intro-content">
          <span className="eyebrow">ENGLISH QUIZ PLATFORM</span>
          <h1>Kiểm tra tiếng Anh theo cách trực quan và dễ quản lý.</h1>
          <p>
            Học viên làm bài, nhận điểm và xem lại đáp án. Quản trị viên có thể tạo
            bài thi và quản lý toàn bộ ngân hàng câu hỏi.
          </p>
          <div className="demo-accounts">
            <div>
              <strong>Admin demo</strong>
              <span>admin@example.com / 123456</span>
            </div>
            <div>
              <strong>User demo</strong>
              <span>user@example.com / 123456</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-logo">EQ</div>
          <h2>Đăng nhập</h2>
          <p className="muted">Nhập thông tin để tiếp tục vào hệ thống.</p>

          <Alert>{error}</Alert>

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
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
            />
          </label>

          <button className="button button-primary button-block" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký học viên</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
