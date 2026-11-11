import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import QuestionManagerPage from './pages/admin/QuestionManagerPage';
import QuizFormPage from './pages/admin/QuizFormPage';
import QuizResultsPage from './pages/admin/QuizResultsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import HistoryPage from './pages/user/HistoryPage';
import HomePage from './pages/user/HomePage';
import QuizAttemptPage from './pages/user/QuizAttemptPage';
import QuizDetailPage from './pages/user/QuizDetailPage';
import ResultPage from './pages/user/ResultPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { useAuth } from './context/AuthContext';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/quizzes'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardRedirect />} />

          <Route element={<RoleRoute allowedRoles={['user']} />}>
            <Route path="quizzes" element={<HomePage />} />
            <Route path="quizzes/:quizId" element={<QuizDetailPage />} />
            <Route path="quizzes/:quizId/take" element={<QuizAttemptPage />} />
            <Route path="results/:attemptId" element={<ResultPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/quizzes/new" element={<QuizFormPage />} />
            <Route path="admin/quizzes/:quizId/edit" element={<QuizFormPage />} />
            <Route
              path="admin/quizzes/:quizId/questions"
              element={<QuestionManagerPage />}
            />
            <Route
              path="admin/quizzes/:quizId/results"
              element={<QuizResultsPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
