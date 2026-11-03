import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import FormField from '../components/FormField';
import DeleteConfirmation from '../components/DeleteConfirmation';
import Pagination from '../components/Pagination';
import RFQTable from '../components/RFQTable';
import SUPPLIER_CATEGORIES from '../constants/supplierCategories';
import { RFQ_STATUSES } from '../constants/rfqOptions';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const RFQsPage = () => {
  const [rfqs, setRFQs] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState({ search: '', status: '', category: '', sort: 'newest', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [rfqToDelete, setRFQToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/rfqs', { params: query });
        if (active) {
          setRFQs(response.data.rfqs);
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.totalItems);
        }
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError, 'Unable to load RFQs.'));
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [query, reload]);
  const changeQuery = (field, value) => setQuery((current) => ({ ...current, [field]: value, page: 1 }));
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/rfqs/${rfqToDelete._id}`);
      if (rfqs.length === 1 && query.page > 1) setQuery((current) => ({ ...current, page: current.page - 1 }));
      else setReload((value) => value + 1);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete RFQ.'));
    } finally {
      setDeleting(false);
      setRFQToDelete(null);
    }
  };
  return (
    <main className="container py-4">
      <h1>RFQs</h1><p>{totalItems} RFQ records</p>
      <div className="d-flex gap-3 mb-3"><Link className="btn btn-primary" to="/rfqs/new">Create RFQ</Link><Link to="/dashboard">Back</Link><Link to="/items">Item Catalog</Link></div>
      <form className="row align-items-end filter-toolbar" onSubmit={(event) => { event.preventDefault(); changeQuery('search', searchInput.trim()); }}>
        <div className="col-md-3"><FormField id="rfqSearch" label="Search RFQs" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></div>
        <div className="col-md-2"><FormField id="rfqStatusFilter" label="Status filter" value={query.status} options={['', ...RFQ_STATUSES]} emptyLabel="All statuses" onChange={(event) => changeQuery('status', event.target.value)} /></div>
        <div className="col-md-3"><FormField id="rfqCategoryFilter" label="Category filter" value={query.category} options={['', ...SUPPLIER_CATEGORIES]} emptyLabel="All categories" onChange={(event) => changeQuery('category', event.target.value)} /></div>
        <div className="col-md-2 mb-3"><label className="form-label" htmlFor="rfqSort">Sort RFQs</label><select id="rfqSort" className="form-select" value={query.sort} onChange={(event) => changeQuery('sort', event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="requiredDate">Required Date</option></select></div>
        <div className="col-auto mb-3"><button type="submit" className="btn btn-outline-primary">Search</button></div>
      </form>
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      {rfqToDelete && <DeleteConfirmation recordName={`RFQ "${rfqToDelete.referenceNumber}"`} deleting={deleting} onConfirm={handleDelete} onCancel={() => setRFQToDelete(null)} />}
      {loading ? <p>Loading RFQs...</p> : rfqs.length ? <>
        <RFQTable rfqs={rfqs} onDelete={setRFQToDelete} />
        <Pagination currentPage={query.page} totalPages={totalPages} ariaLabel="RFQ pagination" onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
      </> : <p role="status">{query.search || query.status || query.category ? 'No RFQs match your search or filters.' : 'No RFQs yet.'}</p>}
    </main>
  );
};

export default RFQsPage;
