import Quotation from '../models/Quotation.js';
import RFQ from '../models/RFQ.js';
import { invalidInput } from './inputValidation.js';

const quotationRFQStatus = (status, count) => {
  if (['Cancelled', 'Completed'].includes(status)) return status;
  return count >= 2 ? 'Under Comparison' : 'Open';
};

const synchronizeRFQStatus = async (rfqId, userId) => {
  const rfq = await RFQ.findOne({ _id: rfqId, userId });
  if (!rfq) return;
  const count = await Quotation.countDocuments({ rfqId, userId });
  const status = quotationRFQStatus(rfq.status, count);
  if (status !== rfq.status) await RFQ.updateOne({ _id: rfqId, userId }, { status });
};

const protectRFQItems = async (rfq, data, userId) => {
  const count = await Quotation.countDocuments({ rfqId: rfq._id, userId });
  if (!count) return;
  const fields = ['itemId', 'itemName', 'description', 'quantity', 'unit', 'notes'];
  const unchanged = data.items.length === rfq.items.length && data.items.every((row) => {
    const original = rfq.items.find((item) => item._id.toString() === row._id);
    return original && fields.every((field) => String(row[field] ?? '') === String(original[field] ?? ''));
  });
  if (!unchanged) throw invalidInput('RFQ items cannot be changed while quotations exist. Remove the quotations first.');
  if (data.status === 'Draft') throw invalidInput('An RFQ with quotations cannot return to Draft');
  data.status = quotationRFQStatus(data.status, count);
};

export { protectRFQItems, quotationRFQStatus, synchronizeRFQStatus };
