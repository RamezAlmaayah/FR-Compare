import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Item from '../models/Item.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';

dotenv.config({ quiet: true });
const api = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
const emails = ['a', 'b'].map((suffix) => `phase7-${suffix}-${randomUUID()}@example.com`);
const password = randomUUID();
let passed = 0;
const test = async (name, action) => { await action(); passed += 1; process.stdout.write(`PASS — ${name}\n`); };
const call = async (path, token, method = 'GET', body) => {
  const response = await fetch(`${api}${path}`, { method, headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}),
  }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: await response.json() };
};
const ok = (result, status = 200) => { assert.equal(result.status, status, JSON.stringify(result.data)); return result.data; };
const register = async (email) => {
  ok(await call('/auth/register', null, 'POST', { name: 'Phase 7 Verification', email, password }), 201);
  return ok(await call('/auth/login', null, 'POST', { email, password })).token;
};

try {
  await mongoose.connect(process.env.MONGO_URI);
  const tokenA = await register(emails[0]);
  const tokenB = await register(emails[1]);
  const userA = await User.findOne({ email: emails[0] });
  const dashboard = async (token = tokenA) => ok(await call('/dashboard', token));
  await test('Dashboard requires JWT', async () => assert.equal((await call('/dashboard')).status, 401));
  await test('Invalid JWT rejected', async () => assert.equal((await call('/dashboard', 'invalid')).status, 401));
  await test('New-user empty dashboard', async () => {
    const data = await dashboard(); assert.ok(Object.values(data.summary).every((value) => value === 0));
    assert.deepEqual(data.recentRFQs, []); assert.deepEqual(data.recentQuotations, []);
  });
  const suppliers = [];
  for (const name of ['Dashboard Supplier A', 'Dashboard Supplier B', 'Dashboard Supplier C']) {
    suppliers.push(ok(await call('/suppliers', tokenA, 'POST', { name }), 201).supplier);
  }
  const item = ok(await call('/items', tokenA, 'POST', { name: 'Dashboard Catalog Item', defaultUnit: 'Piece' }), 201).item;
  const createRFQ = async (reference, status = 'Open', token = tokenA) => ok(await call('/rfqs', token, 'POST', {
    referenceNumber: reference, title: `${reference} Purchasing`, requestDate: '2026-09-16', status,
    items: [{ ...(token === tokenA ? { itemId: item._id } : {}), itemName: token === tokenA ? item.name : 'Foreign Item', quantity: 10, unit: 'Piece' }],
  }), 201).rfq;
  const createQuote = async (rfq, supplier, total, reference, token = tokenA) => ok(await call('/quotations', token, 'POST', {
    rfqId: rfq._id, supplierId: supplier._id, quotationReference: reference, quotationDate: '2026-09-16', deliveryDays: 5,
    itemPrices: rfq.items.map((row) => ({ rfqItemId: row._id, unitPrice: total / row.quantity, quantity: 999 })),
  }), 201).quotation;
  const first = await createRFQ('P7-COMPLETED-80');
  await createQuote(first, suppliers[0], 6400, 'P7-6400');
  const selected = await createQuote(first, suppliers[1], 6320, 'P7-6320');
  await test('Complete comparison / split / weighted integration', async () => {
    const data = ok(await call(`/rfqs/${first._id}/comparison`, tokenA)).comparison;
    assert.equal(data.lowestTotal, 6320); assert.equal(data.highestTotal, 6400); assert.equal(data.potentialSavings, 80);
    assert.equal(data.splitAward.itemTotal, 6320); assert.equal(data.weighted.available, true);
    assert.equal(data.items[0].quantity, 10);
  });
  ok(await call(`/quotations/${selected._id}/select`, tokenA, 'PUT'));
  await test('Single Completed RFQ savings', async () => assert.equal((await dashboard()).summary.estimatedSavings, 80));
  await test('Highest-selected difference', async () => assert.equal((await dashboard()).summary.estimatedSavings, 6400 - 6320));
  await test('Winner / rating / price history / dashboard integration', async () => {
    assert.equal(ok(await call(`/rfqs/${first._id}`, tokenA)).rfq.status, 'Completed');
    ok(await call(`/suppliers/${suppliers[1]._id}/ratings`, tokenA, 'POST', { rfqId: first._id, rating: 5 }), 201);
    assert.equal(ok(await call(`/items/${item._id}/price-history`, tokenA)).priceHistory.lastPaidUnitPrice, 632);
    assert.equal(ok(await call(`/suppliers/${suppliers[1]._id}`, tokenA)).supplier.rfqWins, 1);
  });
  const second = await createRFQ('P7-COMPLETED-120');
  await createQuote(second, suppliers[0], 1000, 'P7-1000');
  const secondWinner = await createQuote(second, suppliers[2], 880, 'P7-880');
  ok(await call(`/quotations/${secondWinner._id}/select`, tokenA, 'PUT'));
  await test('Multiple Completed RFQ savings summed', async () => assert.equal((await dashboard()).summary.estimatedSavings, 200));
  const highestRFQ = await createRFQ('P7-HIGHEST-SELECTED');
  await createQuote(highestRFQ, suppliers[0], 10, 'P7-10');
  const highest = await createQuote(highestRFQ, suppliers[1], 20, 'P7-20');
  ok(await call(`/quotations/${highest._id}/select`, tokenA, 'PUT'));
  await test('Selected highest quotation gives zero saving', async () => assert.equal((await dashboard()).summary.estimatedSavings, 200));
  const open = await createRFQ('P7-OPEN');
  const under = await createRFQ('P7-UNDER');
  await createQuote(under, suppliers[0], 20, 'P7-UNDER-A');
  await createQuote(under, suppliers[1], 30, 'P7-UNDER-B');
  await createRFQ('P7-DRAFT', 'Draft');
  await createRFQ('P7-CANCELLED', 'Cancelled');
  const data = await dashboard();
  await test('Total Suppliers correct', async () => assert.equal(data.summary.totalSuppliers, 3));
  await test('Total RFQs correct', async () => assert.equal(data.summary.totalRFQs, 7));
  await test('Open count includes Open', async () => {
    assert.equal(ok(await call(`/rfqs/${open._id}`, tokenA)).rfq.status, 'Open'); assert.equal(data.summary.openRFQs, 2);
  });
  await test('Open count includes Under Comparison', async () => {
    assert.equal(ok(await call(`/rfqs/${under._id}`, tokenA)).rfq.status, 'Under Comparison'); assert.equal(data.summary.openRFQs, 2);
  });
  for (const status of ['Draft', 'Completed', 'Cancelled']) await test(`${status} excluded from open count`, async () => {
    assert.equal(await RFQ.countDocuments({ userId: userA._id, status }), status === 'Completed' ? 3 : 1);
    assert.equal(data.summary.openRFQs, 2);
  });
  await test('Completed count correct', async () => assert.equal(data.summary.completedRFQs, 3));
  await test('Total Quotations correct', async () => assert.equal(data.summary.totalQuotations, 8));
  await test('Selected Quotations correct', async () => assert.equal(data.summary.selectedQuotations, 3));
  await test('Recent RFQs newest first', async () => {
    const records = await RFQ.find({ userId: userA._id }).sort({ createdAt: -1, _id: -1 }).limit(5);
    assert.deepEqual(data.recentRFQs.map((row) => row._id), records.map((row) => String(row._id)));
  });
  await test('Recent RFQs limited correctly', async () => assert.equal(data.recentRFQs.length, 5));
  await test('Recent Quotations newest first and limited', async () => {
    const records = await Quotation.find({ userId: userA._id }).sort({ createdAt: -1, _id: -1 }).limit(5);
    assert.deepEqual(data.recentQuotations.map((row) => row._id), records.map((row) => String(row._id)));
    assert.equal(data.recentQuotations.length, 5);
  });
  await test('Supplier names correct', async () => {
    for (const row of data.recentQuotations) assert.equal(row.supplierId.name, (await Supplier.findById(row.supplierId._id)).name);
  });
  await test('RFQ data correct and useful fields only', async () => {
    for (const row of data.recentQuotations) assert.equal(row.rfqId.referenceNumber, (await RFQ.findById(row.rfqId._id)).referenceNumber);
    assert.ok(data.recentRFQs.every((row) => !('items' in row) && !('userId' in row)));
  });
  const foreignSupplier = ok(await call('/suppliers', tokenB, 'POST', { name: 'Foreign Supplier' }), 201).supplier;
  const foreignRFQ = await createRFQ('P7-FOREIGN', 'Open', tokenB);
  await createQuote(foreignRFQ, foreignSupplier, 500, 'P7-FOREIGN-HIGH', tokenB);
  const foreignWinner = await createQuote(foreignRFQ, foreignSupplier, 100, 'P7-FOREIGN-WINNER', tokenB);
  ok(await call(`/quotations/${foreignWinner._id}/select`, tokenB, 'PUT'));
  await test('User A does not see User B data', async () => assert.deepEqual(await dashboard(), data));
  await test('Counts completely user-scoped in both directions', async () => {
    const other = await dashboard(tokenB); assert.equal(other.summary.totalSuppliers, 1); assert.equal(other.summary.totalRFQs, 1);
    assert.equal(other.summary.totalQuotations, 2); assert.equal(other.summary.selectedQuotations, 1);
  });
  await test('Recent records completely user-scoped', async () => {
    const other = await dashboard(tokenB); assert.ok(other.recentRFQs.every((row) => row._id === foreignRFQ._id));
    assert.ok(other.recentQuotations.every((row) => row.supplierId._id === foreignSupplier._id));
  });
  await test('Savings completely user-scoped', async () => {
    assert.equal((await dashboard(tokenB)).summary.estimatedSavings, 400); assert.equal((await dashboard()).summary.estimatedSavings, 200);
  });
  await test('Malformed historical Completed RFQs safely skipped', async () => {
    for (const [index, selectedQuotationId] of [null, new mongoose.Types.ObjectId(), selected._id, foreignWinner._id].entries()) {
      await RFQ.create({ userId: userA._id, referenceNumber: `P7-MALFORMED-${index}`, title: 'Historical record', requestDate: new Date(),
        status: 'Completed', selectedQuotationId, items: [{ itemName: item.name, quantity: 1, unit: 'Piece' }] });
    }
    assert.equal((await dashboard()).summary.estimatedSavings, 200);
  });
  await test('Foreign populated relationships never leak', async () => {
    await Quotation.collection.insertOne({ userId: userA._id, supplierId: new mongoose.Types.ObjectId(foreignSupplier._id),
      rfqId: new mongoose.Types.ObjectId(foreignRFQ._id), grandTotal: 1, status: 'Received', createdAt: new Date() });
    const row = (await dashboard()).recentQuotations[0]; assert.equal(row.supplierId, null); assert.equal(row.rfqId, null);
  });
  await test('Used supplier protection and ownership regression', async () => {
    assert.equal((await call(`/suppliers/${suppliers[0]._id}`, tokenA, 'DELETE')).status, 400);
    assert.equal((await call(`/suppliers/${suppliers[0]._id}`, tokenB)).status, 404);
    assert.equal((await call(`/rfqs/${first._id}`, tokenB)).status, 404);
  });
  process.stdout.write(`Completed ${passed} Phase 7 test groups.\n`);
} finally {
  const users = await User.find({ email: { $in: emails } });
  const ownership = { userId: { $in: users.map((user) => user._id) } };
  await Quotation.deleteMany(ownership); await RFQ.deleteMany(ownership); await Item.deleteMany(ownership); await Supplier.deleteMany(ownership);
  await User.deleteMany({ _id: { $in: users.map((user) => user._id) } });
  await mongoose.disconnect();
}
