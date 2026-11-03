import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import getRuntimeConfig from './config/runtime.js';
import { handleError, notFound } from './middleware/errorMiddleware.js';
import requireAuth from './middleware/requireAuth.js';
import { getUpload } from './controllers/uploadController.js';
import authRoutes from './routes/authRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import testRoutes from './routes/testRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const createApp = () => {
  const config = getRuntimeConfig();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet());
  app.use((request, response, next) => {
    const started = performance.now();
    response.set('X-Request-Id', randomUUID());
    response.on('finish', () => {
      if (config.production) console.log(JSON.stringify({ method: request.method, status: response.statusCode,
        durationMs: Math.round(performance.now() - started), requestId: response.get('X-Request-Id') }));
    });
    next();
  });
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.origins.includes(origin)) return callback(null, true);
      return callback(Object.assign(new Error('Origin is not allowed'), { status: 403 }));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], maxAge: 600,
  }));
  app.get('/api/health', (_request, response) => {
    const ready = mongoose.connection.readyState === 1 && !app.locals.shuttingDown;
    response.set('Cache-Control', 'no-store').status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
  });
  const limits = { standardHeaders: 'draft-8', legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test' };
  app.use('/api', rateLimit({ ...limits, windowMs: 15 * 60 * 1000, limit: 600,
    message: { error: 'Too many requests. Please try again later.' } }));
  app.use('/api/auth', rateLimit({ ...limits, windowMs: 15 * 60 * 1000, limit: 60,
    message: { error: 'Too many authentication attempts. Please try again later.' } }));
  app.use(express.json({ limit: '1mb' }));
  app.use((request, _response, next) => { request.body ??= {}; next(); });
  app.get('/uploads/:filename', requireAuth, getUpload);
  app.use('/api/auth', authRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/test', testRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/rfqs', rfqRoutes);
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use(notFound);
  app.use(handleError);
  return app;
};

export default createApp;
