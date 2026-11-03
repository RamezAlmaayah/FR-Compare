import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Pagination from '../components/Pagination';
import SupplierTable from '../components/SupplierTable';
import SUPPLIER_CATEGORIES from '../constants/supplierCategories';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadSuppliers = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await apiClient.get('/suppliers', {
          params: { page: currentPage, search, category, sort },
        });

        if (isActive) {
          setSuppliers(response.data.suppliers);
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.totalItems);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load suppliers.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSuppliers();

    return () => {
      isActive = false;
    };
  }, [category, currentPage, reloadKey, search, sort]);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(`Delete supplier "${supplier.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(`/suppliers/${supplier._id}`);

      if (suppliers.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to delete supplier.'));
    }
  };

  const hasActiveFilters = Boolean(search || category);

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="mb-1">Suppliers</h1>
          <p className="text-body-secondary mb-0">{totalItems} supplier records</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/dashboard">
            Back
          </Link>
          <Link className="btn btn-primary" to="/suppliers/new">
            Add Supplier
          </Link>
        </div>
      </div>

      <section className="mb-3" aria-label="Supplier controls">
        <form className="row g-2 filter-toolbar" onSubmit={handleSearch}>
          <div className="col-12 col-md-5">
            <label className="form-label" htmlFor="supplierSearch">
              Search suppliers
            </label>
            <input
              className="form-control"
              id="supplierSearch"
              type="search"
              placeholder="Search name, contact, or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-outline-primary" type="submit">
              Search
            </button>
          </div>
          <div className="col-12 col-md">
            <label className="form-label" htmlFor="supplierCategoryFilter">
              Category
            </label>
            <select
              className="form-select"
              id="supplierCategoryFilter"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All categories</option>
              {SUPPLIER_CATEGORIES.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md">
            <label className="form-label" htmlFor="supplierSort">
              Sort suppliers
            </label>
            <select
              className="form-select"
              id="supplierSort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </form>
      </section>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <p>Loading suppliers...</p>
      ) : suppliers.length ? (
        <>
          <SupplierTable suppliers={suppliers} onDelete={handleDelete} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="alert alert-secondary" role="status">
          {hasActiveFilters ? 'No suppliers match your search or filter.' : 'No suppliers yet.'}
        </div>
      )}
    </main>
  );
};

export default SuppliersPage;
