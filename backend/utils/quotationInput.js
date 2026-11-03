import mongoose from 'mongoose';
import RFQ from '../models/RFQ.js';
import Supplier from '../models/Supplier.js';
import { invalidInput, readDate, readText } from './inputValidation.js';
import { calculateQuotation, readNonNegativeNumber } from './quotationCalculations.js';

const quotationInput = async (body, userId, existingQuotation) => {
  const input = { ...body };
  if (typeof input.itemPrices === 'string') {
    try { input.itemPrices = JSON.parse(input.itemPrices); }
    catch { throw invalidInput('Item prices must be valid JSON'); }
  }
  const rfqId = readText(input, 'rfqId', 'RFQ', true);
  const supplierId = readText(input, 'supplierId', 'Supplier', true);
  if (!mongoose.isValidObjectId(rfqId)) throw invalidInput('RFQ not found or not accessible');
  if (!mongoose.isValidObjectId(supplierId)) throw invalidInput('Supplier not found or not accessible');
  if (existingQuotation && existingQuotation.rfqId.toString() !== rfqId) throw invalidInput('A quotation cannot be moved to another RFQ');
  const [rfq, supplier] = await Promise.all([
    RFQ.findOne({ _id: rfqId, userId }),
    Supplier.findOne({ _id: supplierId, userId }).select('_id'),
  ]);
  if (!rfq) throw invalidInput('RFQ not found or not accessible');
  if (!supplier) throw invalidInput('Supplier not found or not accessible');
  if (!existingQuotation && !['Open', 'Under Comparison'].includes(rfq.status)) {
    throw invalidInput('Open the RFQ before adding quotations; cancelled or completed RFQs cannot receive quotations');
  }
  if (existingQuotation && rfq.status === 'Completed') throw invalidInput('Completed RFQ quotations cannot be edited. Change or delete the selected quotation first.');
  const status = readText(input, 'status', 'Status');
  if (status && status !== 'Received') throw invalidInput('Quotation status cannot be selected manually');
  const deliveryDays = readNonNegativeNumber(input.deliveryDays, 'Delivery days', null);
  if (deliveryDays !== null && !Number.isSafeInteger(deliveryDays)) throw invalidInput('Delivery days must be a non-negative integer');
  return {
    rfqId: rfq._id,
    supplierId: supplier._id,
    quotationReference: readText(input, 'quotationReference', 'Quotation reference'),
    quotationDate: readDate(input, 'quotationDate', 'Quotation date', true),
    validUntil: readDate(input, 'validUntil', 'Valid until'),
    deliveryDays,
    notes: readText(input, 'notes', 'Notes'),
    ...calculateQuotation(input, rfq.items),
  };
};

export default quotationInput;
