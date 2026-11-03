import StatusBadge from './StatusBadge';

const ComparisonTable = ({ comparison }) => {
  const { quotations, items } = comparison;
  const summaryRows = [['Subtotal', 'subtotal'], ['Additional Cost', 'additionalCost'], ['Discount', 'discount'],
    ['Grand Total', 'grandTotal'], ['Delivery Days', 'deliveryDays'], ['Status', 'status']];
  return (
    <div className="comparison-table-panel">
      <p className="mobile-table-hint">Scroll horizontally to compare all offers.</p>
      <div className="table-responsive" tabIndex="0" aria-label="Scrollable quotation comparison">
        <table className="table comparison-table" aria-label="Side-by-side quotation comparison">
          <thead><tr><th scope="col">Item</th><th scope="col">Quantity</th>
            {quotations.map((quotation) => <th scope="col" key={quotation._id}>{quotation.supplier.name}<br />{quotation.quotationReference || quotation._id}</th>)}
          </tr></thead>
          <tbody>
            {items.map((item) => <tr key={item.rfqItemId}><th scope="row">{item.itemName}</th><td>{item.quantity}</td>
              {item.prices.map((price) => <td key={price.quotationId}>
                <span className={price.difference === 0 ? 'best-price' : ''}>{price.unitPrice} JD</span>
                <br /><small>{price.difference === 0 ? 'Cheapest item price' : `${price.difference} JD above cheapest`}</small>
              </td>)}
            </tr>)}
            {summaryRows.map(([label, field]) => <tr key={field} className={field === 'grandTotal' ? 'total-row' : ''}><th scope="row">{label}</th><td>—</td>
              {quotations.map((quotation) => <td key={quotation._id} className={field === 'grandTotal' && quotation.grandTotal === comparison.lowestTotal ? 'best-price' : ''}>
                {field === 'status' ? <StatusBadge status={quotation.status} /> : quotation[field] ?? 'Not provided'}
              </td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
