import express from 'express';
import authController from '@/controllers/authController';
import { isAuthenticated } from '@/middlewares/auth';

const router = express.Router();

router.get('/me', isAuthenticated, authController.me);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/verify-email', isAuthenticated, authController.verifyEmail);
router.post('/forgot-password', isAuthenticated, authController.forgotPassword);
router.post('/reset-password', isAuthenticated, authController.resetPassword);

export default router;