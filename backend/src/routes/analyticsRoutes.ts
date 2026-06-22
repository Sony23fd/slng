import { Router } from 'express';
import { getAdminAnalytics, getSalesAnalytics } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Only ADMIN and FINANCE can view global stats
router.get('/admin', authMiddleware(['ADMIN', 'FINANCE']), getAdminAnalytics);

// Any authenticated user can view their own sales stats
router.get('/sales', authMiddleware(), getSalesAnalytics);

export default router;
