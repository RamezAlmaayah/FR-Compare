import express from 'express';
import { createQuotation, deleteQuotation, getQuotation, getQuotations, updateQuotation } from '../controllers/quotationController.js';
import requireAuth from '../middleware/requireAuth.js';
import upload from '../middleware/upload.js';
import { selectQuotation } from '../controllers/decisionController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', getQuotations);
router.get('/:id', getQuotation);
router.post('/', upload.single('image'), createQuotation);
router.put('/:id', upload.single('image'), updateQuotation);
router.put('/:id/select', selectQuotation);
router.delete('/:id', deleteQuotation);

export default router;
