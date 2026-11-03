const calculateDashboardSavings = (rfqs, quotations) => {
  const offersByRFQ = new Map();
  quotations.forEach((quotation) => {
    if (!Number.isFinite(quotation.grandTotal) || quotation.grandTotal < 0) return;
    const key = String(quotation.rfqId);
    if (!offersByRFQ.has(key)) offersByRFQ.set(key, []);
    offersByRFQ.get(key).push(quotation);
  });

  return rfqs.reduce((total, rfq) => {
    if (!rfq.selectedQuotationId) return total;
    const offers = offersByRFQ.get(String(rfq._id)) || [];
    const selected = offers.find((offer) => String(offer._id) === String(rfq.selectedQuotationId));
    if (!selected || selected.status !== 'Selected' || !selected.supplierId) return total;
    const highest = offers.reduce((maximum, offer) => Math.max(maximum, offer.grandTotal), 0);
    return total + Math.max(0, highest - selected.grandTotal);
  }, 0);
};

export default calculateDashboardSavings;
