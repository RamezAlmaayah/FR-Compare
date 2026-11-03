import mongoose from 'mongoose';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import calculateComparison from '../utils/comparisonCalculations.js';
import { calculateWeightedScores, validateWeights } from '../utils/weightedScore.js';
import { invalidInput } from '../utils/inputValidation.js';

const getComparison = async (request, response) => {
  const rfq = mongoose.isValidObjectId(request.params.id)
    ? await RFQ.findOne({ _id: request.params.id, userId: request.userId }) : null;
  if (!rfq) return response.status(404).json({ error: 'RFQ not found' });
  const weights = validateWeights(request.query);
  const records = await Quotation.find({ userId: request.userId, rfqId: rfq._id }).sort({ createdAt: 1, _id: 1 })
    .populate({ path: 'supplierId', select: 'name ratings', match: { userId: request.userId } });
  if (records.some((quotation) => !quotation.supplierId)) throw invalidInput('A quotation supplier is unavailable. Correct its supplier before comparing.');
  const quotations = records.map((quotation) => ({ ...quotation.toObject(), supplier: quotation.supplierId.toObject() }));
  const common = { rfq, quotationCount: quotations.length };
  if (quotations.length < 2) return response.json({ comparison: { ...common, available: false,
    message: quotations.length ? 'Add at least one more quotation to compare offers.' : 'Add at least two quotations to compare offers.' } });
  return response.json({ comparison: { ...common, available: true, quotations,
    ...calculateComparison(rfq, quotations), weighted: calculateWeightedScores(quotations, weights) } });
};

export { getComparison };
