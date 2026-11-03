import express from 'express';
import { getApiStatus } from '../controllers/testController.js';

const router = express.Router();

router.get('/', getApiStatus);

export default router;
