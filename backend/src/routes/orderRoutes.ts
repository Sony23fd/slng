import { Router } from 'express';
import { createOrder, updateOrderStatus, getMyOrders, getOrderById, updateOrder } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protect all order routes
router.use(authMiddleware());

router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
