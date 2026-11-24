import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Only ADMIN can manage users
router.use(authMiddleware(['ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
