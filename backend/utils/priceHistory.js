const summarizePriceHistory = (history) => ({
  history, purchaseCount: history.length,
  lastPaidUnitPrice: history[0]?.unitPrice ?? null,
  supplierId: history[0]?.supplierId ?? null, supplierName: history[0]?.supplierName ?? null,
  quotationDate: history[0]?.quotationDate ?? null, rfqId: history[0]?.rfqId ?? null,
  rfqReference: history[0]?.rfqReference ?? null,
  lowestPaidUnitPrice: history.length ? Math.min(...history.map((entry) => entry.unitPrice)) : null,
  highestPaidUnitPrice: history.length ? Math.max(...history.map((entry) => entry.unitPrice)) : null,
  averagePaidUnitPrice: history.length ? history.reduce((sum, entry) => sum + entry.unitPrice, 0) / history.length : null,
});

export default summarizePriceHistory;
