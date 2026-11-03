import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import SupplierForm from '../components/SupplierForm';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const SupplierFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isEditMode) {
      return undefined;
    }

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
  }, [id, isEditMode]);

  const handleSubmit = async (formData) => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = isEditMode
        ? await apiClient.put(`/suppliers/${id}`, formData)
        : await apiClient.post('/suppliers', formData);

      navigate(`/suppliers/${response.data.supplier._id}`, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save supplier.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container py-4">
      <section className="mx-auto supplier-form-panel">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
          <h1 className="mb-0">{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</h1>
          <Link className="btn btn-outline-secondary" to="/suppliers">
            Cancel
          </Link>
        </div>

        {isLoading ? (
          <p>Loading supplier...</p>
        ) : errorMessage && isEditMode && !supplier ? (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        ) : (
          <SupplierForm
            initialSupplier={supplier}
            isSubmitting={isSubmitting}
            apiError={errorMessage}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </main>
  );
};

export default SupplierFormPage;
