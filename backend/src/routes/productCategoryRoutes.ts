import { Router } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/productCategoryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(), getAllCategories);
router.post('/', authMiddleware(['ADMIN']), createCategory);
router.put('/:id', authMiddleware(['ADMIN']), updateCategory);
router.delete('/:id', authMiddleware(['ADMIN']), deleteCategory);

export default router;
