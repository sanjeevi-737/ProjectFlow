import { body, param } from 'express-validator';

export const createTaskValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('board')
    .isMongoId()
    .withMessage('Valid board ID is required'),
  body('column')
    .trim()
    .notEmpty()
    .withMessage('Column is required'),
  body('priority')
    .optional()
    .isIn(['none', 'low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('priority')
    .optional()
    .isIn(['none', 'low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
];

export const taskIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
];

export const moveTaskValidator = [
  body('column')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Column is required'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
];
