import { useState } from 'react';
import FormField from './FormField';
import SUPPLIER_CATEGORIES from '../constants/supplierCategories';

const ItemForm = ({ item, onSubmit, saving, error }) => {
  const [form, setForm] = useState({ name: item?.name || '', description: item?.description || '', defaultUnit: item?.defaultUnit || '', category: item?.category || '' });
  const [validation, setValidation] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.defaultUnit.trim()) {
      setValidation('Item name and default unit are required.');
      return;
    }
    setValidation('');
    await onSubmit(form);
  };
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  return (
    <form onSubmit={submit} noValidate>
      {(validation || error) && <div role="alert" className="alert alert-danger">{validation || error}</div>}
      <FormField id="itemName" label="Item Name" value={form.name} onChange={change('name')} required />
      <FormField id="itemDefaultUnit" label="Default Unit" value={form.defaultUnit} onChange={change('defaultUnit')} required />
      <FormField id="itemDescription" label="Description" type="textarea" value={form.description} onChange={change('description')} />
      <FormField id="itemCategory" label="Category" value={form.category} onChange={change('category')} options={['', ...SUPPLIER_CATEGORIES]} />
      <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Item'}</button>
    </form>
  );
};

export default ItemForm;
