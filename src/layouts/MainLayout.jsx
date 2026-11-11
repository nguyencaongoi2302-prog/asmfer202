import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink className="brand" to={user.role === 'admin' ? '/admin' : '/quizzes'}>
            <span className="brand-mark">EQ</span>
            <span>
              <strong>English Quiz Hub</strong>
              <small>Learn · Practice · Improve</small>
            </span>
          </NavLink>

          <nav className="main-nav" aria-label="Điều hướng chính">
            {user.role === 'admin' ? (
              <>
                <NavLink to="/admin" end>
                  Quản trị
                </NavLink>
                <NavLink to="/admin/quizzes/new">Tạo bài thi</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/quizzes">Bài thi</NavLink>
                <NavLink to="/history">Lịch sử</NavLink>
              </>
            )}
          </nav>

          <div className="account-menu">
            <div className="account-copy">
              <strong>{user.fullName}</strong>
              <span>{user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</span>
            </div>
            <button className="button button-ghost button-sm" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">English Quiz Hub · ReactJS + JSON Server</div>
      </footer>
    </div>
  );
}
