import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import mongoose from 'mongoose';
import { freePort, startBackend, stopBackend, backendDirectory } from '../tests/serverHarness.js';

// Never use the developer's .env/database. These databases and files are disposable fixtures.
const database = `fr_compare_regression_test_${randomUUID().replaceAll('-', '')}`;
const environment = { NODE_ENV: 'test', PORT: String(await freePort()),
  MONGO_URI: `mongodb://127.0.0.1:27017/${database}`, JWT_SECRET: randomBytes(48).toString('hex'),
  UPLOAD_STORAGE: 'local', UPLOAD_DIR: await mkdtemp(join(tmpdir(), 'fr-compare-regression-')),
  CORS_ORIGINS: 'http://localhost:5173,http://127.0.0.1:5173', TRUST_PROXY_HOPS: '0' };
let server;
try {
  server = await startBackend(environment);
  for (const phase of [4, 5, 6, 7]) {
    const child = spawn(process.execPath, [`tests/phase${phase}.test.js`], { cwd: backendDirectory,
      env: { ...process.env, ...environment }, stdio: 'inherit', windowsHide: true });
    const [code] = await once(child, 'exit');
    if (code !== 0) throw new Error(`Phase ${phase} failed`);
  }
} finally {
  if (server) {
    await stopBackend(server.child);
    await mongoose.connect(environment.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    if (!mongoose.connection.name.startsWith('fr_compare_regression_test_')) throw new Error('Refusing cleanup of a non-test database');
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
}
