import { useState } from 'react';
import apiClient from '../api/apiClient';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const WinnerSelection = ({ rfq, quotations, onSelected }) => {
  const [candidate, setCandidate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const confirmSelection = async () => {
    setSaving(true);
    setError('');
    try {
      await apiClient.put(`/quotations/${candidate._id}/select`);
      setCandidate(null);
      onSelected();
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Unable to select quotation.')); }
    finally { setSaving(false); }
  };
  return (
    <section className="winner-selection" aria-label="Manual winner selection">
      <h2 className="h4">Select Quotation</h2>
      <p>The final decision is yours. No quotation is selected automatically.</p>
      {error && <p role="alert">{error}</p>}
      <div className="d-flex flex-wrap gap-2 mb-3">{quotations.map((quotation) => (
        <button key={quotation._id} type="button" className={`btn btn-outline-primary${rfq.selectedQuotationId === quotation._id ? ' selected-winner' : ''}`} disabled={saving || !['Open', 'Under Comparison', 'Completed'].includes(rfq.status) || rfq.selectedQuotationId === quotation._id}
          onClick={() => setCandidate(quotation)}>
          {rfq.selectedQuotationId === quotation._id ? 'Selected winner' : 'Select Quotation'} — {quotation.supplier.name} ({quotation.quotationReference || quotation._id})
          <span className="d-block">{quotation.grandTotal} JD</span>
        </button>
      ))}</div>
      {candidate && <section role="alertdialog" aria-label="Winner selection confirmation" className="border p-3 mb-3">
        <p>{rfq.selectedQuotationId ? 'Change the selected quotation? This removes the previous RFQ supplier rating; it will not be transferred to the new supplier.' : 'Select this quotation and complete the RFQ?'} — {candidate.supplier.name}</p>
        <button type="button" className="btn btn-primary me-2" disabled={saving} onClick={confirmSelection}>{saving ? 'Selecting...' : 'Confirm Selection'}</button>
        <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setCandidate(null)}>Cancel Selection</button>
      </section>}
    </section>
  );
};

export default WinnerSelection;
