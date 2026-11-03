import dotenv from 'dotenv';
import mongoose from 'mongoose';
import getRuntimeConfig from './config/runtime.js';
import connectDatabase from './config/db.js';

dotenv.config({ quiet: true });

const startServer = async () => {
  const config = getRuntimeConfig();
  const { default: createApp } = await import('./app.js');
  const app = createApp();
  await connectDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const server = app.listen(config.port, '0.0.0.0', () => console.log(`FR Compare API listening on port ${config.port}.`));
  const shutdown = () => {
    if (app.locals.shuttingDown) return;
    app.locals.shuttingDown = true;
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();
    server.close(async () => {
      try { await mongoose.disconnect(); clearTimeout(deadline); process.exit(0); }
      catch { process.exit(1); }
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  server.on('error', () => { console.error('HTTP server failed to start.'); shutdown(); });
};

startServer().catch(() => {
  console.error('Startup failed. Check database connectivity and required server environment variables.');
  process.exit(1);
});
