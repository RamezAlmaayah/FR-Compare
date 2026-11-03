import express from 'express';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../controllers/itemController.js';
import requireAuth from '../middleware/requireAuth.js';
import { getPriceHistory } from '../controllers/priceHistoryController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', getItems);
router.get('/:id/price-history', getPriceHistory);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
