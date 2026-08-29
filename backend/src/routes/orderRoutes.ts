import { Router } from 'express';
import { createOrder, updateOrderStatus, getMyOrders, getOrderById, updateOrder, getAllOrders, updateOrderStages } from '../controllers/orderController';
import { addPayment, getOrderPayments } from '../controllers/paymentController';
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

// Payment routes
router.post('/:order_id/payments', addPayment);
router.get('/:order_id/payments', getOrderPayments);

export default router;
