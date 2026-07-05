import { Router } from 'express';
import { getAllRules, createRule, updateRule, deleteRule } from '../controllers/coverRuleController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getAllRules);
router.post('/', authMiddleware(['ADMIN', 'FINANCE']), createRule);
router.put('/:id', authMiddleware(['ADMIN', 'FINANCE']), updateRule);
router.delete('/:id', authMiddleware(['ADMIN', 'FINANCE']), deleteRule);

export default router;
