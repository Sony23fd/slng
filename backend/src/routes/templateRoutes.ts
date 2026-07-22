import { Router } from 'express';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, createTemplateFromOrder } from '../controllers/templateController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getTemplates);
router.post('/from-order/:orderId', authMiddleware(), createTemplateFromOrder);
router.post('/', authMiddleware(['ADMIN', 'FINANCE']), createTemplate);
router.put('/:id', authMiddleware(['ADMIN', 'FINANCE']), updateTemplate);
router.delete('/:id', authMiddleware(['ADMIN', 'FINANCE']), deleteTemplate);

export default router;
