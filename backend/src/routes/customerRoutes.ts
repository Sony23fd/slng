import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getCustomers);
router.post('/', authMiddleware(['ADMIN', 'FINANCE']), createCustomer);
router.put('/:id', authMiddleware(['ADMIN', 'FINANCE']), updateCustomer);
router.delete('/:id', authMiddleware(['ADMIN', 'FINANCE']), deleteCustomer);

export default router;
