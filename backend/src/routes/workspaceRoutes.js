import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createWorkspaceValidator, updateWorkspaceValidator, inviteMemberValidator, workspaceIdValidator } from '../validators/workspaceValidator.js';
import * as WorkspaceController from '../controllers/WorkspaceController.js';

const router = Router();

router.post('/', authenticate, createWorkspaceValidator, validate, WorkspaceController.create);
router.get('/', authenticate, WorkspaceController.getUserWorkspaces);
router.get('/:id', authenticate, workspaceIdValidator, validate, WorkspaceController.getById);
router.patch('/:id', authenticate, workspaceIdValidator, updateWorkspaceValidator, validate, WorkspaceController.update);
router.delete('/:id', authenticate, workspaceIdValidator, validate, WorkspaceController.remove);
router.post('/:id/invite', authenticate, workspaceIdValidator, inviteMemberValidator, validate, WorkspaceController.inviteMember);
router.post('/accept-invitation', authenticate, WorkspaceController.acceptInvitation);
router.get('/:id/invitations', authenticate, workspaceIdValidator, validate, WorkspaceController.getInvitations);
router.delete('/:id/members/:memberId', authenticate, workspaceIdValidator, validate, WorkspaceController.removeMember);
router.patch('/:id/members/:memberId/role', authenticate, workspaceIdValidator, validate, WorkspaceController.updateMemberRole);

export default router;
