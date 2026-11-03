import mongoose from 'mongoose';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import deleteUploadedFile from '../utils/fileStorage.js';
import { protectRFQItems } from '../utils/rfqQuotationIntegrity.js';
import rfqInput from '../utils/rfqInput.js';
import linkRFQItems from '../utils/linkRFQItems.js';
import { invalidInput } from '../utils/inputValidation.js';
import { paginationOptions, queryText, searchExpression } from '../utils/listQuery.js';
import { removeRFQRating } from '../utils/supplierRating.js';
import withRFQDecisionLock from '../utils/rfqDecisionLock.js';

const ownedRFQ = (request) => mongoose.isValidObjectId(request.params.id)
  ? RFQ.findOne({ _id: request.params.id, userId: request.userId }) : null;

const getRFQs = async (request, response) => {
  const query = { userId: request.userId };
  const search = queryText(request.query.search);
  if (search) query.$or = [{ title: searchExpression(search) }, { referenceNumber: searchExpression(search) }];
  for (const field of ['status', 'category']) {
    const value = queryText(request.query[field]);
    if (value) query[field] = value;
  }
  const { page, limit, skip } = paginationOptions(request.query);
  const sortOptions = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    requiredDate: { requiredByDate: 1, _id: 1 },
  };
  const sortName = queryText(request.query.sort);
  const sort = Object.hasOwn(sortOptions, sortName) ? sortOptions[sortName] : sortOptions.newest;
  const [rfqs, totalItems] = await Promise.all([
    RFQ.find(query).sort(sort).skip(skip).limit(limit), RFQ.countDocuments(query),
  ]);
  const quotations = await Quotation.find({ userId: request.userId, rfqId: { $in: rfqs.map((rfq) => rfq._id) } }).select('rfqId');
  const records = rfqs.map((rfq) => ({ ...rfq.toObject(), quotationCount: quotations.filter((quotation) => quotation.rfqId.equals(rfq._id)).length }));
  return response.json({ rfqs: records, currentPage: page, totalPages: Math.max(1, Math.ceil(totalItems / limit)), totalItems });
};

const getRFQ = async (request, response) => {
  const rfq = await ownedRFQ(request);
  if (!rfq) return response.status(404).json({ error: 'RFQ not found' });
  const quotationCount = await Quotation.countDocuments({ userId: request.userId, rfqId: rfq._id });
  return response.json({ rfq: { ...rfq.toObject(), quotationCount } });
};

const saveRFQ = async (rfq, data, userId, response, status) => {
  const duplicate = await RFQ.findOne({ userId, referenceNumber: data.referenceNumber, _id: { $ne: rfq._id } }).select('_id');
  if (duplicate) throw invalidInput('An RFQ with this reference already exists');
  data.items = await linkRFQItems(data.items, userId);
  Object.assign(rfq, data);
  try {
    await rfq.save();
    return response.status(status).json({ rfq, message: 'RFQ saved successfully' });
  } catch (error) {
    if (error.code === 11000) throw invalidInput('An RFQ with this reference already exists');
    throw error;
  }
};

const createRFQ = async (request, response) => {
  const data = rfqInput(request.body);
  return saveRFQ(new RFQ({ userId: request.userId }), data, request.userId, response, 201);
};

const editRFQ = async (request, response) => {
  const rfq = await ownedRFQ(request);
  if (!rfq) return response.status(404).json({ error: 'RFQ not found' });
  const data = rfqInput(request.body, rfq.items, rfq.status);
  await protectRFQItems(rfq, data, request.userId);
  return saveRFQ(rfq, data, request.userId, response, 200);
};

const updateRFQ = async (request, response) => withRFQDecisionLock(request.params.id, () => editRFQ(request, response));

const removeRFQ = async (request, response) => {
  const rfq = await ownedRFQ(request);
  if (!rfq) return response.status(404).json({ error: 'RFQ not found' });
  const quotations = await Quotation.find({ rfqId: rfq._id, userId: request.userId });
  await removeRFQRating(rfq._id, request.userId);
  for (const quotation of quotations) await deleteUploadedFile(quotation.image);
  await Quotation.deleteMany({ rfqId: rfq._id, userId: request.userId });
  await RFQ.deleteOne({ _id: rfq._id, userId: request.userId });
  return response.json({ message: 'RFQ deleted successfully' });
};

const deleteRFQ = async (request, response) => withRFQDecisionLock(request.params.id, () => removeRFQ(request, response));

export { createRFQ, deleteRFQ, getRFQ, getRFQs, updateRFQ };
