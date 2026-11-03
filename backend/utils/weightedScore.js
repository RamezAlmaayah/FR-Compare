import { invalidInput } from './inputValidation.js';
import { ratingSummary } from './supplierRating.js';

const DEFAULT_WEIGHTS = { priceWeight: 60, deliveryWeight: 25, ratingWeight: 15 };

const validateWeights = (input) => {
  const weights = {};
  for (const [field, fallback] of Object.entries(DEFAULT_WEIGHTS)) {
    const value = input[field] === undefined ? fallback : input[field];
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') {
      throw invalidInput('Each weight must be a number between 0 and 100');
    }
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 100) throw invalidInput('Each weight must be between 0 and 100');
    weights[field] = number;
  }
  if (Object.values(weights).reduce((sum, value) => sum + value, 0) !== 100) throw invalidInput('Weights must total exactly 100');
  return weights;
};

const ratioScore = (minimum, value) => minimum === 0 ? (value === 0 ? 100 : 0) : minimum / value * 100;

const calculateWeightedScores = (quotations, weights) => {
  const missingDelivery = quotations.some((quotation) => quotation.deliveryDays == null);
  if (weights.deliveryWeight > 0 && missingDelivery) {
    return { available: false, error: 'Delivery days are required for all quotations when Delivery Weight is greater than 0.', weights, scores: [], bestValue: [] };
  }
  const lowest = Math.min(...quotations.map((quotation) => quotation.grandTotal));
  const deliveries = quotations.filter((quotation) => quotation.deliveryDays != null).map((quotation) => quotation.deliveryDays);
  const shortest = deliveries.length ? Math.min(...deliveries) : null;
  const scores = quotations.map((quotation) => {
    const { averageRating, ratingCount } = ratingSummary(quotation.supplier.ratings);
    const priceScore = ratioScore(lowest, quotation.grandTotal);
    const deliveryScore = quotation.deliveryDays == null ? null : ratioScore(shortest, quotation.deliveryDays);
    const ratingScore = (averageRating ?? 3) / 5 * 100;
    const weightedScore = priceScore * weights.priceWeight / 100 + (deliveryScore ?? 0) * weights.deliveryWeight / 100 + ratingScore * weights.ratingWeight / 100;
    return { quotationId: quotation._id, supplierId: quotation.supplier._id, supplierName: quotation.supplier.name,
      priceScore, deliveryScore, ratingScore, weightedScore, averageRating, isUnrated: ratingCount === 0 };
  });
  const highest = Math.max(...scores.map((score) => score.weightedScore));
  return { available: true, weights, scores, bestValue: scores.filter((score) => Math.abs(score.weightedScore - highest) < 1e-10) };
};

export { validateWeights, calculateWeightedScores };
