import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ItemForm from '../components/ItemForm';
import useRecord from '../hooks/useRecord';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const ItemFormPage = () => {
  const { id } = useParams();
  const { record, loading, error } = useRecord(id ? `/items/${id}` : null, 'item');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();
  const save = async (data) => {
    setSaving(true);
    setSaveError('');
    try {
      if (id) await apiClient.put(`/items/${id}`, data);
      else await apiClient.post('/items', data);
      navigate('/items', { replace: true });
    } catch (requestError) {
      setSaveError(getApiErrorMessage(requestError, 'Unable to save item.'));
    } finally { setSaving(false); }
  };
  return (
    <main className="container py-4">
      <section className="mx-auto supplier-form-panel">
        <h1>{id ? 'Edit Item' : 'Add Item'}</h1>
        <Link to="/items" className="btn btn-outline-secondary mb-3">Cancel</Link>
        {loading ? <p>Loading item...</p> : error ? <div role="alert" className="alert alert-danger">{error}</div> : (
          <ItemForm key={record?._id || 'new'} item={record} onSubmit={save} saving={saving} error={saveError} />
        )}
      </section>
    </main>
  );
};

export default ItemFormPage;
