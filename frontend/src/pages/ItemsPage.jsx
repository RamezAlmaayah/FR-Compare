import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import FormField from '../components/FormField';
import DeleteConfirmation from '../components/DeleteConfirmation';
import SUPPLIER_CATEGORIES from '../constants/supplierCategories';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/items', { params: { search, category } });
        if (active) setItems(response.data.items);
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError, 'Unable to load items.'));
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [search, category, reload]);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/items/${itemToDelete._id}`);
      setReload((value) => value + 1);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete item.'));
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };
  return (
    <main className="container py-4">
      <h1>Item Catalog</h1>
      <div className="d-flex gap-3 mb-3"><Link className="btn btn-primary" to="/items/new">Add Item</Link><Link to="/dashboard">Back</Link><Link to="/rfqs">RFQs</Link></div>
      <form className="row align-items-end filter-toolbar" onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }}>
        <div className="col-md-6"><FormField id="itemSearch" label="Search items" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></div>
        <div className="col-md-4"><FormField id="itemFilter" label="Category filter" value={category} onChange={(event) => setCategory(event.target.value)} options={['', ...SUPPLIER_CATEGORIES]} emptyLabel="All categories" /></div>
        <div className="col-auto mb-3"><button className="btn btn-outline-primary" type="submit">Search</button></div>
      </form>
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      {itemToDelete && <DeleteConfirmation recordName={`item "${itemToDelete.name}"`} deleting={deleting} onConfirm={handleDelete} onCancel={() => setItemToDelete(null)} />}
      {loading ? <p>Loading items...</p> : items.length ? (
        <div className="table-responsive" tabIndex="0" aria-label="Scrollable catalog items"><table className="table table-bordered">
          <thead><tr>{['Name', 'Category', 'Default Unit', 'Description', 'Actions'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{items.map((item) => <tr key={item._id}>
            <td>{item.name}</td><td>{item.category || '—'}</td><td>{item.defaultUnit}</td><td>{item.description || '—'}</td>
            <td><Link className="btn btn-sm btn-outline-secondary me-2" to={`/items/${item._id}/edit`}>Edit</Link><button className="btn btn-sm btn-outline-danger" onClick={() => setItemToDelete(item)}>Delete</button></td>
          </tr>)}</tbody>
        </table></div>
      ) : <p role="status">{search || category ? 'No items match your search or filter.' : 'No catalog items yet.'}</p>}
    </main>
  );
};

export default ItemsPage;
