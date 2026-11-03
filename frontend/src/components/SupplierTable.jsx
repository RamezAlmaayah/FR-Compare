import { Link } from 'react-router-dom';
import SupplierImage from './SupplierImage';

const displayValue = (value) => value || '—';

const SupplierTable = ({ suppliers, onDelete }) => (
  <div className="table-responsive" tabIndex="0" aria-label="Scrollable supplier records">
    <table className="table table-bordered align-middle">
      <thead>
        <tr>
          <th scope="col">Supplier</th>
          <th scope="col">Category</th>
          <th scope="col">Contact Person</th>
          <th scope="col">Phone</th>
          <th scope="col">Email</th>
          <th scope="col">Quotations</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supplier) => (
          <tr key={supplier._id}>
            <td>
              <div className="d-flex align-items-center gap-2">
                <SupplierImage
                  imagePath={supplier.image}
                  supplierName={supplier.name}
                  className="supplier-thumbnail"
                />
                <span>{supplier.name}</span>
              </div>
            </td>
            <td>{displayValue(supplier.category)}</td>
            <td>{displayValue(supplier.contactPerson)}</td>
            <td>{displayValue(supplier.phone)}</td>
            <td>{displayValue(supplier.email)}</td>
            <td>{supplier.quotationCount ?? 0}</td>
            <td>
              <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-sm btn-outline-primary" to={`/suppliers/${supplier._id}`}>
                  View
                </Link>
                <Link
                  className="btn btn-sm btn-outline-secondary"
                  to={`/suppliers/${supplier._id}/edit`}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-sm btn-outline-danger"
                  type="button"
                  onClick={() => onDelete(supplier)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SupplierTable;
