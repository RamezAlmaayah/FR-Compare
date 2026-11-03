import { Link } from 'react-router-dom';
import formatDate from '../utils/formatDate';
import StatusBadge from './StatusBadge';

const DashboardRecentRecords = ({ recentRFQs, recentQuotations }) => (
  <>
    <section aria-label="Recent RFQs" className="my-4">
      <h2 className="h4">Recent RFQs</h2>
      {!recentRFQs.length ? <p>No RFQs yet.</p> : <div className="table-responsive" tabIndex="0" aria-label="Scrollable recent RFQs">
        <table className="table table-bordered">
          <thead><tr>{['Reference', 'Title', 'Status', 'Date', 'View'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{recentRFQs.map((rfq) => <tr key={rfq._id}>
            <td>{rfq.referenceNumber}</td><td>{rfq.title}</td><td><StatusBadge status={rfq.status} /></td><td>{formatDate(rfq.requestDate)}</td>
            <td><Link to={`/rfqs/${rfq._id}`} aria-label={`View RFQ ${rfq.referenceNumber}`}>View</Link></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
    <section aria-label="Recent Quotations" className="my-4">
      <h2 className="h4">Recent Quotations</h2>
      {!recentQuotations.length ? <p>No quotations yet.</p> : <div className="table-responsive" tabIndex="0" aria-label="Scrollable recent quotations">
        <table className="table table-bordered">
          <thead><tr>{['Supplier', 'RFQ', 'Quotation Reference', 'Grand Total', 'Status', 'Date', 'View'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{recentQuotations.map((quotation) => <tr key={quotation._id}>
            <td>{quotation.supplierId?.name || 'Unavailable'}</td>
            <td>{quotation.rfqId ? `${quotation.rfqId.referenceNumber} — ${quotation.rfqId.title}` : 'Unavailable'}</td>
            <td>{quotation.quotationReference || '—'}</td><td>{quotation.grandTotal} JD</td><td><StatusBadge status={quotation.status} /></td>
            <td>{formatDate(quotation.quotationDate)}</td>
            <td><Link to={`/quotations/${quotation._id}`} aria-label={`View quotation ${quotation.quotationReference || quotation._id}`}>View</Link></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
  </>
);

export default DashboardRecentRecords;
