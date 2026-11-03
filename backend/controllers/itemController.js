import mongoose from 'mongoose';
import Item from '../models/Item.js';
import RFQ from '../models/RFQ.js';
import { readText } from '../utils/inputValidation.js';
import { queryText, searchExpression } from '../utils/listQuery.js';

const itemData = (input) => ({
  name: readText(input, 'name', 'Item name', true),
  defaultUnit: readText(input, 'defaultUnit', 'Default unit', true),
  description: readText(input, 'description', 'Description'),
  category: readText(input, 'category', 'Category'),
});

const ownedItem = (request) => mongoose.isValidObjectId(request.params.id)
  ? Item.findOne({ _id: request.params.id, userId: request.userId })
  : null;

const getItems = async (request, response) => {
  const query = { userId: request.userId };
  const search = queryText(request.query.search);
  const category = queryText(request.query.category);
  if (search) query.name = searchExpression(search);
  if (category) query.category = category;
  const items = await Item.find(query).sort({ name: 1, _id: 1 });
  return response.json({ items });
};

const getItem = async (request, response) => {
  const item = await ownedItem(request);
  if (!item) return response.status(404).json({ error: 'Item not found' });
  return response.json({ item });
};

const saveItem = async (item, response, status) => {
  try {
    await item.save();
    return response.status(status).json({ item, message: 'Item saved successfully' });
  } catch (error) {
    if (error.code === 11000) return response.status(400).json({ error: 'An item with this name already exists in your catalog' });
    throw error;
  }
};

const createItem = async (request, response) => {
  const item = new Item({ ...itemData(request.body), userId: request.userId });
  return saveItem(item, response, 201);
};

const updateItem = async (request, response) => {
  const item = await ownedItem(request);
  if (!item) return response.status(404).json({ error: 'Item not found' });
  Object.assign(item, itemData(request.body));
  return saveItem(item, response, 200);
};

const deleteItem = async (request, response) => {
  const item = await ownedItem(request);
  if (!item) return response.status(404).json({ error: 'Item not found' });
  const usedRFQ = await RFQ.findOne({ userId: request.userId, 'items.itemId': item._id }).select('_id');
  if (usedRFQ) return response.status(400).json({ error: 'This item is already used in an RFQ and cannot be deleted.' });
  await Item.deleteOne({ _id: item._id, userId: request.userId });
  return response.json({ message: 'Item deleted successfully' });
};

export { createItem, deleteItem, getItem, getItems, updateItem };
