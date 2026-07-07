import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createProjectValidator, updateProjectValidator, projectIdValidator } from '../validators/projectValidator.js';
import * as ProjectController from '../controllers/ProjectController.js';

const router = Router();

router.post('/', authenticate, createProjectValidator, validate, ProjectController.create);
router.get('/workspace/:workspaceId', authenticate, ProjectController.getByWorkspace);
router.get('/:id', authenticate, projectIdValidator, validate, ProjectController.getById);
router.patch('/:id', authenticate, projectIdValidator, updateProjectValidator, validate, ProjectController.update);
router.delete('/:id', authenticate, projectIdValidator, validate, ProjectController.remove);
router.patch('/:id/archive', authenticate, projectIdValidator, validate, ProjectController.archive);
router.post('/:id/members', authenticate, projectIdValidator, validate, ProjectController.addMember);
router.delete('/:id/members/:memberId', authenticate, projectIdValidator, validate, ProjectController.removeMember);
router.get('/:id/boards', authenticate, projectIdValidator, validate, ProjectController.getBoards);

export default router;
