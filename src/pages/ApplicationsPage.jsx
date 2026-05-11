import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listApplications } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import Pagination from '../components/Pagination';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    listApplications(page)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Applications</h5>
        {user?.role === 'APPLICANT' && (
          <Link to="/applications/new" className="btn btn-primary btn-sm">+ New Application</Link>
        )}
      </div>

      {loading && <Spinner />}
      {error   && <ErrorAlert message={error} />}

      {!loading && !error && (
        <>
          {data?.content?.length === 0
            ? <EmptyState message="No applications found." />
            : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Institution</th>
                      <th>License Type</th>
                      <th>Status</th>
                      <th>Applicant</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((app) => (
                      <tr key={app.id}>
                        <td className="fw-medium">{app.institutionName}</td>
                        <td className="text-muted small">{app.licenseType?.replace(/_/g, ' ')}</td>
                        <td><StatusBadge status={app.status} /></td>
                        <td className="small">{app.applicant?.firstName} {app.applicant?.lastName}</td>
                        <td className="text-muted small">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/applications/${app.id}`} className="btn btn-outline-secondary btn-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
