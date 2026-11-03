import mongoose from 'mongoose';
import normalizeItemName from '../utils/normalizeItemName.js';

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  normalizedName: { type: String, required: true },
  description: { type: String, trim: true, default: '' },
  defaultUnit: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
});

itemSchema.pre('validate', function normalizeName() {
  if (typeof this.name === 'string') this.normalizedName = normalizeItemName(this.name);
});
itemSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

export default mongoose.model('Item', itemSchema);
