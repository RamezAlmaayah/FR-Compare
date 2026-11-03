import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDatabase from './config/db.js';
import { handleError, notFound } from './middleware/errorMiddleware.js';
import { uploadsDirectory } from './middleware/upload.js';
import authRoutes from './routes/authRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import testRoutes from './routes/testRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));

app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/test', testRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(handleError);

const startServer = async () => {
  try {
    await connectDatabase();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`FR Compare API listening on port ${port}.`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
