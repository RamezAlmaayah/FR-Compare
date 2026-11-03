import mongoose from 'mongoose';
import Quotation from '../models/Quotation.js';
import quotationInput from '../utils/quotationInput.js';
import deleteUploadedFile from '../utils/fileStorage.js';
import { paginationOptions, queryText } from '../utils/listQuery.js';
import { invalidInput } from '../utils/inputValidation.js';
import { synchronizeRFQStatus } from '../utils/rfqQuotationIntegrity.js';
import RFQ from '../models/RFQ.js';
import { removeRFQRating } from '../utils/supplierRating.js';
import withRFQDecisionLock from '../utils/rfqDecisionLock.js';

const imagePath = (file) => file ? `/uploads/${file.filename}` : '';
const ownedQuotation = (request) => mongoose.isValidObjectId(request.params.id)
  ? Quotation.findOne({ _id: request.params.id, userId: request.userId }) : null;
const withRelationships = (query, userId) => query
  .populate({ path: 'supplierId', select: 'name', match: { userId } })
  .populate({ path: 'rfqId', select: 'title referenceNumber items status selectedQuotationId', match: { userId } });

const getQuotations = async (request, response) => {
  const query = { userId: request.userId };
  for (const field of ['rfqId', 'supplierId']) {
    const value = queryText(request.query[field]);
    if (value && !mongoose.isValidObjectId(value)) throw invalidInput(`Invalid ${field}`);
    if (value) query[field] = value;
  }
  const status = queryText(request.query.status);
  if (status) query.status = status;
  const sorts = { lowest: { grandTotal: 1, _id: 1 }, highest: { grandTotal: -1, _id: -1 }, newest: { createdAt: -1, _id: -1 } };
  const sortName = queryText(request.query.sort);
  const sort = Object.hasOwn(sorts, sortName) ? sorts[sortName] : sorts.newest;
  const { page, limit, skip } = paginationOptions(request.query);
  const [quotations, totalItems] = await Promise.all([
    withRelationships(Quotation.find(query).sort(sort).skip(skip).limit(limit), request.userId),
    Quotation.countDocuments(query),
  ]);
  return response.json({ quotations, currentPage: page, totalPages: Math.max(1, Math.ceil(totalItems / limit)), totalItems });
};

const getQuotation = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ error: 'Quotation not found' });
  const quotation = await withRelationships(ownedQuotation(request), request.userId);
  if (!quotation) return response.status(404).json({ error: 'Quotation not found' });
  return response.json({ quotation });
};

const persistQuotation = async (request, response, quotation, status) => {
  const uploadedImage = imagePath(request.file);
  const previousImage = quotation.image;
  try {
    const data = await quotationInput(request.body, request.userId, quotation.isNew ? null : quotation);
    Object.assign(quotation, data);
    if (uploadedImage) quotation.image = uploadedImage;
    await quotation.save();
  } catch (error) {
    await deleteUploadedFile(uploadedImage);
    throw error;
  }
  if (uploadedImage && previousImage) await deleteUploadedFile(previousImage);
  await synchronizeRFQStatus(quotation.rfqId, request.userId);
  return response.status(status).json({ quotation, message: 'Quotation saved successfully' });
};

const saveQuotation = async (request, response, quotation, status) => withRFQDecisionLock(
  quotation.isNew ? request.body?.rfqId : quotation.rfqId,
  () => persistQuotation(request, response, quotation, status),
);

const createQuotation = async (request, response) => saveQuotation(
  request, response, new Quotation({ userId: request.userId, status: 'Received' }), 201,
);

const updateQuotation = async (request, response) => {
  let quotation;
  try { quotation = await ownedQuotation(request); }
  catch (error) { await deleteUploadedFile(imagePath(request.file)); throw error; }
  if (!quotation) {
    await deleteUploadedFile(imagePath(request.file));
    return response.status(404).json({ error: 'Quotation not found' });
  }
  return saveQuotation(request, response, quotation, 200);
};

const removeQuotation = async (request, response) => {
  const quotation = await ownedQuotation(request);
  if (!quotation) return response.status(404).json({ error: 'Quotation not found' });
  await Quotation.deleteOne({ _id: quotation._id, userId: request.userId });
  await deleteUploadedFile(quotation.image);
  const rfq = await RFQ.findOne({ _id: quotation.rfqId, userId: request.userId });
  if (rfq?.selectedQuotationId?.equals(quotation._id)) {
    await removeRFQRating(rfq._id, request.userId);
    rfq.selectedQuotationId = null;
    rfq.status = 'Open';
    await rfq.save();
  }
  await synchronizeRFQStatus(quotation.rfqId, request.userId);
  return response.json({ message: 'Quotation deleted successfully' });
};

const deleteQuotation = async (request, response) => {
  const quotation = await ownedQuotation(request);
  if (!quotation) return response.status(404).json({ error: 'Quotation not found' });
  return withRFQDecisionLock(quotation.rfqId, () => removeQuotation(request, response));
};

export { createQuotation, deleteQuotation, getQuotation, getQuotations, updateQuotation };
