import { Router } from 'express';
import { login, getProfile, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/profile', authMiddleware(), getProfile);
router.put('/profile', authMiddleware(), updateProfile);

export default router;
