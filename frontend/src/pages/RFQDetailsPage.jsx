import { Link, useParams } from 'react-router-dom';
import useRecord from '../hooks/useRecord';
import { useState } from 'react';
import QuotationList from '../components/QuotationList';
import CompletedDecision from '../components/CompletedDecision';
import StatusBadge from '../components/StatusBadge';
import formatDate from '../utils/formatDate';

const RFQDetailsPage = () => {
  const { id } = useParams();
  const [reload, setReload] = useState(0);
  const { record: rfq, loading, error } = useRecord(`/rfqs/${id}`, 'rfq', reload);
  if (loading) return <p className="container py-4">Loading RFQ...</p>;
  if (error || !rfq) return <main className="container py-4"><div role="alert" className="alert alert-danger">{error || 'RFQ not found.'}</div><Link to="/rfqs">Back to RFQs</Link></main>;
  const information = [
    ['Reference', rfq.referenceNumber], ['Status', <StatusBadge status={rfq.status} />], ['Description', rfq.description], ['Category', rfq.category],
    ['Request Date', formatDate(rfq.requestDate)], ['Required By Date', formatDate(rfq.requiredByDate)],
    ['Notes', rfq.notes], ['Created', formatDate(rfq.createdAt)],
  ];
  return (
    <main className="container py-4">
      <h1>{rfq.title}</h1>
      <div className="d-flex gap-2 mb-3"><Link to="/rfqs">Back</Link><Link to={`/rfqs/${rfq._id}/edit`}>Edit RFQ</Link></div>
      <dl>{information.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl>
      <h2 className="h4">Requested Items</h2>
      <div className="table-responsive" tabIndex="0" aria-label="Scrollable requested items"><table className="table table-bordered">
        <thead><tr>{['Item Name', 'Description', 'Quantity', 'Unit', 'Notes'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{rfq.items.map((item) => <tr key={item._id}><td>{item.itemName}</td><td>{item.description || '—'}</td><td>{item.quantity}</td><td>{item.unit}</td><td>{item.notes || '—'}</td></tr>)}</tbody>
      </table></div>
      <h2 className="h4">Quotations</h2>
      {rfq.quotationCount >= 2 ? <p><Link className="btn btn-outline-primary" to={`/rfqs/${id}/compare`}>Compare Quotations</Link></p>
        : <p role="status">{rfq.quotationCount === 1 ? 'Add at least one more quotation to compare offers.' : 'Add at least two quotations to compare offers.'}</p>}
      {rfq.status === 'Completed' && rfq.selectedQuotationId && <CompletedDecision rfq={rfq} />}
      {['Open', 'Under Comparison'].includes(rfq.status) && <Link className="btn btn-outline-primary mb-3" to={`/rfqs/${id}/quotation/new`}>Add Quotation</Link>}
      <QuotationList rfqId={id} onChanged={() => setReload((current) => current + 1)} />
    </main>
  );
};

export default RFQDetailsPage;
