import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as DashboardController from '../controllers/DashboardController.js';

const router = Router();

router.get('/', authenticate, DashboardController.getDashboard);

export default router;
