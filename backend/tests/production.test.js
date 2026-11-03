import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import getRuntimeConfig from '../config/runtime.js';
import { freePort, startBackend, stopBackend } from './serverHarness.js';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

test('production HTTP, authentication, ownership, validation, and durable uploads', async (t) => {
  const database = `fr_compare_production_test_${randomUUID().replaceAll('-', '')}`;
  const uploadDir = await mkdtemp(join(tmpdir(), 'fr-compare-gridfs-check-'));
  const env = { NODE_ENV: 'production', PORT: String(await freePort()), MONGO_URI: `mongodb://127.0.0.1:27017/${database}`,
    JWT_SECRET: randomBytes(48).toString('hex'), CORS_ORIGINS: 'https://frcompare.netlify.app',
    UPLOAD_STORAGE: 'gridfs', UPLOAD_DIR: uploadDir, TRUST_PROXY_HOPS: '0' };
  let server;
  let tokenA, tokenB, image, supplierId;
  const password = randomUUID();
  const call = async (path, { token, method = 'GET', body, headers = {} } = {}) => {
    const response = await fetch(`${server.base}${path}`, { method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
    return response;
  };
  const createImage = async (bytes = png, filename = 'logo.png') => {
    const body = new FormData(); body.set('name', 'Production QA Supplier');
    body.set('image', new Blob([bytes], { type: 'image/png' }), filename);
    return call('/api/suppliers', { token: tokenA, method: 'POST', body });
  };
  try {
    await t.test('production configuration rejects missing/weak secrets, wildcard origins, and ephemeral disk defaults', () => {
      assert.throws(() => getRuntimeConfig({ NODE_ENV: 'production' }));
      assert.throws(() => getRuntimeConfig({ ...env, JWT_SECRET: 'weak' }));
      assert.throws(() => getRuntimeConfig({ ...env, CORS_ORIGINS: '*' }));
      assert.throws(() => getRuntimeConfig({ ...env, UPLOAD_STORAGE: 'local', UPLOAD_DIR: '' }));
      assert.throws(() => getRuntimeConfig({ ...env, PORT: '-1' }));
    });
    server = await startBackend(env);
    await t.test('health is ready, minimal, and not cached; security headers are set', async () => {
      const response = await call('/api/health'); assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: 'ok' });
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('x-powered-by'), null);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    });
    await t.test('Netlify CORS preflight allows JWT requests and rejects unrelated origins', async () => {
      const allowed = await call('/api/suppliers', { method: 'OPTIONS', headers: { Origin: env.CORS_ORIGINS,
        'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' } });
      assert.equal(allowed.status, 204); assert.equal(allowed.headers.get('access-control-allow-origin'), env.CORS_ORIGINS);
      const rejected = await call('/api/health', { headers: { Origin: 'https://untrusted.example' } });
      assert.equal(rejected.status, 403); assert.equal(rejected.headers.get('access-control-allow-origin'), null);
    });
    await t.test('bad JSON, oversized JSON, missing bodies, and unknown routes fail consistently', async () => {
      const bad = await fetch(`${server.base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
      assert.equal(bad.status, 400); assert.deepEqual(await bad.json(), { error: 'Invalid JSON payload' });
      assert.equal((await call('/api/auth/register', { method: 'POST' })).status, 400);
      assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'a'.repeat(1024 * 1024 + 1) } })).status, 413);
      const missing = await call('/api/unknown'); assert.equal(missing.status, 404);
      assert.deepEqual(await missing.json(), { error: 'Route not found' });
    });
    await t.test('registration and login work; duplicate accounts and bad credentials fail', async () => {
      for (const suffix of ['a', 'b']) {
        const email = `production-${suffix}-${randomUUID()}@example.com`;
        const registration = { name: `Production QA ${suffix}`, email, password };
        const created = await call('/api/auth/register', { method: 'POST', body: registration });
        assert.equal(created.status, 201); assert.equal('password' in (await created.json()).user, false);
        assert.equal((await call('/api/auth/register', { method: 'POST', body: registration })).status, 400);
        assert.equal((await call('/api/auth/login', { method: 'POST', body: { email, password: 'wrong-password' } })).status, 401);
        const login = await call('/api/auth/login', { method: 'POST', body: { email, password } });
        assert.equal(login.status, 200); const data = await login.json();
        if (suffix === 'a') tokenA = data.token; else tokenB = data.token;
      }
      assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'Weak', email: 'weak@example.com', password: 'short' } })).status, 400);
    });
    await t.test('all business endpoints require JWT; expired, invalid, and wrong-algorithm JWTs fail', async () => {
      for (const path of ['/api/auth/me', '/api/dashboard', '/api/suppliers', '/api/items', '/api/rfqs', '/api/quotations']) {
        assert.equal((await call(path)).status, 401);
        assert.equal((await call(path, { token: 'invalid' })).status, 401);
      }
      const { userId } = jwt.decode(tokenA);
      const expired = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: -1 });
      const algorithm = jwt.sign({ userId }, env.JWT_SECRET, { algorithm: 'HS512' });
      for (const token of [expired, algorithm]) assert.equal((await call('/api/dashboard', { token })).status, 401);
      assert.equal((await call('/api/auth/me', { token: tokenA })).status, 200);
    });
    await t.test('supplier uploads persist in GridFS and only their owner can download them', async () => {
      const response = await createImage(); assert.equal(response.status, 201);
      const data = (await response.json()).supplier; image = data.image; supplierId = data._id;
      assert.equal((await call(image)).status, 401);
      assert.equal((await call(image, { token: tokenB })).status, 404);
      const owned = await call(image, { token: tokenA }); assert.equal(owned.status, 200);
      assert.deepEqual(Buffer.from(await owned.arrayBuffer()), png);
      assert.equal(owned.headers.get('cache-control'), 'private, no-store');
      assert.deepEqual(await readdir(uploadDir), []);
    });
    await t.test('forged image contents, unsupported extensions, oversized files, and path traversal fail', async () => {
      assert.equal((await createImage(Buffer.from('this is not a PNG'))).status, 400);
      assert.equal((await createImage(png, 'logo.svg')).status, 400);
      assert.equal((await createImage(Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]))).status, 413);
      assert.equal((await call('/uploads/%2e%2e%2f.env', { token: tokenA })).status, 404);
    });
    await t.test('uploads, users, indexes, and suppliers survive a full backend process restart', async () => {
      await stopBackend(server.child); server = await startBackend(env);
      const response = await call(image, { token: tokenA }); assert.equal(response.status, 200);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
      assert.equal((await call(`/api/suppliers/${supplierId}`, { token: tokenA })).status, 200);
      await mongoose.connect(env.MONGO_URI);
      for (const [collection, expected] of [['users', 'email_1'], ['items', 'userId_1_normalizedName_1'], ['rfqs', 'userId_1_referenceNumber_1']]) {
        assert.ok((await mongoose.connection.db.collection(collection).indexes()).some((index) => index.name === expected && index.unique));
      }
      assert.equal(await mongoose.connection.db.collection('uploads.files').countDocuments(), 1);
      await mongoose.disconnect();
    });
    await t.test('failed business validation leaves no orphan GridFS images', async () => {
      const body = new FormData(); body.set('image', new Blob([png], { type: 'image/png' }), 'orphan.png');
      assert.equal((await call('/api/suppliers', { token: tokenA, method: 'POST', body })).status, 400);
      await mongoose.connect(env.MONGO_URI);
      assert.equal(await mongoose.connection.db.collection('uploads.files').countDocuments(), 1);
      await mongoose.disconnect();
    });
    await t.test('supplier update and deletion preserve authorization and clean up its test image', async () => {
      assert.equal((await call(`/api/suppliers/${supplierId}`, { token: tokenB, method: 'DELETE' })).status, 404);
      assert.equal((await call(`/api/suppliers/${supplierId}`, { token: tokenA, method: 'PUT', body: { name: 'Updated QA Supplier' } })).status, 200);
      assert.equal((await call(`/api/suppliers/${supplierId}`, { token: tokenA, method: 'DELETE' })).status, 200);
      assert.equal((await call(image, { token: tokenA })).status, 404);
      await mongoose.connect(env.MONGO_URI);
      assert.equal(await mongoose.connection.db.collection('uploads.files').countDocuments(), 0);
      await mongoose.disconnect();
    });
    await t.test('deleted-user tokens are rejected on every protected endpoint', async () => {
      await mongoose.connect(env.MONGO_URI);
      await mongoose.connection.db.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(jwt.decode(tokenB).userId) });
      await mongoose.disconnect();
      assert.equal((await call('/api/dashboard', { token: tokenB })).status, 401);
    });
    await t.test('production authentication rate limiting returns safe JSON', async () => {
      let response;
      for (let i = 0; i < 61; i += 1) {
        response = await call('/api/auth/login', { method: 'POST', body: {} });
        if (response.status === 429) break;
      }
      assert.equal(response.status, 429); assert.ok((await response.json()).error.includes('Too many'));
    });
  } finally {
    if (server) {
      await stopBackend(server.child);
      if (mongoose.connection.readyState !== 1) await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      assert.ok(mongoose.connection.name.startsWith('fr_compare_production_test_'));
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  }
});
