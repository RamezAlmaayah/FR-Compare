import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const backendDirectory = fileURLToPath(new URL('../', import.meta.url));
const freePort = async () => {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  return port;
};
const startBackend = async (environment) => {
  const child = spawn(process.execPath, ['server.js'], { cwd: backendDirectory,
    env: { ...process.env, ...environment }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let output = '';
  child.stdout.on('data', (data) => { output += data; });
  child.stderr.on('data', (data) => { output += data; });
  const base = `http://127.0.0.1:${environment.PORT}`;
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Backend exited before readiness: ${output}`);
    try { if ((await fetch(`${base}/api/health`)).status === 200) return { child, base, output: () => output }; } catch {}
    await delay(100);
  }
  await stopBackend(child);
  throw new Error(`Backend readiness timed out: ${output}`);
};
const stopBackend = async (child) => {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  await exited;
};
export { freePort, startBackend, stopBackend, backendDirectory };
