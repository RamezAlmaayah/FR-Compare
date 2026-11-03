import mongoose from 'mongoose';

const nonNegativeNumber = {
  type: Number,
  min: 0,
  validate: Number.isFinite,
};

const itemPriceSchema = new mongoose.Schema({
  rfqItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: Number.MIN_VALUE, validate: Number.isFinite },
  unitPrice: { ...nonNegativeNumber, required: true },
  lineTotal: { ...nonNegativeNumber, required: true },
  notes: { type: String, trim: true, default: '' },
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  quotationReference: { type: String, trim: true, default: '' },
  quotationDate: { type: Date, required: true },
  validUntil: { type: Date, default: null },
  deliveryDays: { ...nonNegativeNumber, default: null, validate: (value) => value === null || Number.isSafeInteger(value) },
  itemPrices: { type: [itemPriceSchema], required: true, validate: (rows) => rows.length > 0 },
  subtotal: { ...nonNegativeNumber, required: true },
  additionalCost: { ...nonNegativeNumber, default: 0 },
  discount: { ...nonNegativeNumber, default: 0 },
  grandTotal: { ...nonNegativeNumber, required: true },
  notes: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Received', 'Selected', 'Rejected'], default: 'Received' },
  createdAt: { type: Date, default: Date.now },
});

quotationSchema.index({ userId: 1, rfqId: 1, createdAt: -1 });
quotationSchema.index({ userId: 1, supplierId: 1 });

export default mongoose.model('Quotation', quotationSchema);
