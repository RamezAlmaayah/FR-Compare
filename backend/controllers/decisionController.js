import mongoose from 'mongoose';
import Quotation from '../models/Quotation.js';
import RFQ from '../models/RFQ.js';
import Supplier from '../models/Supplier.js';
import { invalidInput, readText } from '../utils/inputValidation.js';
import { removeRFQRating } from '../utils/supplierRating.js';
import withRFQDecisionLock from '../utils/rfqDecisionLock.js';

const completeSelection = async (request, response) => {
  const quotation = mongoose.isValidObjectId(request.params.id)
    ? await Quotation.findOne({ _id: request.params.id, userId: request.userId }) : null;
  if (!quotation) return response.status(404).json({ error: 'Quotation not found' });
  const [rfq, supplier] = await Promise.all([
    RFQ.findOne({ _id: quotation.rfqId, userId: request.userId }),
    Supplier.findOne({ _id: quotation.supplierId, userId: request.userId }).select('_id'),
  ]);
  if (!rfq || !supplier) throw invalidInput('Quotation RFQ or supplier is unavailable');
  if (!['Open', 'Under Comparison', 'Completed'].includes(rfq.status)) throw invalidInput('Only an open RFQ can be completed by selecting a quotation');
  if (rfq.selectedQuotationId?.equals(quotation._id) && quotation.status === 'Selected') {
    return response.json({ quotation, rfq, message: 'Quotation is already selected' });
  }
  await Quotation.updateMany({ userId: request.userId, rfqId: rfq._id, status: 'Selected' }, { status: 'Received' });
  quotation.status = 'Selected';
  await quotation.save();
  await removeRFQRating(rfq._id, request.userId);
  rfq.status = 'Completed';
  rfq.selectedQuotationId = quotation._id;
  await rfq.save();
  return response.json({ quotation, rfq, message: 'Quotation selected; RFQ completed' });
};

const saveSupplierRating = async (request, response) => {
  const supplier = mongoose.isValidObjectId(request.params.id)
    ? await Supplier.findOne({ _id: request.params.id, userId: request.userId }) : null;
  if (!supplier) return response.status(404).json({ error: 'Supplier not found' });
  const rfqId = readText(request.body, 'rfqId', 'RFQ', true);
  const rfq = mongoose.isValidObjectId(rfqId) ? await RFQ.findOne({ _id: rfqId, userId: request.userId }) : null;
  if (!rfq) return response.status(404).json({ error: 'RFQ not found' });
  if (rfq.status !== 'Completed' || !rfq.selectedQuotationId) throw invalidInput('Complete the RFQ by selecting a quotation before rating its supplier');
  const selected = await Quotation.findOne({ _id: rfq.selectedQuotationId, rfqId: rfq._id,
    supplierId: supplier._id, userId: request.userId, status: 'Selected' }).select('_id');
  if (!selected) throw invalidInput('Only the selected supplier can be rated for this RFQ');
  const value = request.body.rating;
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '' || !Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 5) {
    throw invalidInput('Rating must be an integer from 1 through 5');
  }
  const entry = { rfqId: rfq._id, rating: Number(value), note: readText(request.body, 'note', 'Rating note'), createdAt: new Date() };
  const result = await Supplier.updateOne({ _id: supplier._id, userId: request.userId,
    'ratings.rfqId': { $ne: rfq._id } }, { $push: { ratings: entry } }, { runValidators: true });
  if (!result.modifiedCount) throw invalidInput('This RFQ already has a supplier rating');
  return response.status(201).json({ rating: entry, message: 'Supplier rating saved' });
};

const selectQuotation = async (request, response) => {
  const quotation = mongoose.isValidObjectId(request.params.id)
    ? await Quotation.findOne({ _id: request.params.id, userId: request.userId }).select('rfqId') : null;
  if (!quotation) return response.status(404).json({ error: 'Quotation not found' });
  return withRFQDecisionLock(quotation.rfqId, () => completeSelection(request, response));
};

const rateSupplier = async (request, response) => {
  const rfqId = readText(request.body, 'rfqId', 'RFQ', true);
  return withRFQDecisionLock(rfqId, () => saveSupplierRating(request, response));
};

export { selectQuotation, rateSupplier };
