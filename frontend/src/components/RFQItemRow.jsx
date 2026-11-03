import FormField from './FormField';
import ItemPriceHistoryHint from './ItemPriceHistoryHint';

const RFQItemRow = ({ row, index, onChange, onRemove }) => (
  <fieldset className="border p-3 mb-3">
    <legend className="float-none w-auto fs-6">Item {index + 1}</legend>
    <div className="row">
      <div className="col-md-6"><FormField id={`name-${row.rowKey}`} label="Item Name / Catalog Item" value={row.itemName} onChange={(event) => onChange('itemName', event.target.value)} list="catalogItems" required /></div>
      <div className="col-md-6"><FormField id={`description-${row.rowKey}`} label="Item Description" value={row.description} onChange={(event) => onChange('description', event.target.value)} /></div>
      <div className="col-md-3"><FormField id={`quantity-${row.rowKey}`} label="Quantity" type="number" step="any" min="0.000001" value={row.quantity} onChange={(event) => onChange('quantity', event.target.value)} required /></div>
      <div className="col-md-3"><FormField id={`unit-${row.rowKey}`} label="Unit" value={row.unit} onChange={(event) => onChange('unit', event.target.value)} list="itemUnits" required /></div>
      <div className="col-md-6"><FormField id={`notes-${row.rowKey}`} label="Item Notes" value={row.notes} onChange={(event) => onChange('notes', event.target.value)} /></div>
    </div>
    <ItemPriceHistoryHint itemId={row.itemId} />
    <button type="button" className="btn btn-outline-danger" onClick={onRemove}>Remove Item {index + 1}</button>
  </fieldset>
);

export default RFQItemRow;
