import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTaskValidator, updateTaskValidator, taskIdValidator, moveTaskValidator } from '../validators/taskValidator.js';
import * as TaskController from '../controllers/TaskController.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.post('/', authenticate, createTaskValidator, validate, TaskController.create);
router.get('/board/:boardId', authenticate, TaskController.getByBoard);
router.get('/project/:projectId', authenticate, TaskController.getByProject);
router.get('/:id', authenticate, taskIdValidator, validate, TaskController.getById);
router.patch('/:id', authenticate, taskIdValidator, updateTaskValidator, validate, TaskController.update);
router.delete('/:id', authenticate, taskIdValidator, validate, TaskController.remove);
router.patch('/:id/move', authenticate, taskIdValidator, moveTaskValidator, validate, TaskController.moveTask);
router.post('/:id/comments', authenticate, taskIdValidator, validate, TaskController.addComment);
router.get('/:id/comments', authenticate, taskIdValidator, validate, TaskController.getComments);
router.patch('/:id/checklist', authenticate, taskIdValidator, validate, TaskController.updateChecklist);
router.patch('/:id/subtasks', authenticate, taskIdValidator, validate, TaskController.updateSubtasks);
router.post('/:id/attachments', authenticate, taskIdValidator, validate, upload.single('file'), TaskController.addAttachment);
router.delete('/:id/attachments/:attachmentId', authenticate, taskIdValidator, validate, TaskController.removeAttachment);
router.get('/:id/activity', authenticate, taskIdValidator, validate, TaskController.getActivityLog);

export default router;
