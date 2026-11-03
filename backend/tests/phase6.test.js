import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Item from '../models/Item.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import deleteUploadedFile from '../utils/fileStorage.js';
import { uploadsDirectory } from '../middleware/upload.js';
import calculateComparison from '../utils/comparisonCalculations.js';
import { calculateWeightedScores, validateWeights } from '../utils/weightedScore.js';

dotenv.config({ quiet: true });
const api = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
const runId = Date.now();
const emails = [`phase6-a-${runId}@example.com`, `phase6-b-${runId}@example.com`];
const password = randomUUID();
let completed = 0;
const test = async (name, action) => { await action(); completed += 1; process.stdout.write(`PASS — ${name}\n`); };
const call = async (path, method = 'GET', body, token) => {
  const response = await fetch(`${api}${path}`, { method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: await response.json() };
};
const expected = (result, status = 200) => { assert.equal(result.status, status, JSON.stringify(result.data)); return result.data; };
const close = (actual, target) => assert.ok(Math.abs(actual - target) < 1e-8, `${actual} != ${target}`);
const register = async (email) => {
  expected(await call('/auth/register', 'POST', { name: 'Phase 6 Test', email, password }), 201);
  return expected(await call('/auth/login', 'POST', { email, password })).token;
};
const rfqData = (reference, changes = {}) => ({ referenceNumber: reference, title: 'Decision Test', requestDate: '2026-09-16', status: 'Open',
  items: ['Laptop', 'Monitor', 'Mouse'].map((itemName) => ({ itemName, quantity: 10, unit: 'Piece' })), ...changes });
const quoteData = (rfq, supplier, prices = [500, 120, 15], changes = {}) => ({ rfqId: rfq._id, supplierId: supplier._id,
  quotationDate: '2026-09-16', deliveryDays: 5, itemPrices: rfq.items.map((item, index) => ({ rfqItemId: item._id, unitPrice: prices[index] })), ...changes });

try {
  const tokenA = await register(emails[0]);
  const tokenB = await register(emails[1]);
  const createRFQ = async (reference, token = tokenA, changes = {}) => expected(await call('/rfqs', 'POST', rfqData(reference, changes), token), 201).rfq;
  const createQuote = async (rfq, supplier, prices, changes = {}, token = tokenA) => expected(await call('/quotations', 'POST', quoteData(rfq, supplier, prices, changes), token), 201).quotation;
  const comparison = async (rfq, query = '', token = tokenA) => expected(await call(`/rfqs/${rfq._id}/comparison${query}`, 'GET', undefined, token)).comparison;
  const getRFQ = async (rfq) => expected(await call(`/rfqs/${rfq._id}`, 'GET', undefined, tokenA)).rfq;
  const getSupplier = async (supplier) => expected(await call(`/suppliers/${supplier._id}`, 'GET', undefined, tokenA)).supplier;
  const getHistory = async (itemId) => expected(await call(`/items/${itemId}/price-history`, 'GET', undefined, tokenA)).priceHistory;
  const select = async (quotation, token = tokenA) => expected(await call(`/quotations/${quotation._id}/select`, 'PUT', undefined, token));
  const suppliers = [];
  for (const name of ['TechSource', 'Future Systems', 'Smart Office']) suppliers.push(expected(await call('/suppliers', 'POST', { name }, tokenA), 201).supplier);
  const foreignSupplier = expected(await call('/suppliers', 'POST', { name: 'Foreign Supplier' }, tokenB), 201).supplier;
  const rfq = await createRFQ('PHASE6-DEMO');
  const foreignRFQ = await createRFQ('PHASE6-FOREIGN', tokenB);
  const foreignQuote = await createQuote(foreignRFQ, foreignSupplier, [1, 2, 3], {}, tokenB);
  await test('0 quotations: clear empty comparison and empty paid history', async () => {
    const data = await comparison(rfq); assert.equal(data.available, false); assert.equal(data.quotationCount, 0);
    const history = await getHistory(rfq.items[0].itemId); assert.equal(history.purchaseCount, 0); assert.equal(history.lastPaidUnitPrice, null);
  });
  const quotes = [];
  quotes.push(await createQuote(rfq, suppliers[0], [500, 120, 15], { additionalCost: 100, discount: 50, deliveryDays: 5, quotationReference: 'A' }));
  await test('1 quotation: one-more guidance, no misleading comparison', async () => {
    const data = await comparison(rfq); assert.equal(data.available, false); assert.equal(data.message, 'Add at least one more quotation to compare offers.');
  });
  quotes.push(await createQuote(rfq, suppliers[1], [480, 130, 17], { additionalCost: 50, deliveryDays: 3, quotationReference: 'B' }));
  await test('2 quotations: full comparison available', async () => assert.equal((await comparison(rfq)).available, true));
  quotes.push(await createQuote(rfq, suppliers[2], [510, 115, 14], { discount: 90, deliveryDays: 4, quotationReference: 'C' }));
  // Real completed purchasing decisions provide demo ratings without fabricated stars.
  const priorA = await createRFQ('PHASE6-PRIOR-A', tokenA, { items: [{ itemName: 'Rating Fixture A', quantity: 1, unit: 'Piece' }] });
  const priorC = await createRFQ('PHASE6-PRIOR-C', tokenA, { items: [{ itemName: 'Rating Fixture C', quantity: 1, unit: 'Piece' }] });
  await select(await createQuote(priorA, suppliers[0], [1]));
  await select(await createQuote(priorC, suppliers[2], [1]));
  expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: priorA._id, rating: 4, note: 'Prior delivery' }, tokenA), 201);
  expected(await call(`/suppliers/${suppliers[2]._id}/ratings`, 'POST', { rfqId: priorC._id, rating: 5 }, tokenA), 201);
  const demo = await comparison(rfq);
  await test('3 quotations and side-by-side prices/totals/status', async () => {
    assert.equal(demo.quotationCount, 3); assert.deepEqual(demo.quotations.map((quote) => quote.subtotal), [6350, 6270, 6390]);
    assert.deepEqual(demo.quotations.map((quote) => quote.grandTotal), [6400, 6320, 6300]);
    assert.deepEqual(demo.items[0].prices.map((price) => price.unitPrice), [500, 480, 510]);
    assert.ok(demo.quotations.every((quote) => quote.status === 'Received'));
  });
  await test('Lowest grand total C = 6300', async () => { assert.equal(demo.lowestTotal, 6300); assert.equal(demo.cheapest[0].quotationId, quotes[2]._id); });
  await test('Highest grand total A = 6400', async () => { assert.equal(demo.highestTotal, 6400); assert.equal(demo.highest[0].quotationId, quotes[0]._id); });
  await test('Potential savings = 100', async () => assert.equal(demo.potentialSavings, 100));
  await test('Cheapest per item: B 480, C 115, C 14', async () => {
    assert.deepEqual(demo.items.map((item) => item.lowestUnitPrice), [480, 115, 14]);
    assert.deepEqual(demo.items.map((item) => item.winners[0].quotationId), [quotes[1]._id, quotes[2]._id, quotes[2]._id]);
  });
  await test('Item price differences above cheapest', async () => assert.deepEqual(demo.items[0].prices.map((price) => price.difference), [20, 0, 30]));
  await test('Shortest delivery B = 3', async () => { assert.equal(demo.delivery.shortestDeliveryDays, 3); assert.equal(demo.delivery.winners[0].quotationId, quotes[1]._id); });
  await test('Split lines 4800/1150/140 with all cheapest suppliers', async () => assert.deepEqual(demo.items.map((item) => item.splitLineTotal), [4800, 1150, 140]));
  await test('Split item total = 6090', async () => assert.equal(demo.splitAward.itemTotal, 6090));
  await test('Split difference = C subtotal 6390 - 6090 = 300, not grand-total savings', async () => {
    assert.equal(demo.splitAward.bestSingleSuppliers[0].subtotal, 6390); assert.equal(demo.splitAward.bestSingleSuppliers[0].difference, 300);
    assert.match(demo.splitAward.label, /not guaranteed final savings/);
  });
  await test('Default weights 60/25/15', async () => assert.deepEqual(demo.weighted.weights, { priceWeight: 60, deliveryWeight: 25, ratingWeight: 15 }));
  for (const [index, scores] of [[0, [98.4375, 60, 80, 86.0625]], [1, [6300 / 6320 * 100, 100, 60, 6300 / 6320 * 60 + 25 + 9]], [2, [100, 75, 100, 93.75]]]) {
    await test(`Demo ${'ABC'[index]} price/delivery/rating/weighted components`, async () => {
      const actual = demo.weighted.scores[index]; ['priceScore', 'deliveryScore', 'ratingScore', 'weightedScore'].forEach((field, position) => close(actual[field], scores[position]));
    });
  }
  await test('Unrated B neutral 3/5 only for scoring, flag present, no fake database rating', async () => {
    assert.equal(demo.weighted.scores[1].isUnrated, true); assert.equal((await getSupplier(suppliers[1])).ratings.length, 0);
  });
  await test('Best Value B, Cheapest C remain distinct and no auto winner', async () => {
    assert.equal(demo.weighted.bestValue[0].quotationId, quotes[1]._id); assert.equal(demo.cheapest[0].quotationId, quotes[2]._id);
    assert.equal((await getRFQ(rfq)).selectedQuotationId, null);
  });
  await test('Custom valid weights 100/0/0', async () => assert.equal((await comparison(rfq, '?priceWeight=100&deliveryWeight=0&ratingWeight=0')).weighted.bestValue[0].quotationId, quotes[2]._id));
  for (const [label, query] of [
    ['total less than 100', '?priceWeight=50&deliveryWeight=25&ratingWeight=15'],
    ['total greater than 100', '?priceWeight=70&deliveryWeight=25&ratingWeight=15'],
    ['negative', '?priceWeight=-1&deliveryWeight=86&ratingWeight=15'],
    ['greater than 100', '?priceWeight=101&deliveryWeight=0&ratingWeight=0'],
    ['invalid', '?priceWeight=invalid'], ['NaN', '?priceWeight=NaN'], ['empty', '?priceWeight='], ['repeated array', '?priceWeight=60&priceWeight=60'],
  ]) await test(`Weight rejection: ${label}`, async () => expected(await call(`/rfqs/${rfq._id}/comparison${query}`, 'GET', undefined, tokenA), 400));
  const missingRFQ = await createRFQ('PHASE6-MISSING');
  await createQuote(missingRFQ, suppliers[0], [1, 2, 3], { deliveryDays: '' });
  await createQuote(missingRFQ, suppliers[1], [2, 3, 4]);
  await test('Missing delivery blocks Best Value with readable message, remains null, basic comparison works', async () => {
    const data = await comparison(missingRFQ); assert.equal(data.weighted.available, false); assert.match(data.weighted.error, /Delivery days are required/);
    assert.equal(data.quotations[0].deliveryDays, null); assert.equal(data.delivery.shortestDeliveryDays, 5);
  });
  await test('Missing delivery allowed when delivery weight zero', async () => assert.equal((await comparison(missingRFQ, '?priceWeight=85&deliveryWeight=0&ratingWeight=15')).weighted.available, true));
  const tiedQuotes = demo.quotations.map((quote) => ({ ...quote, grandTotal: 0, deliveryDays: 0,
    supplier: { ...quote.supplier, ratings: [] }, itemPrices: quote.itemPrices.map((row) => ({ ...row, unitPrice: 0 })) }));
  const ties = calculateComparison(demo.rfq, tiedQuotes);
  await test('Tied lowest and highest totals include all quotations', async () => { assert.equal(ties.cheapest.length, 3); assert.equal(ties.highest.length, 3); });
  await test('Tied item prices include all suppliers', async () => assert.ok(ties.items.every((item) => item.winners.length === 3)));
  await test('Tied shortest delivery includes all suppliers', async () => assert.equal(ties.delivery.winners.length, 3));
  await test('Zero totals/zero delivery/Best Value ties are finite and deterministic', async () => {
    const scores = calculateWeightedScores(tiedQuotes, validateWeights({})); assert.equal(scores.bestValue.length, 3);
    assert.ok(scores.scores.every((score) => score.priceScore === 100 && score.deliveryScore === 100 && Number.isFinite(score.weightedScore)));
    tiedQuotes[1].grandTotal = 1; tiedQuotes[1].deliveryDays = 1;
    const positive = calculateWeightedScores(tiedQuotes, validateWeights({})); assert.equal(positive.scores[1].priceScore, 0); assert.equal(positive.scores[1].deliveryScore, 0);
  });
  await test('Rating before completion rejected', async () => expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 5 }, tokenA), 400));
  await test('Select owned quotation: Selected/Completed/selectedQuotationId and exactly one winner', async () => {
    await select(quotes[0]); const current = await getRFQ(rfq); assert.equal(current.status, 'Completed'); assert.equal(current.selectedQuotationId, quotes[0]._id);
    const list = expected(await call(`/quotations?rfqId=${rfq._id}`, 'GET', undefined, tokenA)).quotations;
    assert.equal(list.filter((quote) => quote.status === 'Selected').length, 1);
  });
  await test('Wrong supplier rating rejected', async () => expected(await call(`/suppliers/${suppliers[1]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 5 }, tokenA), 400));
  for (const value of [0, 6, 1.5, 'bad', 'NaN', null, true, '', ' ']) await test(`Invalid rating rejected: ${String(value)}`, async () => expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: value }, tokenA), 400));
  await test('Rating 1, note history, averages/count/wins derived correctly', async () => {
    expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 1, note: 'Decision note' }, tokenA), 201);
    const supplier = await getSupplier(suppliers[0]); assert.equal(supplier.averageRating, 2.5); assert.equal(supplier.ratingCount, 2); assert.equal(supplier.rfqWins, 2);
    assert.ok(supplier.ratings.some((entry) => entry.note === 'Decision note'));
  });
  await test('Duplicate RFQ rating rejected', async () => expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 5 }, tokenA), 400));
  await test('Same winner selection is idempotent and preserves rating', async () => { await select(quotes[0]); assert.equal((await getSupplier(suppliers[0])).ratingCount, 2); });
  await test('One completed selected paid history: price/supplier/date/RFQ exact; received excluded', async () => {
    const history = await getHistory(rfq.items[0].itemId); assert.equal(history.purchaseCount, 1); assert.equal(history.lastPaidUnitPrice, 500);
    assert.equal(history.supplierId, suppliers[0]._id); assert.equal(history.rfqReference, rfq.referenceNumber); assert.equal(history.quotationDate.slice(0, 10), '2026-09-16');
  });
  await test('Change winner: old Received/new Selected, Completed retained, obsolete rating removed not migrated', async () => {
    await select(quotes[1]); const current = await getRFQ(rfq); assert.equal(current.selectedQuotationId, quotes[1]._id); assert.equal(current.status, 'Completed');
    assert.equal(expected(await call(`/quotations/${quotes[0]._id}`, 'GET', undefined, tokenA)).quotation.status, 'Received');
    assert.equal(expected(await call(`/quotations/${quotes[1]._id}`, 'GET', undefined, tokenA)).quotation.status, 'Selected');
    assert.equal((await getSupplier(suppliers[0])).ratingCount, 1); assert.equal((await getSupplier(suppliers[1])).ratingCount, 0);
    assert.equal((await getHistory(rfq.items[0].itemId)).lastPaidUnitPrice, 480);
  });
  await test('Rating 5 and optional note accepted', async () => expected(await call(`/suppliers/${suppliers[1]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 5 }, tokenA), 201));
  await test('Normal quotation edit cannot forge Selected, Completed RFQ status cannot be forged/reopened', async () => {
    expected(await call(`/quotations/${quotes[2]._id}`, 'PUT', quoteData(rfq, suppliers[2], [1, 2, 3], { status: 'Selected' }), tokenA), 400);
    expected(await call(`/rfqs/${rfq._id}`, 'PUT', { ...rfqData(rfq.referenceNumber), items: (await getRFQ(rfq)).items }, tokenA), 400);
    expected(await call('/rfqs', 'POST', rfqData('FORGED-COMPLETED', { status: 'Completed', selectedQuotationId: quotes[2]._id }), tokenA), 400);
  });
  await test('Two-way comparison and selection ownership isolation', async () => {
    expected(await call(`/rfqs/${foreignRFQ._id}/comparison`, 'GET', undefined, tokenA), 404);
    expected(await call(`/rfqs/${rfq._id}/comparison`, 'GET', undefined, tokenB), 404);
    expected(await call(`/quotations/${foreignQuote._id}/select`, 'PUT', undefined, tokenA), 404);
    expected(await call(`/quotations/${quotes[2]._id}/select`, 'PUT', undefined, tokenB), 404);
    const foreign = expected(await call(`/rfqs/${foreignRFQ._id}`, 'GET', undefined, tokenB)).rfq; assert.equal(foreign.selectedQuotationId, null);
  });
  await test('Two-way foreign Supplier/RFQ rating isolation', async () => {
    expected(await call(`/suppliers/${foreignSupplier._id}/ratings`, 'POST', { rfqId: foreignRFQ._id, rating: 5 }, tokenA), 404);
    expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: foreignRFQ._id, rating: 5 }, tokenA), 404);
    expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 5 }, tokenB), 404);
  });
  await test('Two-way foreign Item price history isolation', async () => {
    expected(await call(`/items/${foreignRFQ.items[0].itemId}/price-history`, 'GET', undefined, tokenA), 404);
    expected(await call(`/items/${rfq.items[0].itemId}/price-history`, 'GET', undefined, tokenB), 404);
  });
  const laterRFQ = await createRFQ('PHASE6-LATER');
  const laterQuote = await createQuote(laterRFQ, suppliers[2], [510, 115, 14], { quotationDate: '2026-09-17' });
  await select(laterQuote);
  await test('Multiple paid histories: last/min/max/average/count and newest date sorting', async () => {
    const history = await getHistory(rfq.items[0].itemId); assert.equal(history.purchaseCount, 2); assert.equal(history.lastPaidUnitPrice, 510);
    assert.equal(history.lowestPaidUnitPrice, 480); assert.equal(history.highestPaidUnitPrice, 510); assert.equal(history.averagePaidUnitPrice, 495);
    assert.equal(history.supplierName, 'Smart Office'); assert.equal(history.rfqReference, laterRFQ.referenceNumber);
  });
  await mongoose.connect(process.env.MONGO_URI);
  await test('Rejected quotation and Selected quotation in non-completed RFQ excluded from paid history', async () => {
    await Quotation.updateOne({ _id: quotes[2]._id }, { status: 'Rejected' });
    await RFQ.updateOne({ _id: laterRFQ._id }, { status: 'Open' });
    assert.equal((await getHistory(rfq.items[0].itemId)).purchaseCount, 1);
    await RFQ.updateOne({ _id: laterRFQ._id }, { status: 'Completed' });
  });
  await test('No aggregation pipeline introduced in price history', async () => {
    const source = await readFile(new URL('../controllers/priceHistoryController.js', import.meta.url), 'utf8'); assert.ok(!/\.aggregate\s*\(/.test(source));
  });
  await test('Selected deletion: clear selection, restore Under Comparison with 2 remaining, remove RFQ rating/history', async () => {
    expected(await call(`/quotations/${quotes[1]._id}`, 'DELETE', undefined, tokenA));
    const current = await getRFQ(rfq); assert.equal(current.selectedQuotationId, null); assert.equal(current.status, 'Under Comparison');
    assert.equal((await getSupplier(suppliers[1])).ratingCount, 0); assert.equal((await getHistory(rfq.items[0].itemId)).purchaseCount, 1);
  });
  await test('Selected deletion with zero remaining reopens RFQ and removes paid history', async () => {
    expected(await call(`/quotations/${laterQuote._id}`, 'DELETE', undefined, tokenA));
    assert.equal((await getRFQ(laterRFQ)).status, 'Open'); assert.equal((await getHistory(rfq.items[0].itemId)).purchaseCount, 0);
  });
  await test('Selected deletion with one remaining restores Open', async () => {
    await select(quotes[0]); expected(await call(`/quotations/${quotes[0]._id}`, 'DELETE', undefined, tokenA));
    assert.equal((await getRFQ(rfq)).status, 'Open'); assert.equal((await getRFQ(rfq)).selectedQuotationId, null);
  });
  await test('RFQ cascade also removes its supplier rating and derived win', async () => {
    expected(await call(`/rfqs/${priorA._id}`, 'DELETE', undefined, tokenA)); const supplier = await getSupplier(suppliers[0]);
    assert.equal(supplier.ratingCount, 0); assert.equal(supplier.rfqWins, 0);
  });
  const imageRFQ = await createRFQ('PHASE6-IMAGE');
  const form = new FormData();
  for (const [field, value] of Object.entries(quoteData(imageRFQ, suppliers[0]))) form.append(field, typeof value === 'object' ? JSON.stringify(value) : value);
  form.append('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'selected.png');
  const uploadedResponse = await fetch(`${api}/quotations`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}` }, body: form });
  const uploaded = expected({ status: uploadedResponse.status, data: await uploadedResponse.json() }, 201).quotation;
  await select(uploaded);
  await test('Selected image deletion removes local upload and returns quotation 404', async () => {
    expected(await call(`/quotations/${uploaded._id}`, 'DELETE', undefined, tokenA));
    expected(await call(`/quotations/${uploaded._id}`, 'GET', undefined, tokenA), 404);
    await assert.rejects(access(join(uploadsDirectory, basename(uploaded.image))), { code: 'ENOENT' });
  });
  await test('All decision endpoints require JWT and reject invalid IDs cleanly', async () => {
    for (const path of [`/rfqs/${rfq._id}/comparison`, `/items/${rfq.items[0].itemId}/price-history`]) {
      expected(await call(path), 401); expected(await call(path, 'GET', undefined, 'invalid'), 401);
    }
    expected(await call(`/quotations/${quotes[2]._id}/select`, 'PUT'), 401);
    expected(await call(`/suppliers/${suppliers[0]._id}/ratings`, 'POST', { rfqId: rfq._id, rating: 5 }), 401);
    for (const path of ['/rfqs/bad/comparison', '/items/bad/price-history']) expected(await call(path, 'GET', undefined, tokenA), 404);
    expected(await call('/quotations/bad/select', 'PUT', undefined, tokenA), 404);
  });
  await test('Concurrent winner requests still produce exactly one consistent Selected quotation', async () => {
    const concurrentRFQ = await createRFQ('PHASE6-CONCURRENT');
    const first = await createQuote(concurrentRFQ, suppliers[0]);
    const second = await createQuote(concurrentRFQ, suppliers[1]);
    await Promise.all([select(first), select(second)]);
    const records = expected(await call(`/quotations?rfqId=${concurrentRFQ._id}`, 'GET', undefined, tokenA)).quotations;
    const selected = records.filter((quotation) => quotation.status === 'Selected');
    assert.equal(selected.length, 1);
    assert.equal((await getRFQ(concurrentRFQ)).selectedQuotationId, selected[0]._id);
  });
  await test('Completed RFQ metadata edit preserves winner and item snapshots', async () => {
    const decisionRFQ = await createRFQ('PHASE6-METADATA');
    const selected = await createQuote(decisionRFQ, suppliers[0]);
    await select(selected);
    const current = await getRFQ(decisionRFQ);
    const saved = expected(await call(`/rfqs/${current._id}`, 'PUT', { ...current, title: 'Updated completed title', requestDate: current.requestDate.slice(0, 10), requiredByDate: '' }, tokenA)).rfq;
    assert.equal(saved.status, 'Completed'); assert.equal(saved.selectedQuotationId, selected._id);
    assert.deepEqual(saved.items, current.items);
  });
  process.stdout.write(`Completed ${completed} Phase 6 test groups.\n`);
} finally {
  if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ email: { $in: emails } });
  const ids = users.map((user) => user._id);
  for (const quotation of await Quotation.find({ userId: { $in: ids } })) await deleteUploadedFile(quotation.image);
  await Quotation.deleteMany({ userId: { $in: ids } });
  await RFQ.deleteMany({ userId: { $in: ids } });
  await Item.deleteMany({ userId: { $in: ids } });
  await Supplier.deleteMany({ userId: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
  await mongoose.disconnect();
}
