import mongoose from 'mongoose';

const rfqItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemName: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  quantity: { type: Number, required: true, validate: (value) => Number.isFinite(value) && value > 0 },
  unit: { type: String, required: true, trim: true },
  notes: { type: String, trim: true, default: '' },
});

const rfqSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referenceNumber: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  category: { type: String, trim: true, default: '' },
  requestDate: { type: Date, required: true },
  requiredByDate: { type: Date, default: null },
  status: { type: String, enum: ['Draft', 'Open', 'Under Comparison', 'Completed', 'Cancelled'], default: 'Draft' },
  notes: { type: String, trim: true, default: '' },
  items: { type: [rfqItemSchema], required: true, validate: (items) => items.length > 0 },
  selectedQuotationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt: { type: Date, default: Date.now },
});

rfqSchema.index({ userId: 1, referenceNumber: 1 }, { unique: true });
rfqSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('RFQ', rfqSchema);
