import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authenticate from '../middleware/auth.js';
import { getMe, login, register, updateMe } from '../controllers/authController.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many authentication attempts. Try again in a few minutes.' } });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

export default router;
