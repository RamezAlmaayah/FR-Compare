import express from 'express';
import { createRFQ, deleteRFQ, getRFQ, getRFQs, updateRFQ } from '../controllers/rfqController.js';
import requireAuth from '../middleware/requireAuth.js';
import { getComparison } from '../controllers/comparisonController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', getRFQs);
router.get('/:id/comparison', getComparison);
router.get('/:id', getRFQ);
router.post('/', createRFQ);
router.put('/:id', updateRFQ);
router.delete('/:id', deleteRFQ);

export default router;
