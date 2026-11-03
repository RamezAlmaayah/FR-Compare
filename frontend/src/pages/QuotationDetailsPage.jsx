import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { getImageUrl } from '../api/apiConfig';
import DeleteConfirmation from '../components/DeleteConfirmation';
import QuotationTotals from '../components/QuotationTotals';
import useRecord from '../hooks/useRecord';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import quotationDeleteWarning from '../utils/quotationDeleteWarning';
import StatusBadge from '../components/StatusBadge';
import formatDate from '../utils/formatDate';

const QuotationDetailsPage = () => {
  const { id } = useParams();
  const { record: quotation, loading, error } = useRecord(`/quotations/${id}`, 'quotation');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/quotations/${id}`);
      navigate(quotation.rfqId ? `/rfqs/${quotation.rfqId._id}` : '/rfqs', { replace: true });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Unable to delete quotation.'));
    } finally { setDeleting(false); setConfirming(false); }
  };
  if (loading) return <p className="container py-4">Loading quotation...</p>;
  if (error || !quotation) return <main className="container py-4"><div role="alert" className="alert alert-danger">{error || 'Quotation not found.'}</div><Link to="/rfqs">Back to RFQs</Link></main>;
  const information = [
    ['Supplier', quotation.supplierId?.name], ['RFQ', quotation.rfqId?.referenceNumber],
    ['Quotation Reference', quotation.quotationReference], ['Quotation Date', formatDate(quotation.quotationDate)],
    ['Valid Until', formatDate(quotation.validUntil)], ['Delivery Days', quotation.deliveryDays ?? 'Not provided'],
    ['Status', <StatusBadge status={quotation.status} />], ['Notes', quotation.notes], ['Created', formatDate(quotation.createdAt)],
  ];
  return (
    <main className="container py-4">
      <p className="eyebrow">Quotation Details</p>
      <h1>{quotation.quotationReference || 'Quotation Details'}</h1>
      <div className="d-flex gap-2 mb-3"><Link to={quotation.rfqId ? `/rfqs/${quotation.rfqId._id}` : '/rfqs'}>Back to RFQ</Link>
        <Link to={`/quotations/${id}/edit`}>Edit Quotation</Link>
        <button className="btn btn-outline-danger" type="button" onClick={() => setConfirming(true)}>Delete Quotation</button></div>
      {deleteError && <div role="alert" className="alert alert-danger">{deleteError}</div>}
      {confirming && <DeleteConfirmation recordName={`quotation "${quotation.quotationReference || id}"`} deleting={deleting}
        warning={quotationDeleteWarning(quotation)}
        onConfirm={handleDelete} onCancel={() => setConfirming(false)} />}
      <dl>{information.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value === '' || value == null ? 'Not provided' : value}</dd></div>)}</dl>
      <div className="table-responsive" tabIndex="0" aria-label="Scrollable quotation item prices"><table className="table table-bordered">
        <thead><tr>{['Item', 'Quantity', 'Unit Price', 'Line Total', 'Notes'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{quotation.itemPrices.map((item) => <tr key={item.rfqItemId}><td>{item.itemName}</td><td>{item.quantity}</td>
          <td>{item.unitPrice}</td><td>{item.lineTotal}</td><td>{item.notes || '—'}</td></tr>)}</tbody>
      </table></div>
      <QuotationTotals {...quotation} />
      {quotation.image && <img src={getImageUrl(quotation.image)} alt="Supplier quotation" className="supplier-detail-image" />}
    </main>
  );
};

export default QuotationDetailsPage;
