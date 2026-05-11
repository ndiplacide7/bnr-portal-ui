import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ApplicationsPage from './pages/ApplicationsPage';
import CreateApplicationPage from './pages/CreateApplicationPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AuditLogsPage from './pages/AuditLogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/applications" element={
            <ProtectedRoute><ApplicationsPage /></ProtectedRoute>
          } />
          <Route path="/applications/new" element={
            <ProtectedRoute allowedRoles={['APPLICANT']}><CreateApplicationPage /></ProtectedRoute>
          } />
          <Route path="/applications/:id" element={
            <ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}><AdminUsersPage /></ProtectedRoute>
          } />
          <Route path="/audit-logs" element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER']}>
              <AuditLogsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/applications" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
