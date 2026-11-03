import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import RFQForm from '../components/RFQForm';
import useRecord from '../hooks/useRecord';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const RFQFormPage = () => {
  const { id } = useParams();
  const { record, loading, error } = useRecord(id ? `/rfqs/${id}` : null, 'rfq');
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const response = await apiClient.get('/items');
        if (active) setCatalog(response.data.items);
      } catch (requestError) {
        if (active) setCatalogError(getApiErrorMessage(requestError, 'Unable to load catalog.'));
      } finally { if (active) setCatalogLoading(false); }
    };
    loadCatalog();
    return () => { active = false; };
  }, []);
  const save = async (data) => {
    setSaving(true);
    setSaveError('');
    try {
      const response = id ? await apiClient.put(`/rfqs/${id}`, data) : await apiClient.post('/rfqs', data);
      navigate(`/rfqs/${response.data.rfq._id}`, { replace: true });
    } catch (requestError) { setSaveError(getApiErrorMessage(requestError, 'Unable to save RFQ.')); }
    finally { setSaving(false); }
  };
  return (
    <main className="container py-4">
      <h1>{id ? 'Edit RFQ' : 'Create RFQ'}</h1>
      <Link className="btn btn-outline-secondary mb-3" to="/rfqs">Cancel</Link>
      {loading || catalogLoading ? <p>Loading RFQ form...</p> : error || catalogError ? <div role="alert" className="alert alert-danger">{error || catalogError}</div> : <RFQForm key={record?._id || 'new'} rfq={record} catalog={catalog} onSubmit={save} saving={saving} error={saveError} />}
    </main>
  );
};

export default RFQFormPage;
