import { Router } from 'express';
import { createOrder, updateOrderStatus, getMyOrders, getOrderById, updateOrder, getAllOrders, updateOrderStages } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protect all order routes
router.use(authMiddleware());

router.get('/my', getMyOrders);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.put('/:id/status', updateOrderStatus);
router.patch('/:id/stage', updateOrderStages);

export default router;
