import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Only ADMIN and FINANCE can view stats maybe? Let's allow any authenticated for now since it's dashboard
router.use(authMiddleware(['ADMIN', 'FINANCE', 'SALES']));

router.get('/stats', getDashboardStats);

export default router;
