import { Router } from 'express';
import { 
  getPrices, 
  updatePrice, 
  createPrice, 
  bulkUpdatePrices, 
  importPrices, 
  getPriceLogs, 
  deletePrice 
} from '../controllers/priceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET prices is accessible to any logged-in user
router.get('/', authMiddleware(), getPrices);

// Logs
router.get('/logs', authMiddleware(['ADMIN', 'FINANCE']), getPriceLogs);

// Bulk and import (must be defined before /:id)
router.put('/bulk', authMiddleware(['ADMIN', 'FINANCE']), bulkUpdatePrices);
router.post('/import', authMiddleware(['ADMIN', 'FINANCE']), importPrices);

// Only ADMIN and FINANCE can create, update, or delete prices
router.post('/', authMiddleware(['ADMIN', 'FINANCE']), createPrice);
router.put('/:id', authMiddleware(['ADMIN', 'FINANCE']), updatePrice);
router.delete('/:id', authMiddleware(['ADMIN', 'FINANCE']), deletePrice);

export default router;
