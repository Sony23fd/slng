import { Router } from 'express';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templateController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getTemplates);
router.post('/', authMiddleware(['ADMIN']), createTemplate);
router.put('/:id', authMiddleware(['ADMIN']), updateTemplate);
router.delete('/:id', authMiddleware(['ADMIN']), deleteTemplate);

export default router;
