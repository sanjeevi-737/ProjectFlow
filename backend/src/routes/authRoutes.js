import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/authValidator.js';
import * as AuthController from '../controllers/AuthController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, AuthController.register);
router.post('/login', authLimiter, loginValidator, validate, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.get('/me', authenticate, AuthController.getMe);

export default router;
