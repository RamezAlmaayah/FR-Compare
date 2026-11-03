const offerNames = (offers) => offers.map((offer) => `${offer.supplierName} (${offer.quotationReference || offer.quotationId})`).join(', ');

const ComparisonSummary = ({ comparison }) => (
  <>
    <section className="comparison-metrics" aria-label="Basic comparison results">
      <div><h2>Cheapest</h2><p className="comparison-value">{comparison.lowestTotal} JD</p><p>{offerNames(comparison.cheapest)}</p></div>
      <div><h2>Highest Offer</h2><p className="comparison-value">{comparison.highestTotal} JD</p><p>{offerNames(comparison.highest)}</p></div>
      <div><h2>Potential Savings</h2><p className="comparison-value">{comparison.potentialSavings} JD</p><p>Highest minus lowest offer, not realized savings.</p></div>
      <div><h2>Delivery Comparison</h2><p>{comparison.delivery.shortestDeliveryDays == null ? 'No delivery days provided.' : `${comparison.delivery.shortestDeliveryDays} days — ${offerNames(comparison.delivery.winners)}`}</p></div>
    </section>
    <section className="split-award-panel" aria-label="Split Award analysis">
      <h2 className="h4">Cheapest per Item / Split Award</h2>
      <p className="split-warning">{comparison.splitAward.label}. Quotation-level additional costs and discounts do not apply to this mixed-basket analysis.</p>
      <ul>{comparison.items.map((item) => <li key={item.rfqItemId}>
        {item.itemName}: {item.quantity} × {item.lowestUnitPrice} = {item.splitLineTotal} JD — {offerNames(item.winners)}
      </li>)}</ul>
      <p>Split Award Item Total: {comparison.splitAward.itemTotal} JD</p>
      {comparison.splitAward.bestSingleSuppliers.map((offer) => <p key={offer.quotationId}>
        Best Single Supplier: {offer.supplierName}. Split Difference (item-subtotal): {offer.subtotal} − {comparison.splitAward.itemTotal} = {offer.difference} JD
      </p>)}
    </section>
  </>
);

export default ComparisonSummary;
