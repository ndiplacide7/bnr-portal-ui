import { useState, useEffect } from 'react';
import { listAuditLogs } from '../api/admin';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import Pagination from '../components/Pagination';

const SEVERITY_COLOR = { INFO: 'secondary', WARNING: 'warning text-dark', CRITICAL: 'danger' };

export default function AuditLogsPage() {
  const [data, setData]       = useState(null);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    listAuditLogs(page)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load audit logs.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <h5 className="mb-4">Audit Logs</h5>
      {error && <ErrorAlert message={error} />}
      {loading ? <Spinner /> : (
        <>
          {data?.content?.length === 0
            ? <EmptyState message="No audit logs found." />
            : (
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Application ID</th>
                      <th>Severity</th>
                      <th>IP Address</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((log) => (
                      <tr key={log.id}>
                        <td><code className="small">{log.action}</code></td>
                        <td className="small">{log.actor?.email}</td>
                        <td className="text-muted small font-monospace">
                          {log.applicationId
                            ? log.applicationId.slice(0, 8) + '…'
                            : '—'}
                        </td>
                        <td>
                          <span className={`badge bg-${SEVERITY_COLOR[log.severity] ?? 'secondary'}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="text-muted small">{log.ipAddress}</td>
                        <td className="text-muted small">{new Date(log.createdAt).toLocaleString()}</td>
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
