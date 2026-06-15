import { Router } from 'express';
import { getConstants, createConstant, deleteConstant, updateConstant } from '../controllers/constantController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Only ADMIN and FINANCE should manage settings, but GET can be public or allowed for all
router.get('/', getConstants);

// Protected routes
router.use(authMiddleware(['ADMIN', 'FINANCE']));
router.post('/', createConstant);
router.put('/:id', updateConstant);
router.delete('/:id', deleteConstant);

export default router;
