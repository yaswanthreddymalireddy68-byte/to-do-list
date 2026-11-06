import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { AuthPage, DashboardPage, LandingPage, ProfilePage, TasksPage } from './pages/Pages';

export default function App() {
  return <AuthProvider><ToastProvider><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="today" element={<TasksPage mode="today" />} />
        <Route path="pending" element={<TasksPage mode="pending" />} />
        <Route path="upcoming" element={<TasksPage mode="upcoming" />} />
        <Route path="overdue" element={<TasksPage mode="overdue" />} />
        <Route path="completed" element={<TasksPage mode="completed" />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ToastProvider></AuthProvider>;
}
