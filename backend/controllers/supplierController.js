import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import Quotation from '../models/Quotation.js';
import deleteUploadedFile from '../utils/fileStorage.js';
import { supplierDecisionSummary } from '../utils/supplierRating.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;
const OPTIONAL_TEXT_FIELDS = [
  'contactPerson',
  'email',
  'phone',
  'address',
  'category',
  'notes',
];

const getUploadedImagePath = (file) => (file ? `/uploads/${file.filename}` : '');

const removeNewUpload = async (file) => {
  if (file) {
    await deleteUploadedFile(getUploadedImagePath(file));
  }
};

const validateSupplierInput = (supplierInput) => {
  if (typeof supplierInput.name !== 'string' || !supplierInput.name.trim()) {
    return 'Supplier name is required';
  }

  const invalidTextField = OPTIONAL_TEXT_FIELDS.find(
    (fieldName) =>
      supplierInput[fieldName] !== undefined && typeof supplierInput[fieldName] !== 'string',
  );

  if (invalidTextField) {
    return 'Supplier fields must contain text values';
  }

  const email = supplierInput.email?.trim() || '';

  if (email && !EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address';
  }

  return '';
};

const buildSupplierData = (supplierInput) => ({
  name: supplierInput.name.trim(),
  contactPerson: supplierInput.contactPerson?.trim() || '',
  email: supplierInput.email?.trim().toLowerCase() || '',
  phone: supplierInput.phone?.trim() || '',
  address: supplierInput.address?.trim() || '',
  category: supplierInput.category?.trim() || '',
  notes: supplierInput.notes?.trim() || '',
});

const parsePositiveInteger = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
};

const escapeRegularExpression = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSuppliers = async (request, response) => {
  const page = parsePositiveInteger(request.query.page, 1);
  const requestedLimit = parsePositiveInteger(request.query.limit, DEFAULT_PAGE_SIZE);
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';
  const category = typeof request.query.category === 'string' ? request.query.category.trim() : '';
  const query = { userId: request.userId };

  if (search) {
    const searchExpression = new RegExp(escapeRegularExpression(search), 'i');
    query.$or = [
      { name: searchExpression },
      { contactPerson: searchExpression },
      { email: searchExpression },
    ];
  }

  if (category) {
    query.category = category;
  }

  const sort = request.query.sort === 'name' ? { name: 1, _id: 1 } : { createdAt: -1 };
  const skip = (page - 1) * limit;
  const [suppliers, totalItems] = await Promise.all([
    Supplier.find(query).sort(sort).skip(skip).limit(limit),
    Supplier.countDocuments(query),
  ]);
  const quotations = await Quotation.find({ userId: request.userId, supplierId: { $in: suppliers.map((supplier) => supplier._id) } }).select('supplierId');
  const records = suppliers.map((supplier) => ({ ...supplier.toObject(), quotationCount: quotations.filter((quotation) => quotation.supplierId.equals(supplier._id)).length }));

  return response.status(200).json({
    suppliers: records,
    currentPage: page,
    totalPages: Math.max(Math.ceil(totalItems / limit), 1),
    totalItems,
  });
};

const getSupplier = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ error: 'Supplier not found' });
  }

  const supplier = await Supplier.findOne({
    _id: request.params.id,
    userId: request.userId,
  });

  if (!supplier) {
    return response.status(404).json({ error: 'Supplier not found' });
  }

  const quotationCount = await Quotation.countDocuments({ supplierId: supplier._id, userId: request.userId });
  const decisionSummary = await supplierDecisionSummary(supplier, request.userId);
  return response.status(200).json({ supplier: { ...supplier.toObject(), quotationCount, ...decisionSummary } });
};

const createSupplier = async (request, response) => {
  const validationError = validateSupplierInput(request.body);

  if (validationError) {
    await removeNewUpload(request.file);
    return response.status(400).json({ error: validationError });
  }

  try {
    const supplier = await Supplier.create({
      ...buildSupplierData(request.body),
      userId: request.userId,
      image: getUploadedImagePath(request.file),
    });

    return response.status(201).json({
      message: 'Supplier created successfully',
      supplier,
    });
  } catch (error) {
    await removeNewUpload(request.file);
    throw error;
  }
};

const updateSupplier = async (request, response) => {
  const validationError = validateSupplierInput(request.body);

  if (validationError || !mongoose.isValidObjectId(request.params.id)) {
    await removeNewUpload(request.file);
    return response
      .status(validationError ? 400 : 404)
      .json({ error: validationError || 'Supplier not found' });
  }

  const supplier = await Supplier.findOne({
    _id: request.params.id,
    userId: request.userId,
  });

  if (!supplier) {
    await removeNewUpload(request.file);
    return response.status(404).json({ error: 'Supplier not found' });
  }

  const previousImage = supplier.image;
  const updatedData = buildSupplierData(request.body);
  Object.assign(supplier, updatedData);

  if (request.file) {
    supplier.image = getUploadedImagePath(request.file);
  }

  try {
    await supplier.save();
  } catch (error) {
    await removeNewUpload(request.file);
    throw error;
  }

  if (request.file && previousImage) {
    await deleteUploadedFile(previousImage);
  }

  return response.status(200).json({
    message: 'Supplier updated successfully',
    supplier,
  });
};

const deleteSupplier = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ error: 'Supplier not found' });
  }

  const supplier = await Supplier.findOne({
    _id: request.params.id,
    userId: request.userId,
  });

  if (!supplier) {
    return response.status(404).json({ error: 'Supplier not found' });
  }

  const usedQuotation = await Quotation.findOne({ supplierId: supplier._id, userId: request.userId }).select('_id');
  if (usedQuotation) {
    return response.status(400).json({ error: 'Supplier cannot be deleted because it is used by one or more quotations.' });
  }
  await Supplier.deleteOne({ _id: supplier._id, userId: request.userId });
  await deleteUploadedFile(supplier.image);

  return response.status(200).json({ message: 'Supplier deleted successfully' });
};

export { createSupplier, deleteSupplier, getSupplier, getSuppliers, updateSupplier };
