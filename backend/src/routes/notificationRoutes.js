import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as NotificationController from '../controllers/NotificationController.js';

const router = Router();

router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.patch('/read-all', authenticate, NotificationController.markAllAsRead);
router.delete('/:id', authenticate, NotificationController.remove);

export default router;
