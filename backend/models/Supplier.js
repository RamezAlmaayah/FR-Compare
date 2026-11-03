import mongoose from 'mongoose';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const supplierRatingSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  note: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
    validate: {
      validator: (value) => !value || EMAIL_PATTERN.test(value),
      message: 'Enter a valid email address',
    },
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ratings: { type: [supplierRatingSchema], default: [] },
});

supplierSchema.index({ userId: 1, createdAt: -1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
