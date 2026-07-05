import { Router } from 'express';
import { getAllFormulas, createFormula, updateFormula, deleteFormula } from '../controllers/formulaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getAllFormulas);
router.post('/', authMiddleware(['ADMIN', 'FINANCE']), createFormula);
router.put('/:id', authMiddleware(['ADMIN', 'FINANCE']), updateFormula);
router.delete('/:id', authMiddleware(['ADMIN', 'FINANCE']), deleteFormula);

export default router;
