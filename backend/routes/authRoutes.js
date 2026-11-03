import express from 'express';
import { getCurrentUser, loginUser, registerUser } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', requireAuth, getCurrentUser);

export default router;
