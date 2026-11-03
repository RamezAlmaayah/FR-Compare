const offerSummary = (quotation) => ({
  quotationId: quotation._id, supplierId: quotation.supplier._id, supplierName: quotation.supplier.name,
  quotationReference: quotation.quotationReference, subtotal: quotation.subtotal, grandTotal: quotation.grandTotal,
});

const calculateComparison = (rfq, quotations) => {
  const lowestTotal = Math.min(...quotations.map((quotation) => quotation.grandTotal));
  const highestTotal = Math.max(...quotations.map((quotation) => quotation.grandTotal));
  const cheapest = quotations.filter((quotation) => quotation.grandTotal === lowestTotal).map(offerSummary);
  const highest = quotations.filter((quotation) => quotation.grandTotal === highestTotal).map(offerSummary);
  const items = rfq.items.map((item) => {
    const prices = quotations.map((quotation) => ({ ...offerSummary(quotation),
      unitPrice: quotation.itemPrices.find((row) => String(row.rfqItemId) === String(item._id)).unitPrice }));
    const lowestUnitPrice = Math.min(...prices.map((price) => price.unitPrice));
    return { rfqItemId: item._id, itemId: item.itemId, itemName: item.itemName, quantity: item.quantity,
      lowestUnitPrice, winners: prices.filter((price) => price.unitPrice === lowestUnitPrice),
      prices: prices.map((price) => ({ ...price, difference: price.unitPrice - lowestUnitPrice })),
      splitLineTotal: item.quantity * lowestUnitPrice };
  });
  const deliveries = quotations.filter((quotation) => quotation.deliveryDays != null);
  const shortestDeliveryDays = deliveries.length ? Math.min(...deliveries.map((quotation) => quotation.deliveryDays)) : null;
  const splitAwardItemTotal = items.reduce((sum, item) => sum + item.splitLineTotal, 0);
  return { lowestTotal, highestTotal, cheapest, highest, potentialSavings: highestTotal - lowestTotal, items,
    delivery: { shortestDeliveryDays, winners: deliveries.filter((quotation) => quotation.deliveryDays === shortestDeliveryDays).map(offerSummary) },
    splitAward: { itemTotal: splitAwardItemTotal, label: 'Item-subtotal comparison — not guaranteed final savings',
      bestSingleSuppliers: cheapest.map((offer) => ({ ...offer, difference: offer.subtotal - splitAwardItemTotal })) } };
};

export default calculateComparison;
