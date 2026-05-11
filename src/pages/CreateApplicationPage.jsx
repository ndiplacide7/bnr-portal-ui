import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApplication } from '../api/applications';
import Layout from '../components/Layout';

const LICENSE_TYPES = [
  'COMMERCIAL_BANK',
  'MICROFINANCE_INSTITUTION',
  'SAVINGS_AND_CREDIT_COOPERATIVE',
  'INSURANCE_COMPANY',
  'FOREX_BUREAU',
  'PAYMENT_SERVICE_PROVIDER',
];

export default function CreateApplicationPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ registrationId: '', institutionName: '', licenseType: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await createApplication(form);
      navigate(`/applications/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h5 className="mb-4">New License Application</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Registration ID <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" required
                    maxLength={9} pattern="\d{9}" placeholder="9-digit number"
                    value={form.registrationId}
                    onChange={(e) => setForm({ ...form, registrationId: e.target.value.replace(/\D/g, '').slice(0, 9) })} />
                  <div className="form-text">Unique 9-digit identifier of the institution.</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Institution Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" required
                    value={form.institutionName}
                    onChange={(e) => setForm({ ...form, institutionName: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="form-label">License Type <span className="text-danger">*</span></label>
                  <select className="form-select" required
                    value={form.licenseType}
                    onChange={(e) => setForm({ ...form, licenseType: e.target.value })}>
                    <option value="">Select a license type…</option>
                    {LICENSE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Application'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
