import { useState } from 'react';
import FormField from './FormField';
import QuotationTotals from './QuotationTotals';
import quotationPreview from '../utils/quotationPreview';
import { getImageUrl } from '../api/apiConfig';

const validNumber = (value) => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;

const QuotationForm = ({ rfq, suppliers, quotation, saving, error, onSubmit }) => {
  const [form, setForm] = useState({
    supplierId: quotation?.supplierId?._id || '',
    quotationReference: quotation?.quotationReference || '',
    quotationDate: quotation?.quotationDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    validUntil: quotation?.validUntil?.slice(0, 10) || '',
    deliveryDays: quotation?.deliveryDays ?? '',
    additionalCost: quotation?.additionalCost ?? 0,
    discount: quotation?.discount ?? 0,
    notes: quotation?.notes || '',
  });
  const [prices, setPrices] = useState(() => Object.fromEntries(rfq.items.map((item) => {
    const saved = quotation?.itemPrices.find((row) => row.rfqItemId === item._id);
    return [item._id, { unitPrice: saved?.unitPrice ?? '', notes: saved?.notes || '' }];
  })));
  const [image, setImage] = useState(null);
  const [validation, setValidation] = useState('');
  const preview = quotationPreview(rfq.items, prices, form.additionalCost, form.discount);
  const changeField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const changePrice = (id, field, value) => setPrices((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.supplierId || !form.quotationDate) {
      setValidation('Supplier and quotation date are required.');
      return;
    }
    if (rfq.items.some((item) => !validNumber(prices[item._id].unitPrice)) ||
      !validNumber(form.additionalCost) || !validNumber(form.discount) ||
      (form.deliveryDays !== '' && (!validNumber(form.deliveryDays) || !Number.isSafeInteger(Number(form.deliveryDays))))) {
      setValidation('Price every item with a non-negative number. Costs and discount must be non-negative; delivery days must be a non-negative integer.');
      return;
    }
    if (!Number.isFinite(preview.grandTotal) || preview.grandTotal < 0) {
      setValidation('The grand total must be finite and cannot be negative.');
      return;
    }
    setValidation('');
    const data = new FormData();
    Object.entries(form).forEach(([field, value]) => data.append(field, value));
    data.append('rfqId', rfq._id);
    data.append('itemPrices', JSON.stringify(rfq.items.map((item) => ({ rfqItemId: item._id, ...prices[item._id] }))));
    if (image) data.append('image', image);
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {(validation || error) && <div className="alert alert-danger" role="alert">{validation || error}</div>}
      <div className="mb-3">
        <label className="form-label" htmlFor="quotationSupplier">Supplier</label>
        <select id="quotationSupplier" className="form-select" value={form.supplierId} onChange={changeField('supplierId')} required>
          <option value="">Choose Supplier</option>
          {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
        </select>
      </div>
      <div className="row">
        {[
          ['quotationReference', 'Quotation Reference', 'text'], ['quotationDate', 'Quotation Date', 'date'],
          ['validUntil', 'Valid Until', 'date'], ['deliveryDays', 'Delivery Days', 'number'],
          ['additionalCost', 'Additional Cost', 'number'], ['discount', 'Discount', 'number'],
        ].map(([field, label, type]) => (
          <div className="col-md-6" key={field}>
            <FormField id={field} label={label} type={type} value={form[field]} onChange={changeField(field)}
              required={field === 'quotationDate'} {...(type === 'number' ? { min: 0, step: field === 'deliveryDays' ? 1 : 'any' } : {})} />
          </div>
        ))}
      </div>
      <h2 className="h4">RFQ Item Prices</h2>
      <div className="table-responsive" tabIndex="0" aria-label="Scrollable RFQ item price inputs">
        <table className="table table-bordered">
          <thead><tr>{['Item', 'Quantity', 'Unit', 'Unit Price', 'Line Total', 'Pricing Note'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{rfq.items.map((item, index) => (
            <tr key={item._id}>
              <td>{item.itemName}</td><td>{item.quantity}</td><td>{item.unit}</td>
              <td><FormField id={`price-${item._id}`} label={`Unit Price — ${item.itemName}`} type="number" min="0" step="any" required
                value={prices[item._id].unitPrice} onChange={(event) => changePrice(item._id, 'unitPrice', event.target.value)} /></td>
              <td>{preview.lineTotals[index]}</td>
              <td><FormField id={`pricing-note-${item._id}`} label={`Pricing Note — ${item.itemName}`} value={prices[item._id].notes}
                onChange={(event) => changePrice(item._id, 'notes', event.target.value)} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <QuotationTotals {...preview} additionalCost={form.additionalCost} discount={form.discount} />
      <FormField id="quotationNotes" label="Notes" type="textarea" value={form.notes} onChange={changeField('notes')} />
      {quotation?.image && <img src={getImageUrl(quotation.image)} alt="Current quotation" className="supplier-detail-image mb-3" />}
      <div className="mb-3">
        <label className="form-label" htmlFor="quotationImage">Quotation Image</label>
        <input id="quotationImage" className="form-control" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={(event) => setImage(event.target.files[0] || null)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Quotation'}</button>
    </form>
  );
};

export default QuotationForm;
