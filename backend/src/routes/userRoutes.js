import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import * as UserController from '../controllers/UserController.js';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.patch('/profile', authenticate, UserController.updateProfile);
router.patch('/avatar', authenticate, upload.single('avatar'), UserController.uploadAvatar);
router.patch('/change-password', authenticate, UserController.changePassword);
router.patch('/notification-preferences', authenticate, UserController.updateNotificationPreferences);
router.get('/search', authenticate, UserController.searchUsers);
router.get('/', authenticate, authorize('admin'), UserController.getAllUsers);

export default router;
