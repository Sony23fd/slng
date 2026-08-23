import express from 'express';
import { getOrderStatuses, createOrderStatus, updateOrderStatus, deleteOrderStatus } from '../controllers/orderStatusController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All order status routes require authentication
router.use(authMiddleware());

router.get('/', getOrderStatuses);
router.post('/', createOrderStatus);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrderStatus);

export default router;
