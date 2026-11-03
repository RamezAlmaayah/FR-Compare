import Supplier from '../models/Supplier.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';

const ratingSummary = (ratings = []) => ({
  averageRating: ratings.length ? ratings.reduce((sum, entry) => sum + entry.rating, 0) / ratings.length : null,
  ratingCount: ratings.length,
});

const removeRFQRating = async (rfqId, userId) => {
  await Supplier.updateMany({ userId, 'ratings.rfqId': rfqId }, { $pull: { ratings: { rfqId } } });
};

const supplierDecisionSummary = async (supplier, userId) => {
  const quotations = await Quotation.find({ userId, supplierId: supplier._id, status: 'Selected' }).select('_id rfqId');
  const rfqs = await RFQ.find({
    userId, status: 'Completed', selectedQuotationId: { $in: quotations.map((quotation) => quotation._id) },
    _id: { $in: quotations.map((quotation) => quotation.rfqId) },
  }).select('_id selectedQuotationId');
  const rfqWins = rfqs.filter((rfq) => quotations.some((quotation) => quotation.rfqId.equals(rfq._id) && quotation._id.equals(rfq.selectedQuotationId))).length;
  return { ...ratingSummary(supplier.ratings), rfqWins };
};

export { ratingSummary, removeRFQRating, supplierDecisionSummary };
