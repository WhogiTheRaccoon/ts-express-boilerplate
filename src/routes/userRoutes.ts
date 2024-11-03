import express from 'express';
import  * as userController  from '@/controllers/userController';
import { requireRole } from '@/middlewares/requireRole';

const router = express.Router();
router.use(requireRole('admin')); // require admin role for all routes

router.get('/', userController.get); // get all users
router.get('/:id', userController.getOne); // get one user
router.post('/', userController.createUser); // create user
router.put('/:id', userController.updateUser); // update user
router.delete('/:id', userController.deleteUser); // delete user

export default router;