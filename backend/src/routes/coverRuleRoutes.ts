import { Router } from 'express';
import { getAllRules, createRule, updateRule, deleteRule } from '../controllers/coverRuleController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getAllRules);
router.post('/', authenticate, authorize(['ADMIN']), createRule);
router.put('/:id', authenticate, authorize(['ADMIN']), updateRule);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteRule);

export default router;
