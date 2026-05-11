import { useState, useEffect } from 'react';
import { listUsers, createUser, deactivateUser } from '../api/admin';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import Pagination from '../components/Pagination';

const ROLES = ['APPLICANT', 'REVIEWER', 'APPROVER', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN', 'AUDITOR'];
const EMPTY = { email: '', firstName: '', lastName: '', role: '', temporaryPassword: '' };

export default function AdminUsersPage() {
  const [data, setData]         = useState(null);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = (p = 0) => {
    setLoading(true);
    listUsers(p)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await createUser(form);
      setShowModal(false);
      setForm(EMPTY);
      fetchUsers(0);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user account?')) return;
    try { await deactivateUser(userId); fetchUsers(page); }
    catch { alert('Failed to deactivate user.'); }
  };

  const closeModal = () => { setShowModal(false); setForm(EMPTY); setFormError(''); };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">User Management</h5>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Create User
        </button>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? <Spinner /> : (
        <>
          {data?.content?.length === 0
            ? <EmptyState message="No users found." />
            : (
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr>
                </thead>
                <tbody>
                  {data.content.map((u) => (
                    <tr key={u.id}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td className="text-muted small">{u.email}</td>
                      <td><span className="badge bg-secondary">{u.role?.replace(/_/g, ' ')}</span></td>
                      <td>
                        <span className={`badge bg-${u.active ? 'success' : 'danger'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                      </td>
                      <td>
                        {u.active && (
                          <button className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeactivate(u.id)}>
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
          <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      )}

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Create New User</h6>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" required
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-control" required
                        value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                    <div className="col">
                      <label className="form-label">Last Name</label>
                      <input type="text" className="form-control" required
                        value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" required
                      value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="">Select role…</option>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Temporary Password</label>
                    <input type="text" className="form-control" required
                      value={form.temporaryPassword}
                      onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Creating…' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
