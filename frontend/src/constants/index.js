export const ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_MEMBER: 'team_member',
  GUEST: 'guest',
};

export const ROLE_LABELS = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  team_member: 'Team Member',
  guest: 'Guest',
};

export const PRIORITIES = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_COLORS = {
  none: { bg: 'bg-dark-100 dark:bg-dark-700', text: 'text-dark-500' },
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  COMMENT_ADDED: 'comment_added',
  MENTION: 'mention',
  DUE_DATE_REMINDER: 'due_date_reminder',
  WORKSPACE_INVITATION: 'workspace_invitation',
  PROJECT_UPDATE: 'project_update',
  MEMBER_JOINED: 'member_joined',
  STATUS_CHANGE: 'status_change',
};

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
};

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-updatedAt', label: 'Recently Updated' },
  { value: 'title', label: 'Title A-Z' },
  { value: '-title', label: 'Title Z-A' },
  { value: '-priority', label: 'Priority (High to Low)' },
  { value: 'priority', label: 'Priority (Low to High)' },
  { value: 'dueDate', label: 'Due Date (Earliest)' },
  { value: '-dueDate', label: 'Due Date (Latest)' },
];

export const DEFAULT_COLUMNS = [
  { name: 'To Do', color: '#6b7280', order: 0 },
  { name: 'In Progress', color: '#3b82f6', order: 1 },
  { name: 'Review', color: '#f59e0b', order: 2 },
  { name: 'Completed', color: '#10b981', order: 3 },
];
