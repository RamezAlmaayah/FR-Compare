const quotationPreview = (items, prices, additionalCost, discount) => {
  const lineTotals = items.map((item) => item.quantity * (Number(prices[item._id]?.unitPrice) || 0));
  const subtotal = lineTotals.reduce((sum, total) => sum + total, 0);
  return { lineTotals, subtotal, grandTotal: subtotal + (Number(additionalCost) || 0) - (Number(discount) || 0) };
};

export default quotationPreview;
