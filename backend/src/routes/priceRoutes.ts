import { Router } from 'express';
import { getPrices, updatePrice, createPrice } from '../controllers/priceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET prices is accessible to any logged-in user
router.get('/', authMiddleware(), getPrices);

// Only ADMIN and FINANCE can create or update prices
router.post('/', authMiddleware(['ADMIN', 'FINANCE']), createPrice);
router.put('/:id', authMiddleware(['ADMIN', 'FINANCE']), updatePrice);

export default router;
