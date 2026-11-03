import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item.js';
import RFQ from '../models/RFQ.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import deleteUploadedFile from '../utils/fileStorage.js';

dotenv.config({ quiet: true });
const api = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
const runId = Date.now();
const password = randomUUID();
const emails = [`phase4-a-${runId}@example.com`, `phase4-b-${runId}@example.com`];
const results = [];

const call = async (path, method = 'GET', body, token) => {
  const response = await fetch(`${api}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
};
const expectStatus = (result, status) => assert.equal(result.status, status, JSON.stringify(result.data));
const test = async (name, action) => {
  await action();
  results.push(name);
  process.stdout.write(`PASS — ${name}\n`);
};
const registerAndLogin = async (email) => {
  const registration = await call('/auth/register', 'POST', { name: 'Phase 4 Test', email, password });
  expectStatus(registration, 201);
  assert.ok(!('password' in registration.data.user));
  const login = await call('/auth/login', 'POST', { email, password });
  expectStatus(login, 200);
  assert.ok(login.data.token.split('.').length === 3);
  return login.data.token;
};
const row = (itemName = 'Laptop', changes = {}) => ({ itemName, description: 'Standard Laptop', quantity: 2, unit: 'Piece', notes: '', ...changes });
const rfqData = (referenceNumber, changes = {}) => ({ referenceNumber, title: 'Laptop Purchase', category: 'IT Equipment', requestDate: '2026-09-16', requiredByDate: '2026-10-01', status: 'Open', items: [row()], ...changes });

try {
  const tokenA = await registerAndLogin(emails[0]);
  const tokenB = await registerAndLogin(emails[1]);
  await test('Regression register/login/JWT/me', async () => {
    const me = await call('/auth/me', 'GET', undefined, tokenA);
    expectStatus(me, 200);
    assert.equal(me.data.user.email, emails[0]);
    assert.ok(!('password' in me.data.user));
    expectStatus(await call('/auth/me'), 401);
    expectStatus(await call('/auth/me', 'GET', undefined, 'invalid.token'), 401);
  });
  await test('Regression API test / CORS / JSON', async () => {
    const result = await call('/test');
    expectStatus(result, 200);
    assert.equal(result.data.message, 'FR Compare API is running');
    const response = await fetch(`${api}/items`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' } });
    assert.ok(response.headers.get('access-control-allow-origin'));
  });
  await test('Item/RFQ endpoints require authentication', async () => {
    for (const endpoint of ['/items', '/rfqs']) expectStatus(await call(endpoint), 401);
  });
  let laptop;
  let foreignItem;
  await test('Create Item', async () => {
    const result = await call('/items', 'POST', { name: ' Laptop ', defaultUnit: 'Piece', description: 'Standard Laptop', category: 'IT Equipment', normalizedName: 'untrusted', userId: '000000000000000000000000' }, tokenA);
    expectStatus(result, 201);
    laptop = result.data.item;
    assert.equal(laptop.name, 'Laptop');
    assert.equal(laptop.normalizedName, 'laptop');
    assert.notEqual(laptop.userId, '000000000000000000000000');
  });
  for (const [name, body] of [
    ['Missing Item name', { defaultUnit: 'Piece' }], ['Missing Item unit', { name: 'No unit' }],
  ]) await test(name, async () => expectStatus(await call('/items', 'POST', body, tokenA), 400));
  await test('Duplicate normalized names per user', async () => {
    for (const name of ['Laptop', 'laptop', ' Laptop ']) expectStatus(await call('/items', 'POST', { name, defaultUnit: 'Piece' }, tokenA), 400);
    expectStatus(await call('/items', 'POST', { name: 'Lap   Top', defaultUnit: 'Piece' }, tokenA), 201);
    expectStatus(await call('/items', 'POST', { name: 'lap top', defaultUnit: 'Piece' }, tokenA), 400);
    expectStatus(await call('/items', 'POST', { name: 'لابتوب', defaultUnit: 'Piece' }, tokenA), 201);
  });
  await test('Same Item name across different users', async () => {
    const result = await call('/items', 'POST', { name: 'Laptop', defaultUnit: 'Piece' }, tokenB);
    expectStatus(result, 201);
    foreignItem = result.data.item;
  });
  await test('Item search / category filter', async () => {
    const search = await call('/items?search=Lap&category=IT%20Equipment', 'GET', undefined, tokenA);
    expectStatus(search, 200);
    assert.deepEqual(search.data.items.map((item) => item._id), [laptop._id]);
  });
  await test('Get Item / unknown ID', async () => {
    expectStatus(await call(`/items/${laptop._id}`, 'GET', undefined, tokenA), 200);
    expectStatus(await call('/items/not-an-id', 'GET', undefined, tokenA), 404);
  });
  await test('Delete unused Item', async () => {
    const created = await call('/items', 'POST', { name: 'Unused', defaultUnit: 'Box' }, tokenA);
    expectStatus(created, 201);
    expectStatus(await call(`/items/${created.data.item._id}`, 'DELETE', undefined, tokenA), 200);
  });
  let originalRFQ;
  await test('Valid RFQ / existing Item selection / snapshots / embedded IDs', async () => {
    const result = await call('/rfqs', 'POST', rfqData('RFQ-001', { items: [row('Laptop', { itemId: laptop._id })] }), tokenA);
    expectStatus(result, 201);
    originalRFQ = result.data.rfq;
    assert.equal(originalRFQ.items[0].itemId, laptop._id);
    assert.equal(originalRFQ.items[0].itemName, 'Laptop');
    assert.equal(originalRFQ.items[0].description, 'Standard Laptop');
    assert.equal(originalRFQ.items[0].unit, 'Piece');
    assert.ok(originalRFQ.items[0]._id);
  });
  await test('RFQ with 3+ items / new typed auto-create / normalized reuse', async () => {
    const result = await call('/rfqs', 'POST', rfqData('RFQ-002', { items: [row('LAPTOP'), row('Monitor'), row('Mouse')] }), tokenA);
    expectStatus(result, 201);
    assert.equal(result.data.rfq.items.length, 3);
    assert.equal(result.data.rfq.items[0].itemId, laptop._id);
    const catalog = await call('/items', 'GET', undefined, tokenA);
    assert.equal(catalog.data.items.filter((item) => item.normalizedName === 'laptop').length, 1);
    assert.ok(catalog.data.items.some((item) => item.name === 'Monitor'));
  });
  const validationCases = [
    ['Missing reference', { referenceNumber: '' }], ['Missing title', { title: '' }], ['Missing request date', { requestDate: '' }],
    ['Invalid request date', { requestDate: '2026-02-30' }], ['Zero items', { items: [] }],
    ['Missing item name', { items: [row('')] }], ['Missing unit', { items: [row('Laptop', { unit: '' })] }],
    ['Zero quantity', { items: [row('Laptop', { quantity: 0 })] }], ['Negative quantity', { items: [row('Laptop', { quantity: -2 })] }],
    ['Invalid quantity', { items: [row('Laptop', { quantity: 'invalid' })] }], ['Invalid status', { status: 'Unknown' }],
    ['Deferred workflow status rejected', { status: 'Completed' }],
  ];
  for (const [name, changes] of validationCases) await test(name, async () => expectStatus(await call('/rfqs', 'POST', rfqData(`INVALID-${name}`, changes), tokenA), 400));
  await test('Duplicate reference same user', async () => expectStatus(await call('/rfqs', 'POST', rfqData(' RFQ-001 '), tokenA), 400));
  let foreignRFQ;
  await test('Same reference different users', async () => {
    const result = await call('/rfqs', 'POST', rfqData('RFQ-001', { items: [row('Laptop', { itemId: foreignItem._id })] }), tokenB);
    expectStatus(result, 201);
    foreignRFQ = result.data.rfq;
  });
  await test('Foreign Item attachment rejected', async () => {
    expectStatus(await call('/rfqs', 'POST', rfqData('FOREIGN', { items: [row('Foreign', { itemId: foreignItem._id })] }), tokenA), 400);
  });
  await test('Two-way Item and RFQ ownership', async () => {
    for (const [token, item, rfq] of [[tokenA, foreignItem, foreignRFQ], [tokenB, laptop, originalRFQ]]) {
      const listedItems = await call('/items', 'GET', undefined, token);
      assert.ok(!listedItems.data.items.some((record) => record._id === item._id));
      const listedRFQs = await call('/rfqs', 'GET', undefined, token);
      assert.ok(!listedRFQs.data.rfqs.some((record) => record._id === rfq._id));
      for (const [endpoint, data] of [[`/items/${item._id}`, { name: 'Hacked', defaultUnit: 'Piece' }], [`/rfqs/${rfq._id}`, rfqData('HACKED')]]) {
        expectStatus(await call(endpoint, 'GET', undefined, token), 404);
        expectStatus(await call(endpoint, 'PUT', data, token), 404);
        expectStatus(await call(endpoint, 'DELETE', undefined, token), 404);
      }
    }
  });
  await test('Used Item cannot be deleted', async () => expectStatus(await call(`/items/${laptop._id}`, 'DELETE', undefined, tokenA), 400));
  await test('Edit Item / historical snapshot remains unchanged / future values', async () => {
    expectStatus(await call(`/items/${laptop._id}`, 'PUT', { name: 'Developer Laptop', description: 'New developer spec', defaultUnit: 'Set', category: 'IT Equipment' }, tokenA), 200);
    const historical = await call(`/rfqs/${originalRFQ._id}`, 'GET', undefined, tokenA);
    assert.equal(historical.data.rfq.items[0].itemName, 'Laptop');
    assert.equal(historical.data.rfq.items[0].description, 'Standard Laptop');
    assert.equal(historical.data.rfq.items[0].unit, 'Piece');
    const future = await call('/rfqs', 'POST', rfqData('FUTURE', { items: [row('Developer Laptop', { itemId: laptop._id, description: 'New developer spec', unit: 'Set' })] }), tokenA);
    expectStatus(future, 201);
    assert.equal(future.data.rfq.items[0].unit, 'Set');
  });
  await test('RFQ update / add item / remove item / preserve embedded ID', async () => {
    const updated = await call(`/rfqs/${originalRFQ._id}`, 'PUT', rfqData('RFQ-001', { title: 'Updated Purchase', items: [...originalRFQ.items, row('Added Item')] }), tokenA);
    expectStatus(updated, 200);
    assert.equal(updated.data.rfq.items.length, 2);
    assert.equal(updated.data.rfq.items[0]._id, originalRFQ.items[0]._id);
    const removed = await call(`/rfqs/${originalRFQ._id}`, 'PUT', rfqData('RFQ-001', { items: [updated.data.rfq.items[0]] }), tokenA);
    expectStatus(removed, 200);
    assert.equal(removed.data.rfq.items.length, 1);
  });
  for (let index = 0; index < 5; index += 1) {
    expectStatus(await call('/rfqs', 'POST', rfqData(`PAGE-${index}`, { status: 'Draft', category: 'General', requiredByDate: `2026-10-${String(index + 2).padStart(2, '0')}` }), tokenA), 201);
  }
  await test('RFQ search title/reference / status / category / combined', async () => {
    for (const query of ['search=Laptop', 'search=RFQ-001', 'status=Draft', 'category=General', 'search=PAGE&status=Draft&category=General']) {
      const result = await call(`/rfqs?${query}`, 'GET', undefined, tokenA);
      expectStatus(result, 200);
      assert.ok(result.data.totalItems > 0);
      if (query.includes('PAGE')) assert.equal(result.data.totalItems, 5);
    }
  });
  await test('RFQ pagination', async () => {
    const result = await call('/rfqs?page=2&limit=6', 'GET', undefined, tokenA);
    assert.equal(result.data.currentPage, 2);
    assert.equal(result.data.totalItems, 8);
    assert.equal(result.data.totalPages, 2);
    assert.equal(result.data.rfqs.length, 2);
  });
  for (const [sort, field, direction] of [['newest', 'createdAt', -1], ['oldest', 'createdAt', 1], ['requiredDate', 'requiredByDate', 1]]) {
    await test(`RFQ ${sort} sorting`, async () => {
      const result = await call(`/rfqs?sort=${sort}&limit=50`, 'GET', undefined, tokenA);
      const times = result.data.rfqs.map((record) => new Date(record[field]).getTime());
      assert.ok(times.every((time, index) => !index || (time - times[index - 1]) * direction >= 0));
    });
  }
  await test('RFQ details / unknown ID / deletion', async () => {
    expectStatus(await call(`/rfqs/${originalRFQ._id}`, 'GET', undefined, tokenA), 200);
    expectStatus(await call('/rfqs/not-an-id', 'GET', undefined, tokenA), 404);
    expectStatus(await call(`/rfqs/${originalRFQ._id}`, 'DELETE', undefined, tokenA), 200);
    expectStatus(await call(`/rfqs/${originalRFQ._id}`, 'GET', undefined, tokenA), 404);
  });
  await test('Phase 3 Supplier CRUD/search/filter/pagination/image/ownership regression', async () => {
    const form = new FormData();
    form.append('name', 'Regression Supplier');
    form.append('contactPerson', 'Regression Contact');
    form.append('category', 'General');
    form.append('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'logo.png');
    const response = await fetch(`${api}/suppliers`, { method: 'POST', headers: { Authorization: `Bearer ${tokenA}` }, body: form });
    assert.equal(response.status, 201);
    const { supplier } = await response.json();
    assert.equal((await fetch(`${api.replace('/api', '')}${supplier.image}`)).status, 200);
    const list = await call('/suppliers?search=Regression&category=General&page=1&limit=6', 'GET', undefined, tokenA);
    assert.equal(list.data.totalItems, 1);
    expectStatus(await call(`/suppliers/${supplier._id}`, 'GET', undefined, tokenA), 200);
    expectStatus(await call(`/suppliers/${supplier._id}`, 'GET', undefined, tokenB), 404);
    expectStatus(await call(`/suppliers/${supplier._id}`, 'PUT', { name: 'Updated Regression' }, tokenA), 200);
    expectStatus(await call(`/suppliers/${supplier._id}`, 'DELETE', undefined, tokenA), 200);
  });
  process.stdout.write(`Completed ${results.length} integration test groups.\n`);
} finally {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ email: { $in: emails } });
  const userIds = users.map((user) => user._id);
  const suppliers = await Supplier.find({ userId: { $in: userIds } });
  for (const supplier of suppliers) await deleteUploadedFile(supplier.image);
  await Supplier.deleteMany({ userId: { $in: userIds } });
  await RFQ.deleteMany({ userId: { $in: userIds } });
  await Item.deleteMany({ userId: { $in: userIds } });
  await User.deleteMany({ _id: { $in: userIds } });
  await mongoose.disconnect();
}
