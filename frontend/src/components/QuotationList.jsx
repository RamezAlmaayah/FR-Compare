import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import DeleteConfirmation from './DeleteConfirmation';
import Pagination from './Pagination';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import quotationDeleteWarning from '../utils/quotationDeleteWarning';
import formatDate from '../utils/formatDate';
import StatusBadge from './StatusBadge';

const QuotationList = ({ rfqId, supplierId, onChanged }) => {
  const [quotations, setQuotations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    let active = true;
    const loadQuotations = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/quotations', { params: { rfqId, supplierId, page } });
        if (active) { setQuotations(response.data.quotations); setTotalPages(response.data.totalPages); }
      } catch (error) {
        if (active) setError(getApiErrorMessage(error, 'Unable to load quotations.'));
      } finally { if (active) setLoading(false); }
    };
    loadQuotations();
    return () => { active = false; };
  }, [rfqId, supplierId, page, reload]);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/quotations/${quotationToDelete._id}`);
      if (quotations.length === 1 && page > 1) setPage((current) => current - 1);
      else setReload((current) => current + 1);
      onChanged?.();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to delete quotation.'));
    } finally { setDeleting(false); setQuotationToDelete(null); }
  };
  return (
    <section aria-label="Quotation records">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {quotationToDelete && <DeleteConfirmation recordName={`quotation "${quotationToDelete.quotationReference || quotationToDelete._id}"`}
        warning={quotationDeleteWarning(quotationToDelete)}
        deleting={deleting} onConfirm={handleDelete} onCancel={() => setQuotationToDelete(null)} />}
      {loading ? <p>Loading quotations...</p> : error && !quotations.length ? null : !quotations.length ? <p>No quotations received{rfqId ? ' for this RFQ' : ''}.</p> : <>
        <div className="table-responsive" tabIndex="0" aria-label="Scrollable quotation records"><table className="table table-bordered">
          <thead><tr>{['Supplier', 'RFQ', 'Quotation Reference', 'Date', 'Delivery Days', 'Grand Total', 'Status', 'Actions'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{quotations.map((quotation) => <tr key={quotation._id}>
            <td>{quotation.supplierId?.name || 'Unavailable'}</td><td>{quotation.rfqId?.referenceNumber || 'Unavailable'}</td>
            <td>{quotation.quotationReference || '—'}</td><td>{formatDate(quotation.quotationDate)}</td>
            <td>{quotation.deliveryDays ?? '—'}</td><td>{quotation.grandTotal}</td><td><StatusBadge status={quotation.status} /></td>
            <td><div className="d-flex gap-2"><Link to={`/quotations/${quotation._id}`}>View</Link>
              <Link to={`/quotations/${quotation._id}/edit`}>Edit</Link>
              <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => setQuotationToDelete(quotation)}>Delete</button></div></td>
          </tr>)}</tbody>
        </table></div>
        <Pagination ariaLabel="Quotation pagination" currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </>}
    </section>
  );
};

export default QuotationList;
