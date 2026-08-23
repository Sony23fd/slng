import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getMyNotifications);
router.put('/read-all', authMiddleware(), markAllAsRead);
router.put('/:id/read', authMiddleware(), markAsRead);

export default router;
