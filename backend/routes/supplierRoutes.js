import express from 'express';
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSuppliers,
  updateSupplier,
} from '../controllers/supplierController.js';
import requireAuth from '../middleware/requireAuth.js';
import upload from '../middleware/upload.js';
import { rateSupplier } from '../controllers/decisionController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getSuppliers);
router.get('/:id', getSupplier);
router.post('/', upload.single('image'), createSupplier);
router.post('/:id/ratings', rateSupplier);
router.put('/:id', upload.single('image'), updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
