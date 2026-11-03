import { useState } from 'react';
import FormField from './FormField';
import RFQItemRow from './RFQItemRow';
import SUPPLIER_CATEGORIES from '../constants/supplierCategories';
import { ITEM_UNITS, RFQ_EDIT_STATUSES } from '../constants/rfqOptions';

const emptyRow = () => ({ rowKey: crypto.randomUUID(), itemId: '', itemName: '', description: '', quantity: '1', unit: '', notes: '' });
const dateValue = (value) => value?.slice(0, 10) || '';

const RFQForm = ({ rfq, catalog, onSubmit, saving, error }) => {
  const [form, setForm] = useState({
    referenceNumber: rfq?.referenceNumber || '', title: rfq?.title || '', description: rfq?.description || '',
    category: rfq?.category || '', requestDate: dateValue(rfq?.requestDate) || new Date().toISOString().slice(0, 10),
    requiredByDate: dateValue(rfq?.requiredByDate), status: rfq?.status || 'Draft', notes: rfq?.notes || '',
  });
  const [rows, setRows] = useState(() => rfq?.items.map((item) => ({ ...item, rowKey: item._id })) || [emptyRow()]);
  const [validation, setValidation] = useState('');
  const changeField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const changeRow = (rowKey, field, value) => {
    setRows((current) => current.map((row) => {
      if (row.rowKey !== rowKey) return row;
      if (field !== 'itemName') return { ...row, [field]: value };
      const selected = catalog.find((item) => item.name === value.trim());
      return selected
        ? { ...row, itemId: selected._id, itemName: value, description: selected.description, unit: selected.defaultUnit }
        : { ...row, itemName: value, itemId: '' };
    }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.referenceNumber.trim() || !form.title.trim() || !form.requestDate) {
      setValidation('Reference number, title, and request date are required.');
      return;
    }
    if (!rows.length || rows.some((row) => !row.itemName.trim() || !row.unit.trim() || !Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0)) {
      setValidation('Add at least one item. Every item needs a name, unit, and quantity greater than zero.');
      return;
    }
    setValidation('');
    await onSubmit({ ...form, items: rows.map(({ rowKey, ...row }) => ({ ...row, quantity: Number(row.quantity) })) });
  };
  return (
    <form onSubmit={submit} noValidate>
      {(validation || error) && <div role="alert" className="alert alert-danger">{validation || error}</div>}
      <div className="row">
        <div className="col-md-6"><FormField id="rfqReference" label="Reference Number" value={form.referenceNumber} onChange={changeField('referenceNumber')} required /></div>
        <div className="col-md-6"><FormField id="rfqTitle" label="Title" value={form.title} onChange={changeField('title')} required /></div>
        <div className="col-md-6"><FormField id="rfqDescription" label="Description" type="textarea" value={form.description} onChange={changeField('description')} /></div>
        <div className="col-md-6"><FormField id="rfqCategory" label="Category" value={form.category} onChange={changeField('category')} options={['', ...SUPPLIER_CATEGORIES]} /></div>
        <div className="col-md-4"><FormField id="rfqRequestDate" label="Request Date" type="date" value={form.requestDate} onChange={changeField('requestDate')} required /></div>
        <div className="col-md-4"><FormField id="rfqRequiredDate" label="Required By Date" type="date" value={form.requiredByDate} onChange={changeField('requiredByDate')} /></div>
        <div className="col-md-4"><FormField id="rfqStatus" label="Status" value={form.status} onChange={changeField('status')} disabled={rfq?.status === 'Completed'} options={['Under Comparison', 'Completed'].includes(rfq?.status) ? [...RFQ_EDIT_STATUSES, rfq.status] : RFQ_EDIT_STATUSES} /></div>
        <div className="col-12"><FormField id="rfqNotes" label="Notes" type="textarea" value={form.notes} onChange={changeField('notes')} /></div>
      </div>
      <h2 className="h4">Requested Items</h2>
      {rfq?.quotationCount > 0 && <p role="status">Items are locked while quotations exist. Remove the quotations before changing items.</p>}
      <fieldset disabled={rfq?.quotationCount > 0}>
      <datalist id="catalogItems">{catalog.map((item) => <option key={item._id} value={item.name}>{item.defaultUnit}</option>)}</datalist>
      <datalist id="itemUnits">{ITEM_UNITS.map((unit) => <option key={unit} value={unit} />)}</datalist>
      {rows.map((row, index) => <RFQItemRow key={row.rowKey} row={row} index={index} onChange={(field, value) => changeRow(row.rowKey, field, value)} onRemove={() => setRows((current) => current.filter((item) => item.rowKey !== row.rowKey))} />)}
      <button type="button" className="btn btn-outline-primary mb-3" onClick={() => setRows((current) => [...current, emptyRow()])}>+ Add Item</button>
      </fieldset>
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save RFQ'}</button>
    </form>
  );
};

export default RFQForm;
