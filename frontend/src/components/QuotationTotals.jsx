const QuotationTotals = ({ subtotal, additionalCost, discount, grandTotal }) => (
  <section aria-label="Quotation totals" className="quotation-totals mb-3">
    <dl className="mb-0">
      <dt>Subtotal</dt><dd>{subtotal}</dd>
      <dt>Additional Cost</dt><dd>{Number(additionalCost) || 0}</dd>
      <dt>Discount</dt><dd>{Number(discount) || 0}</dd>
      <dt>Grand Total</dt><dd>{grandTotal}</dd>
    </dl>
  </section>
);

export default QuotationTotals;
