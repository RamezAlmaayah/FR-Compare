import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import SupplierImage from '../components/SupplierImage';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import QuotationList from '../components/QuotationList';
import SupplierRatingHistory from '../components/SupplierRatingHistory';
import formatDate from '../utils/formatDate';

const displayValue = (value) => value || 'Not provided';

const SupplierDetailsPage = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadSupplier = async () => {
      try {
        const response = await apiClient.get(`/suppliers/${id}`);

        if (isActive) {
          setSupplier(response.data.supplier);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load supplier.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSupplier();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) {
    return <p className="container py-5">Loading supplier...</p>;
  }

  if (errorMessage || !supplier) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger" role="alert">
          {errorMessage || 'Supplier not found.'}
        </div>
        <Link to="/suppliers">Back to Suppliers</Link>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="mb-0">{supplier.name}</h1>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/suppliers">
            Back
          </Link>
          <Link className="btn btn-primary" to={`/suppliers/${supplier._id}/edit`}>
            Edit Supplier
          </Link>
        </div>
      </div>

      <SupplierImage
        imagePath={supplier.image}
        supplierName={supplier.name}
        className="supplier-detail-image mb-3"
      />

      <section aria-labelledby="supplier-information-heading">
        <h2 id="supplier-information-heading" className="h4">
          Supplier Information
        </h2>
        <dl className="row">
          <dt className="col-sm-3">Category</dt>
          <dd className="col-sm-9">{displayValue(supplier.category)}</dd>
          <dt className="col-sm-3">Contact Person</dt>
          <dd className="col-sm-9">{displayValue(supplier.contactPerson)}</dd>
          <dt className="col-sm-3">Email</dt>
          <dd className="col-sm-9">{displayValue(supplier.email)}</dd>
          <dt className="col-sm-3">Phone</dt>
          <dd className="col-sm-9">{displayValue(supplier.phone)}</dd>
          <dt className="col-sm-3">Address</dt>
          <dd className="col-sm-9">{displayValue(supplier.address)}</dd>
          <dt className="col-sm-3">Notes</dt>
          <dd className="col-sm-9">{displayValue(supplier.notes)}</dd>
          <dt className="col-sm-3">Created</dt>
          <dd className="col-sm-9">{formatDate(supplier.createdAt)}</dd>
        </dl>
      </section>

      <SupplierRatingHistory supplier={supplier} />
      <section className="mt-4" aria-labelledby="quotation-history-heading">
        <h2 id="quotation-history-heading" className="h4">
          Quotation History
        </h2>
        <p>{supplier.quotationCount ?? 0} quotations submitted</p>
        <QuotationList supplierId={id} />
      </section>
    </main>
  );
};

export default SupplierDetailsPage;
