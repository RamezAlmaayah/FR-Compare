import Item from '../models/Item.js';
import normalizeItemName from './normalizeItemName.js';
import { invalidInput } from './inputValidation.js';

const findOrCreateItem = async (row, userId) => {
  const query = { userId, normalizedName: normalizeItemName(row.itemName) };
  const existingItem = await Item.findOne(query);
  if (existingItem) return existingItem;
  try {
    return await Item.create({ userId, name: row.itemName, description: row.description, defaultUnit: row.unit });
  } catch (error) {
    if (error.code !== 11000) throw error;
    const concurrentItem = await Item.findOne(query);
    if (!concurrentItem) throw error;
    return concurrentItem;
  }
};

const linkRFQItems = async (rows, userId) => {
  const linkedIds = rows.filter((row) => row.itemId).map((row) => row.itemId);
  const ownedItems = await Item.find({ _id: { $in: linkedIds }, userId }).select('_id');
  const ownedIds = new Set(ownedItems.map((item) => item._id.toString()));
  if (linkedIds.some((id) => !ownedIds.has(id))) throw invalidInput('Catalog item not found or not accessible');

  const snapshots = [];
  for (const row of rows) {
    const itemId = row.itemId || (await findOrCreateItem(row, userId))._id;
    snapshots.push({ ...row, itemId });
  }
  return snapshots;
};

export default linkRFQItems;
