import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getApplication, submitApplication, assignReviewer,
  completeReview, decideApplication, withdrawApplication,
} from '../api/applications';
import { listDocuments, uploadDocument } from '../api/documents';
import { listAuditLogsForApplication } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';

const DOCUMENT_TYPES = [
  'BUSINESS_PLAN', 'INCORPORATION_CERTIFICATE', 'FINANCIAL_STATEMENTS',
  'BOARD_RESOLUTION', 'REGULATORY_COMPLIANCE_REPORT', 'IDENTITY_DOCUMENT', 'OTHER',
];

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;

  const [app, setApp]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab]               = useState('details');
  const [docs, setDocs]             = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [auditLogs, setAuditLogs]   = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // action form state
  const [reviewerId, setReviewerId]   = useState('');
  const [decision, setDecision]       = useState('APPROVED');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [uploadFile, setUploadFile]   = useState(null);
  const [uploadType, setUploadType]   = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchApp = useCallback(() => {
    setLoading(true);
    setError('');
    getApplication(id)
      .then((res) => setApp(res.data))
      .catch(() => setError('Failed to load application.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  useEffect(() => {
    if (tab === 'documents') {
      setDocsLoading(true);
      listDocuments(id)
        .then((res) => setDocs(res.data))
        .catch(() => {})
        .finally(() => setDocsLoading(false));
    }
    if (tab === 'audit') {
      setAuditLoading(true);
      listAuditLogsForApplication(id)
        .then((res) => setAuditLogs(res.data.content ?? []))
        .catch(() => {})
        .finally(() => setAuditLoading(false));
    }
  }, [tab, id]);

  const runAction = async (fn) => {
    setActionError('');
    setActionLoading(true);
    try { await fn(); fetchApp(); }
    catch (err) { setActionError(err.response?.data?.detail || err.response?.data?.message || 'Action failed.'); }
    finally { setActionLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadLoading(true);
    try {
      await uploadDocument(id, uploadFile, uploadType);
      setUploadFile(null);
      setUploadType('');
      const res = await listDocuments(id);
      setDocs(res.data);
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  if (error)   return <Layout><ErrorAlert message={error} /></Layout>;

  const status = app?.status;
  const canSubmit        = role === 'APPLICANT'                              && status === 'DRAFT';
  const canAssign        = ['REVIEWER', 'COMPLIANCE_OFFICER'].includes(role) && status === 'SUBMITTED';
  const canCompleteReview = role === 'REVIEWER'                              && status === 'UNDER_REVIEW';
  const canDecide        = role === 'APPROVER'                               && status === 'REVIEW_COMPLETED';
  const canWithdraw      = role === 'APPLICANT'  && ['DRAFT', 'SUBMITTED'].includes(status);
  const canUpload        = role === 'APPLICANT'  && ['DRAFT', 'SUBMITTED'].includes(status);
  const canSeeAudit      = ['SYSTEM_ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER'].includes(role);

  return (
    <Layout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1">{app.institutionName}</h5>
          <span className="text-muted small">{app.licenseType?.replace(/_/g, ' ')}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {actionError && <ErrorAlert message={actionError} />}

      {/* ── Actions ───────────────────────────────────────── */}
      {canSubmit && (
        <div className="mb-3">
          <button className="btn btn-success btn-sm" disabled={actionLoading}
            onClick={() => runAction(() => submitApplication(id))}>
            Submit Application
          </button>
        </div>
      )}

      {canAssign && (
        <div className="card mb-3">
          <div className="card-body py-3">
            <h6 className="mb-2">Assign Reviewer</h6>
            <div className="input-group input-group-sm">
              <input type="text" className="form-control" placeholder="Reviewer UUID"
                value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} />
              <button className="btn btn-primary" disabled={actionLoading || !reviewerId.trim()}
                onClick={() => runAction(() => assignReviewer(id, reviewerId))}>
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {canCompleteReview && (
        <div className="mb-3">
          <button className="btn btn-primary btn-sm" disabled={actionLoading}
            onClick={() => runAction(() => completeReview(id))}>
            Mark Review Complete
          </button>
        </div>
      )}

      {canDecide && (
        <div className="card mb-3">
          <div className="card-body py-3">
            <h6 className="mb-2">Final Decision</h6>
            <div className="mb-2">
              {['APPROVED', 'REJECTED'].map((d) => (
                <div key={d} className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" id={d} value={d}
                    checked={decision === d} onChange={() => setDecision(d)} />
                  <label className={`form-check-label ${d === 'APPROVED' ? 'text-success' : 'text-danger'}`}
                    htmlFor={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</label>
                </div>
              ))}
            </div>
            <textarea className="form-control form-control-sm mb-2" rows={2}
              placeholder="Decision notes (required)"
              value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} />
            <button className="btn btn-primary btn-sm"
              disabled={actionLoading || !decisionNotes.trim()}
              onClick={() => runAction(() => decideApplication(id, { decision, decisionNotes }))}>
              Submit Decision
            </button>
          </div>
        </div>
      )}

      {canWithdraw && (
        <div className="card mb-3 border-danger">
          <div className="card-body py-3">
            <h6 className="mb-2 text-danger">Withdraw Application</h6>
            <div className="input-group input-group-sm">
              <input type="text" className="form-control" placeholder="Reason for withdrawal"
                value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} />
              <button className="btn btn-outline-danger"
                disabled={actionLoading || !withdrawReason.trim()}
                onClick={() => runAction(() => withdrawApplication(id, withdrawReason))}>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────── */}
      <ul className="nav nav-tabs mb-3 mt-2">
        {['details', 'documents', ...(canSeeAudit ? ['audit'] : [])].map((t) => (
          <li key={t} className="nav-item">
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Details tab ───────────────────────────────────── */}
      {tab === 'details' && (
        <div className="row">
          <div className="col-md-6">
            <table className="table table-sm">
              <tbody>
                <tr><td className="text-muted w-50">Registration ID</td>
                  <td><span className="font-monospace fw-semibold">{app.registrationId}</span></td></tr>
                <tr><td className="text-muted w-50">Applicant</td>
                  <td>{app.applicant?.firstName} {app.applicant?.lastName}</td></tr>
                {app.reviewer && (
                  <tr><td className="text-muted">Reviewer</td>
                    <td>{app.reviewer.firstName} {app.reviewer.lastName}</td></tr>
                )}
                {app.approver && (
                  <tr><td className="text-muted">Approver</td>
                    <td>{app.approver.firstName} {app.approver.lastName}</td></tr>
                )}
                <tr><td className="text-muted">Submitted At</td><td>{fmt(app.submittedAt)}</td></tr>
                <tr><td className="text-muted">Reviewed At</td><td>{fmt(app.reviewedAt)}</td></tr>
                <tr><td className="text-muted">Decided At</td><td>{fmt(app.decidedAt)}</td></tr>
                {app.decisionNotes && (
                  <tr><td className="text-muted">Decision Notes</td><td>{app.decisionNotes}</td></tr>
                )}
                {app.withdrawalReason && (
                  <tr><td className="text-muted">Withdrawal Reason</td><td>{app.withdrawalReason}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Documents tab ─────────────────────────────────── */}
      {tab === 'documents' && (
        <>
          {canUpload && (
            <div className="card mb-3">
              <div className="card-body py-3">
                <h6 className="mb-2">Upload Document</h6>
                {uploadError && <div className="alert alert-danger py-2 small">{uploadError}</div>}
                <form onSubmit={handleUpload} className="row g-2 align-items-end">
                  <div className="col-md-4">
                    <select className="form-select form-select-sm" required
                      value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                      <option value="">Document type…</option>
                      {DOCUMENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <input type="file" className="form-control form-control-sm" required
                      onChange={(e) => setUploadFile(e.target.files[0])} />
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-primary btn-sm w-100" disabled={uploadLoading}>
                      {uploadLoading ? 'Uploading…' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {docsLoading ? <Spinner /> : docs.length === 0
            ? <EmptyState message="No documents uploaded yet." />
            : (
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr><th>Type</th><th>File Name</th><th>Size</th><th>Uploaded</th></tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="small">{doc.documentType?.replace(/_/g, ' ')}</td>
                      <td className="small">{doc.originalName}</td>
                      <td className="text-muted small">{(doc.sizeBytes / 1024).toFixed(1)} KB</td>
                      <td className="text-muted small">{new Date(doc.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </>
      )}

      {/* ── Audit tab ─────────────────────────────────────── */}
      {tab === 'audit' && canSeeAudit && (
        auditLoading ? <Spinner /> : auditLogs.length === 0
          ? <EmptyState message="No audit events for this application." />
          : (
            <table className="table table-sm table-hover">
              <thead className="table-light">
                <tr><th>Action</th><th>Actor</th><th>Severity</th><th>IP</th><th>When</th></tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><code className="small">{log.action}</code></td>
                    <td className="small">{log.actor?.email}</td>
                    <td>
                      <span className={`badge bg-${log.severity === 'INFO' ? 'secondary' : log.severity === 'WARNING' ? 'warning text-dark' : 'danger'}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="text-muted small">{log.ipAddress}</td>
                    <td className="text-muted small">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}
    </Layout>
  );
}
