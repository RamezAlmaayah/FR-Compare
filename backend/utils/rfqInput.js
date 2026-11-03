import mongoose from 'mongoose';
import { invalidInput, readDate, readText } from './inputValidation.js';

const rfqInput = (input, existingItems = [], existingStatus) => {
  const status = readText(input, 'status', 'Status') || 'Draft';
  if (existingStatus === 'Completed' && status !== 'Completed') throw invalidInput('Change or delete the selected quotation to reopen a completed RFQ');
  if (!['Draft', 'Open', 'Cancelled'].includes(status) && !(['Under Comparison', 'Completed'].includes(status) && existingStatus === status)) {
    throw invalidInput('Status must be Draft, Open, or Cancelled; comparison status is managed automatically');
  }
  if (!Array.isArray(input?.items) || input.items.length === 0) throw invalidInput('At least one RFQ item is required');
  const existingIds = new Set(existingItems.map((item) => item._id.toString()));
  const submittedIds = new Set();
  const items = input.items.map((item) => {
    const quantity = typeof item?.quantity === 'number' || typeof item?.quantity === 'string'
      ? Number(item.quantity) : NaN;
    if (!Number.isFinite(quantity) || quantity <= 0) throw invalidInput('Item quantity must be a number greater than zero');
    const itemId = readText(item, 'itemId', 'Catalog item ID');
    if (itemId && !mongoose.isValidObjectId(itemId)) throw invalidInput('Invalid catalog item ID');
    const row = {
      itemId: itemId || undefined,
      itemName: readText(item, 'itemName', 'Item name', true),
      description: readText(item, 'description', 'Item description'),
      quantity,
      unit: readText(item, 'unit', 'Item unit', true),
      notes: readText(item, 'notes', 'Item notes'),
    };
    if (item._id && existingIds.has(item._id) && !submittedIds.has(item._id)) {
      row._id = item._id;
      submittedIds.add(item._id);
    }
    return row;
  });
  return {
    referenceNumber: readText(input, 'referenceNumber', 'Reference number', true),
    title: readText(input, 'title', 'Title', true),
    description: readText(input, 'description', 'Description'),
    category: readText(input, 'category', 'Category'),
    requestDate: readDate(input, 'requestDate', 'Request date', true),
    requiredByDate: readDate(input, 'requiredByDate', 'Required by date'),
    status,
    notes: readText(input, 'notes', 'Notes'),
    items,
  };
};

export default rfqInput;
