import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import QuotationForm from '../components/QuotationForm';
import useRecord from '../hooks/useRecord';
import useSupplierOptions from '../hooks/useSupplierOptions';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const QuotationFormPage = ({ editing = false }) => {
  const { id } = useParams();
  const quotationState = useRecord(editing ? `/quotations/${id}` : null, 'quotation');
  const rfqId = editing ? quotationState.record?.rfqId?._id : id;
  const rfqState = useRecord(rfqId ? `/rfqs/${rfqId}` : null, 'rfq');
  const supplierState = useSupplierOptions();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();
  const handleSave = async (data) => {
    setSaving(true);
    setSaveError('');
    try {
      const response = editing ? await apiClient.put(`/quotations/${id}`, data) : await apiClient.post('/quotations', data);
      navigate(`/quotations/${response.data.quotation._id}`, { replace: true });
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to save quotation.'));
    } finally { setSaving(false); }
  };
  const error = quotationState.error || rfqState.error || supplierState.error;
  const loading = quotationState.loading || rfqState.loading || supplierState.loading;
  const rfq = rfqState.record;
  const blocked = !editing && rfq && !['Open', 'Under Comparison'].includes(rfq.status);
  return (
    <main className="container py-4">
      <h1>{editing ? 'Edit Quotation' : 'Add Quotation'}</h1>
      <Link to={rfqId ? `/rfqs/${rfqId}` : '/rfqs'} className="btn btn-outline-secondary mb-3">Cancel</Link>
      {loading ? <p>Loading quotation form...</p> : error || !rfq ? (
        <div className="alert alert-danger" role="alert">{error || 'RFQ unavailable.'}</div>
      ) : blocked ? <p role="alert">Open the RFQ before adding quotations. Cancelled or completed RFQs cannot receive quotations.</p>
        : !supplierState.suppliers.length ? <p>No suppliers yet. <Link to="/suppliers/new">Add a supplier</Link> first.</p>
          : <><p>RFQ: {rfq.referenceNumber} — {rfq.title}</p>
            <QuotationForm key={quotationState.record?._id || rfq._id} rfq={rfq} suppliers={supplierState.suppliers}
              quotation={quotationState.record} saving={saving} error={saveError} onSubmit={handleSave} /></>}
    </main>
  );
};

export default QuotationFormPage;
