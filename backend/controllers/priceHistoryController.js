import mongoose from 'mongoose';
import Item from '../models/Item.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import summarizePriceHistory from '../utils/priceHistory.js';

const getPriceHistory = async (request, response) => {
  const item = mongoose.isValidObjectId(request.params.id)
    ? await Item.findOne({ _id: request.params.id, userId: request.userId }) : null;
  if (!item) return response.status(404).json({ error: 'Item not found' });
  const rfqs = await RFQ.find({ userId: request.userId, status: 'Completed', 'items.itemId': item._id });
  const quotations = await Quotation.find({ userId: request.userId, status: 'Selected',
    _id: { $in: rfqs.map((rfq) => rfq.selectedQuotationId).filter(Boolean) },
    rfqId: { $in: rfqs.map((rfq) => rfq._id) }, 'itemPrices.itemId': item._id })
    .sort({ quotationDate: -1, createdAt: -1, _id: -1 })
    .populate({ path: 'supplierId', select: 'name', match: { userId: request.userId } });
  const history = quotations.flatMap((quotation) => {
    const rfq = rfqs.find((record) => record._id.equals(quotation.rfqId) && record.selectedQuotationId?.equals(quotation._id));
    const row = quotation.itemPrices.find((entry) => entry.itemId?.equals(item._id));
    if (!rfq || !row || !quotation.supplierId) return [];
    return [{ quotationId: quotation._id, unitPrice: row.unitPrice, supplierId: quotation.supplierId._id,
      supplierName: quotation.supplierId.name, quotationDate: quotation.quotationDate, rfqId: rfq._id, rfqReference: rfq.referenceNumber }];
  });
  return response.json({ priceHistory: summarizePriceHistory(history) });
};

export { getPriceHistory };
