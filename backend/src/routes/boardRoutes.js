import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as BoardController from '../controllers/BoardController.js';

const router = Router();

router.post('/', authenticate, BoardController.create);
router.get('/project/:projectId', authenticate, BoardController.getByProject);
router.get('/:id', authenticate, BoardController.getById);
router.patch('/:id', authenticate, BoardController.update);
router.delete('/:id', authenticate, BoardController.remove);
router.post('/:id/columns', authenticate, BoardController.addColumn);
router.patch('/:id/columns/:columnId', authenticate, BoardController.updateColumn);
router.delete('/:id/columns/:columnId', authenticate, BoardController.deleteColumn);
router.patch('/:id/columns/reorder', authenticate, BoardController.reorderColumns);

export default router;
