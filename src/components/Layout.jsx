import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = async () => {
    try { await logout(); } finally {
      signOut();
      navigate('/login');
    }
  };

  const showApplications = ['APPLICANT', 'REVIEWER', 'COMPLIANCE_OFFICER', 'APPROVER', 'SYSTEM_ADMIN'].includes(role);
  const showNewApp      = role === 'APPLICANT';
  const showUsers       = role === 'SYSTEM_ADMIN';
  const showAuditLogs   = ['SYSTEM_ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER'].includes(role);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
        <span className="navbar-brand fw-semibold">BNR Licensing Portal</span>
        <div className="navbar-nav me-auto">
          {showApplications && <Link className="nav-link" to="/applications">Applications</Link>}
          {showNewApp       && <Link className="nav-link" to="/applications/new">New Application</Link>}
          {showUsers        && <Link className="nav-link" to="/admin/users">Users</Link>}
          {showAuditLogs    && <Link className="nav-link" to="/audit-logs">Audit Logs</Link>}
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-white small">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="badge bg-light text-primary">{role?.replace(/_/g, ' ')}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="container-fluid p-4">{children}</div>
    </>
  );
}
