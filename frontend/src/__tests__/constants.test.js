import { describe, it, expect } from 'vitest';
import { ROLES, ROLE_LABELS, PRIORITIES, PRIORITY_COLORS, PROJECT_STATUS, DEFAULT_COLUMNS } from '../constants';

describe('constants', () => {
  it('defines all roles', () => {
    expect(ROLES).toEqual({
      ADMIN: 'admin',
      PROJECT_MANAGER: 'project_manager',
      TEAM_MEMBER: 'team_member',
      GUEST: 'guest',
    });
  });

  it('has labels for all roles', () => {
    expect(Object.keys(ROLE_LABELS)).toEqual(Object.values(ROLES));
  });

  it('defines priorities', () => {
    expect(PRIORITIES).toHaveProperty('NONE', 'none');
    expect(PRIORITIES).toHaveProperty('URGENT', 'urgent');
  });

  it('has colors for all priorities', () => {
    Object.values(PRIORITIES).forEach((p) => {
      expect(PRIORITY_COLORS[p]).toBeDefined();
      expect(PRIORITY_COLORS[p]).toHaveProperty('bg');
      expect(PRIORITY_COLORS[p]).toHaveProperty('text');
    });
  });

  it('defines project statuses', () => {
    expect(PROJECT_STATUS).toHaveProperty('ACTIVE', 'active');
    expect(PROJECT_STATUS).toHaveProperty('ARCHIVED', 'archived');
    expect(PROJECT_STATUS).toHaveProperty('COMPLETED', 'completed');
  });

  it('has default kanban columns', () => {
    expect(DEFAULT_COLUMNS).toHaveLength(4);
    expect(DEFAULT_COLUMNS[0].name).toBe('To Do');
    expect(DEFAULT_COLUMNS[3].name).toBe('Completed');
  });
});
