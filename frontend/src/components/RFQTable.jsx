import { Link } from 'react-router-dom';
import formatDate from '../utils/formatDate';
import StatusBadge from './StatusBadge';

const RFQTable = ({ rfqs, onDelete }) => (
  <div className="table-responsive" tabIndex="0" aria-label="Scrollable RFQ records"><table className="table table-bordered align-middle">
    <thead><tr>{['Reference', 'Title', 'Category', 'Request Date', 'Required Date', 'Status', 'Items', 'Quotations', 'Actions'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
    <tbody>{rfqs.map((rfq) => <tr key={rfq._id}>
      <td>{rfq.referenceNumber}</td><td>{rfq.title}</td><td>{rfq.category || '—'}</td><td>{formatDate(rfq.requestDate)}</td><td>{formatDate(rfq.requiredByDate)}</td><td><StatusBadge status={rfq.status} /></td><td>{rfq.items.length}</td><td>{rfq.quotationCount ?? 0}</td>
      <td><div className="d-flex gap-2"><Link to={`/rfqs/${rfq._id}`}>View</Link><Link to={`/rfqs/${rfq._id}/edit`}>Edit</Link><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(rfq)}>Delete</button></div></td>
    </tr>)}</tbody>
  </table></div>
);

export default RFQTable;
