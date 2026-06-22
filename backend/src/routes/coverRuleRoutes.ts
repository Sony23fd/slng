import { Router } from 'express';
import { getAllRules, createRule, updateRule, deleteRule } from '../controllers/coverRuleController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getAllRules);
router.post('/', authMiddleware(['ADMIN']), createRule);
router.put('/:id', authMiddleware(['ADMIN']), updateRule);
router.delete('/:id', authMiddleware(['ADMIN']), deleteRule);

export default router;
