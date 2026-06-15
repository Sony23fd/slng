import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getCustomers);
router.post('/', authMiddleware(['ADMIN']), createCustomer);
router.put('/:id', authMiddleware(['ADMIN']), updateCustomer);
router.delete('/:id', authMiddleware(['ADMIN']), deleteCustomer);

export default router;
