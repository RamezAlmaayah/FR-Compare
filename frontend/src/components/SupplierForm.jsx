import { useState } from 'react';
import SUPPLIER_CATEGORIES from '../constants/supplierCategories';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptySupplier = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  category: '',
  notes: '',
};

const SupplierForm = ({ initialSupplier, isSubmitting, apiError, onSubmit }) => {
  const [supplier, setSupplier] = useState(() => ({
    ...emptySupplier,
    ...initialSupplier,
  }));
  const [image, setImage] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSupplier((currentSupplier) => ({ ...currentSupplier, [name]: value }));
  };

  const validateForm = () => {
    if (!supplier.name.trim()) {
      return 'Supplier name is required.';
    }

    if (supplier.email.trim() && !EMAIL_PATTERN.test(supplier.email.trim())) {
      return 'Enter a valid email address.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    setValidationError('');

    const formData = new FormData();
    Object.keys(emptySupplier).forEach((fieldName) => {
      formData.append(fieldName, supplier[fieldName] || '');
    });

    if (image) {
      formData.append('image', image);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {(validationError || apiError) && (
        <div className="alert alert-danger" role="alert">
          {validationError || apiError}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label" htmlFor="supplierName">
          Supplier Name
        </label>
        <input
          className="form-control"
          id="supplierName"
          name="name"
          type="text"
          value={supplier.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="contactPerson">
          Contact Person
        </label>
        <input
          className="form-control"
          id="contactPerson"
          name="contactPerson"
          type="text"
          value={supplier.contactPerson}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="supplierEmail">
          Email
        </label>
        <input
          className="form-control"
          id="supplierEmail"
          name="email"
          type="email"
          value={supplier.email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="phone">
          Phone
        </label>
        <input
          className="form-control"
          id="phone"
          name="phone"
          type="text"
          value={supplier.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="address">
          Address
        </label>
        <textarea
          className="form-control"
          id="address"
          name="address"
          rows="2"
          value={supplier.address}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="category">
          Category
        </label>
        <select
          className="form-select"
          id="category"
          name="category"
          value={supplier.category}
          onChange={handleChange}
        >
          <option value="">Select category</option>
          {SUPPLIER_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="form-control"
          id="notes"
          name="notes"
          rows="3"
          value={supplier.notes}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="supplierImage">
          Supplier Image/Logo
        </label>
        <input
          className="form-control"
          id="supplierImage"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={(event) => setImage(event.target.files[0] || null)}
        />
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Supplier'}
      </button>
    </form>
  );
};

export default SupplierForm;
