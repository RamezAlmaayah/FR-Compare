import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { access } from 'node:fs/promises';
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

dotenv.config({ quiet: true });
const api = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
const runId = Date.now();
const emails = [`phase5-a-${runId}@example.com`, `phase5-b-${runId}@example.com`];
const password = randomUUID();
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCfAAf/2Q==', 'base64');
let completed = 0;
const call = async (path, method = 'GET', body, token) => {
  const response = await fetch(`${api}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
};
const expectStatus = (result, status) => assert.equal(result.status, status, JSON.stringify(result.data));
const rfqEditData = (rfq) => ({ ...rfq, requestDate: rfq.requestDate.slice(0, 10), requiredByDate: rfq.requiredByDate?.slice(0, 10) || '' });
const test = async (name, action) => { await action(); completed += 1; process.stdout.write(`PASS — ${name}\n`); };
const fileExists = async (image) => {
  try { await access(join(uploadsDirectory, basename(image))); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
};
const uploadQuotation = async (data, token, extension, id) => {
  const form = new FormData();
  for (const [field, value] of Object.entries(data)) form.append(field, typeof value === 'object' ? JSON.stringify(value) : value);
  const mime = extension === 'png' ? 'image/png' : extension === 'gif' ? 'image/gif' : 'image/jpeg';
  form.append('image', new Blob([extension === 'png' ? png : jpeg], { type: mime }), `quotation.${extension}`);
  const response = await fetch(`${api}/quotations${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  return { status: response.status, data: await response.json() };
};
const register = async (email) => {
  expectStatus(await call('/auth/register', 'POST', { name: 'Phase 5 Test', email, password }), 201);
  const login = await call('/auth/login', 'POST', { email, password });
  expectStatus(login, 200);
  return login.data.token;
};

try {
  const tokenA = await register(emails[0]);
  const tokenB = await register(emails[1]);
  const createSupplier = async (name, token) => {
    const result = await call('/suppliers', 'POST', { name }, token);
    expectStatus(result, 201);
    return result.data.supplier;
  };
  const suppliers = [];
  for (const name of ['TechSource', 'Future Systems', 'Smart Office']) suppliers.push(await createSupplier(name, tokenA));
  const foreignSupplier = await createSupplier('Foreign Supplier', tokenB);
  const rfqData = (referenceNumber) => ({ referenceNumber, title: 'Quotation Test Purchase', requestDate: '2026-09-16', status: 'Open', items: ['Laptop', 'Monitor', 'Mouse'].map((itemName) => ({ itemName, description: `Standard ${itemName}`, quantity: 10, unit: 'Piece' })) });
  const createRFQ = async (reference, token) => {
    const result = await call('/rfqs', 'POST', rfqData(reference), token);
    expectStatus(result, 201);
    return result.data.rfq;
  };
  const rfq = await createRFQ('PHASE5-A', tokenA);
  const foreignRFQ = await createRFQ('PHASE5-B', tokenB);
  const otherRFQ = await createRFQ('PHASE5-OTHER', tokenA);
  const quoteData = (supplierId = suppliers[0]._id, prices = [500, 120, 15], changes = {}) => ({
    rfqId: rfq._id, supplierId, quotationReference: 'TEST-QUOTE', quotationDate: '2026-09-16', deliveryDays: 5,
    itemPrices: rfq.items.map((item, index) => ({ rfqItemId: item._id, unitPrice: prices[index] })), ...changes,
  });
  const quotations = [];
  const scenarios = [
    { prices: [500, 120, 15], cost: 100, discount: 50, lines: [5000, 1200, 150], subtotal: 6350, total: 6400 },
    { prices: [480, 130, 17], cost: 50, discount: 0, lines: [4800, 1300, 170], subtotal: 6270, total: 6320 },
    { prices: [510, 115, 14], cost: 0, discount: 90, lines: [5100, 1150, 140], subtotal: 6390, total: 6300 },
  ];
  for (const [index, scenario] of scenarios.entries()) {
    await test(`Calculation scenario ${index + 1}: lines/subtotal/grand total`, async () => {
      const result = await call('/quotations', 'POST', quoteData(suppliers[index]._id, scenario.prices, { additionalCost: scenario.cost, discount: scenario.discount }), tokenA);
      expectStatus(result, 201);
      const quotation = result.data.quotation;
      assert.deepEqual(quotation.itemPrices.map((row) => row.lineTotal), scenario.lines);
      assert.equal(quotation.subtotal, scenario.subtotal);
      assert.equal(quotation.grandTotal, scenario.total);
      assert.equal(quotation.status, 'Received');
      quotations.push(quotation);
    });
  }
  const invalidCases = [
    ['Foreign RFQ', { rfqId: foreignRFQ._id }], ['Foreign Supplier', { supplierId: foreignSupplier._id }],
    ['Missing RFQ', { rfqId: '' }], ['Missing Supplier', { supplierId: '' }],
    ['Missing price row', { itemPrices: quoteData().itemPrices.slice(0, 2) }],
    ['Duplicate RFQ item', { itemPrices: [quoteData().itemPrices[0], quoteData().itemPrices[0], quoteData().itemPrices[2]] }],
    ['Unknown RFQ item', { itemPrices: quoteData().itemPrices.map((row, index) => index ? row : { ...row, rfqItemId: new mongoose.Types.ObjectId().toString() }) }],
    ['Another RFQ item', { itemPrices: quoteData().itemPrices.map((row, index) => index ? row : { ...row, rfqItemId: otherRFQ.items[0]._id }) }],
    ...[-1, 'invalid', 'NaN', 'Infinity', '', null, true, ' '].map((unitPrice) => [`Invalid unit price ${String(unitPrice)}`, { itemPrices: quoteData().itemPrices.map((row, index) => index ? row : { ...row, unitPrice }) }]),
    ['Negative additional cost', { additionalCost: -1 }], ['Invalid additional cost', { additionalCost: 'Infinity' }],
    ['Negative discount', { discount: -1 }], ['Invalid discount', { discount: 'NaN' }], ['Negative grand total', { discount: 999999 }],
    ['Negative delivery', { deliveryDays: -1 }], ['Fractional delivery', { deliveryDays: 1.5 }], ['Invalid delivery', { deliveryDays: 'NaN' }],
    ['Missing quotation date', { quotationDate: '' }], ['Invalid quotation date', { quotationDate: '2026-02-30' }], ['Invalid validity date', { validUntil: 'not-a-date' }],
    ['Manual winner status', { status: 'Selected' }],
  ];
  for (const [name, changes] of invalidCases) await test(name, async () => expectStatus(await call('/quotations', 'POST', quoteData(undefined, undefined, changes), tokenA), 400));
  await test('Trusted quantity, item name/catalog identity and totals; zero prices/cost/discount; optional delivery', async () => {
    const data = quoteData(undefined, [0, 0, 0], { subtotal: 999, grandTotal: 999, userId: foreignRFQ.userId, deliveryDays: '', additionalCost: 0, discount: 0 });
    data.itemPrices = data.itemPrices.map((row) => ({ ...row, quantity: 1, itemName: 'Tampered', itemId: foreignRFQ.items[0].itemId, lineTotal: 999 }));
    const result = await call('/quotations', 'POST', data, tokenA);
    expectStatus(result, 201);
    assert.equal(result.data.quotation.grandTotal, 0);
    assert.equal(result.data.quotation.deliveryDays, null);
    result.data.quotation.itemPrices.forEach((row, index) => {
      assert.equal(row.quantity, 10); assert.equal(row.itemName, rfq.items[index].itemName); assert.equal(row.itemId, rfq.items[index].itemId);
    });
    expectStatus(await call(`/quotations/${result.data.quotation._id}`, 'DELETE', undefined, tokenA), 200);
  });
  const foreignResult = await call('/quotations', 'POST', { ...quoteData(foreignSupplier._id), rfqId: foreignRFQ._id, itemPrices: foreignRFQ.items.map((item) => ({ rfqItemId: item._id, unitPrice: 1 })) }, tokenB);
  expectStatus(foreignResult, 201);
  await test('Two-way quotation ownership and user-scoped list/filter', async () => {
    for (const [token, id] of [[tokenA, foreignResult.data.quotation._id], [tokenB, quotations[0]._id]]) {
      for (const method of ['GET', 'PUT', 'DELETE']) expectStatus(await call(`/quotations/${id}`, method, method === 'PUT' ? quoteData() : undefined, token), 404);
    }
    const own = await call(`/quotations?rfqId=${rfq._id}`, 'GET', undefined, tokenA);
    assert.equal(own.data.totalItems, 3);
    assert.ok(own.data.quotations.every((quotation) => quotation.rfqId._id === rfq._id));
    assert.equal((await call(`/quotations?rfqId=${foreignRFQ._id}`, 'GET', undefined, tokenA)).data.totalItems, 0);
  });
  await test('Details / RFQ filter / supplier filter / pagination / sort', async () => {
    expectStatus(await call(`/quotations/${quotations[0]._id}`, 'GET', undefined, tokenA), 200);
    const list = await call(`/quotations?rfqId=${rfq._id}&page=2&limit=2&sort=lowest`, 'GET', undefined, tokenA);
    assert.equal(list.data.totalItems, 3); assert.equal(list.data.totalPages, 2); assert.equal(list.data.quotations[0].grandTotal, 6400);
    assert.equal((await call(`/quotations?supplierId=${suppliers[1]._id}&status=Received`, 'GET', undefined, tokenA)).data.totalItems, 1);
  });
  await test('Update revalidates relationships and recalculates authoritative totals', async () => {
    const result = await call(`/quotations/${quotations[0]._id}`, 'PUT', quoteData(undefined, [501, 121, 16], { additionalCost: 20, discount: 10, grandTotal: 1 }), tokenA);
    expectStatus(result, 200); assert.equal(result.data.quotation.subtotal, 6380); assert.equal(result.data.quotation.grandTotal, 6390);
    expectStatus(await call(`/quotations/${quotations[0]._id}`, 'PUT', quoteData(foreignSupplier._id), tokenA), 400);
    expectStatus(await call(`/quotations/${quotations[0]._id}`, 'PUT', quoteData(undefined, undefined, { rfqId: otherRFQ._id }), tokenA), 400);
  });
  for (const extension of ['jpg', 'jpeg', 'png']) await test(`Upload ${extension}`, async () => {
    const result = await uploadQuotation(quoteData(), tokenA, extension);
    expectStatus(result, 201); assert.ok(await fileExists(result.data.quotation.image));
    assert.equal((await fetch(`${api.replace('/api', '')}${result.data.quotation.image}`)).status, 200);
    expectStatus(await call(`/quotations/${result.data.quotation._id}`, 'DELETE', undefined, tokenA), 200);
    assert.equal(await fileExists(result.data.quotation.image), false);
  });
  await test('Unsupported image rejection', async () => expectStatus(await uploadQuotation(quoteData(), tokenA, 'gif'), 400));
  await test('Image preservation / replacement cleanup / deletion cleanup', async () => {
    const created = await uploadQuotation(quoteData(), tokenA, 'png');
    expectStatus(created, 201);
    const id = created.data.quotation._id;
    const originalImage = created.data.quotation.image;
    const unchanged = await call(`/quotations/${id}`, 'PUT', quoteData(), tokenA);
    expectStatus(unchanged, 200); assert.equal(unchanged.data.quotation.image, originalImage);
    const replaced = await uploadQuotation(quoteData(), tokenA, 'jpg', id);
    expectStatus(replaced, 200); assert.equal(await fileExists(originalImage), false); assert.ok(await fileExists(replaced.data.quotation.image));
    expectStatus(await call(`/quotations/${id}`, 'DELETE', undefined, tokenA), 200);
    assert.equal(await fileExists(replaced.data.quotation.image), false);
  });
  await test('Missing/invalid JWT and malformed/unknown IDs', async () => {
    for (const token of [undefined, 'invalid.token']) expectStatus(await call('/quotations', 'GET', undefined, token), 401);
    for (const id of ['invalid', new mongoose.Types.ObjectId().toString()]) {
      for (const method of ['GET', 'PUT', 'DELETE']) expectStatus(await call(`/quotations/${id}`, method, method === 'PUT' ? quoteData() : undefined, tokenA), 404);
    }
    expectStatus(await call('/quotations?rfqId=invalid', 'GET', undefined, tokenA), 400);
  });
  await test('Supplier deletion allowed unused / blocked used', async () => {
    const unused = await createSupplier('Unused Supplier', tokenA);
    expectStatus(await call(`/suppliers/${unused._id}`, 'DELETE', undefined, tokenA), 200);
    expectStatus(await call(`/suppliers/${suppliers[0]._id}`, 'DELETE', undefined, tokenA), 400);
  });
  await test('RFQ edits allowed without quotations / safe metadata allowed / quoted item changes blocked', async () => {
    const edited = { ...rfqData(otherRFQ.referenceNumber), items: otherRFQ.items.map((item) => ({ ...item, quantity: 11 })) };
    expectStatus(await call(`/rfqs/${otherRFQ._id}`, 'PUT', edited, tokenA), 200);
    const current = rfqEditData((await call(`/rfqs/${rfq._id}`, 'GET', undefined, tokenA)).data.rfq);
    assert.equal(current.status, 'Under Comparison'); assert.equal(current.quotationCount, 3);
    expectStatus(await call(`/rfqs/${rfq._id}`, 'PUT', { ...current, title: 'Metadata Updated' }, tokenA), 200);
    expectStatus(await call(`/rfqs/${rfq._id}`, 'PUT', { ...current, items: current.items.map((item) => ({ ...item, quantity: 1 })) }, tokenA), 400);
    expectStatus(await call(`/rfqs/${rfq._id}`, 'PUT', { ...current, items: current.items.slice(1) }, tokenA), 400);
    const safe = (await call(`/quotations/${quotations[0]._id}`, 'GET', undefined, tokenA)).data.quotation;
    assert.ok(safe.itemPrices.every((row) => row.quantity === 10));
  });
  await test('RFQ lifecycle follows counts; Draft/Cancelled creation blocked; Cancelled preserved', async () => {
    const lifecycle = await createRFQ('LIFECYCLE', tokenA);
    const data = { ...quoteData(), rfqId: lifecycle._id, itemPrices: lifecycle.items.map((item) => ({ rfqItemId: item._id, unitPrice: 1 })) };
    const first = await call('/quotations', 'POST', data, tokenA); expectStatus(first, 201);
    assert.equal((await call(`/rfqs/${lifecycle._id}`, 'GET', undefined, tokenA)).data.rfq.status, 'Open');
    const second = await call('/quotations', 'POST', data, tokenA); expectStatus(second, 201);
    assert.equal((await call(`/rfqs/${lifecycle._id}`, 'GET', undefined, tokenA)).data.rfq.status, 'Under Comparison');
    expectStatus(await call(`/quotations/${second.data.quotation._id}`, 'DELETE', undefined, tokenA), 200);
    assert.equal((await call(`/rfqs/${lifecycle._id}`, 'GET', undefined, tokenA)).data.rfq.status, 'Open');
    const current = rfqEditData((await call(`/rfqs/${lifecycle._id}`, 'GET', undefined, tokenA)).data.rfq);
    expectStatus(await call(`/rfqs/${lifecycle._id}`, 'PUT', { ...current, status: 'Cancelled' }, tokenA), 200);
    expectStatus(await call('/quotations', 'POST', data, tokenA), 400);
    expectStatus(await call(`/quotations/${first.data.quotation._id}`, 'DELETE', undefined, tokenA), 200);
    assert.equal((await call(`/rfqs/${lifecycle._id}`, 'GET', undefined, tokenA)).data.rfq.status, 'Cancelled');
    expectStatus(await call(`/rfqs/${lifecycle._id}`, 'PUT', { ...current, status: 'Draft' }, tokenA), 200);
    expectStatus(await call('/quotations', 'POST', data, tokenA), 400);
  });
  await test('RFQ cascade deletes multiple quotations/images and preserves foreign records', async () => {
    const uploaded = await uploadQuotation(quoteData(), tokenA, 'png'); expectStatus(uploaded, 201);
    expectStatus(await call(`/rfqs/${rfq._id}`, 'DELETE', undefined, tokenA), 200);
    assert.equal((await call(`/quotations?rfqId=${rfq._id}`, 'GET', undefined, tokenA)).data.totalItems, 0);
    assert.equal(await fileExists(uploaded.data.quotation.image), false);
    expectStatus(await call(`/quotations/${foreignResult.data.quotation._id}`, 'GET', undefined, tokenB), 200);
    expectStatus(await call(`/rfqs/${otherRFQ._id}`, 'DELETE', undefined, tokenA), 200);
  });
  process.stdout.write(`Completed ${completed} Phase 5 test groups.\n`);
} finally {
  await mongoose.connect(process.env.MONGO_URI);
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
