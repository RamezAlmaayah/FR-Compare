import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import useRecord from '../hooks/useRecord';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const CompletedDecision = ({ rfq }) => {
  const [reload, setReload] = useState(0);
  const { record: quotation, loading, error } = useRecord(`/quotations/${rfq.selectedQuotationId}`, 'quotation');
  const supplierState = useRecord(quotation?.supplierId?._id ? `/suppliers/${quotation.supplierId._id}` : null, 'supplier', reload);
  const [rating, setRating] = useState('3');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const savedRating = supplierState.record?.ratings.find((entry) => entry.rfqId === rfq._id);
  const submitRating = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await apiClient.post(`/suppliers/${quotation.supplierId._id}/ratings`, { rfqId: rfq._id, rating: Number(rating), note });
      setReload((value) => value + 1);
    } catch (requestError) { setSaveError(getApiErrorMessage(requestError, 'Unable to save supplier rating.')); }
    finally { setSaving(false); }
  };
  return (
    <section className="decision-panel mb-3" aria-label="Completed purchasing decision">
      <h2 className="h4">Selected Winner</h2>
      {loading || supplierState.loading ? <p>Loading selected supplier...</p> : error || supplierState.error ? <p role="alert">{error || supplierState.error}</p> : quotation && <>
        <p><Link to={`/quotations/${quotation._id}`}>{quotation.quotationReference || quotation._id}</Link> — {quotation.supplierId?.name} — {quotation.grandTotal} JD</p>
        {saveError && <p role="alert">{saveError}</p>}
        {savedRating ? <p role="status">Saved rating: {savedRating.rating}/5. {savedRating.note || 'No note.'} Only one rating is allowed per RFQ.</p> : <form onSubmit={submitRating}>
          <h3 className="h5">Rate Supplier</h3>
          <label htmlFor="supplierRating">Rating (1–5)</label>
          <select id="supplierRating" className="form-select mb-3" value={rating} onChange={(event) => setRating(event.target.value)}>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <label htmlFor="ratingNote">Note (optional)</label><textarea id="ratingNote" className="form-control mb-3" value={note} onChange={(event) => setNote(event.target.value)} />
          <button className="btn btn-outline-primary" type="submit" disabled={saving}>{saving ? 'Saving rating...' : 'Save Rating'}</button>
        </form>}
      </>}
    </section>
  );
};

export default CompletedDecision;
