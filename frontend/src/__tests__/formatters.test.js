import { describe, it, expect } from 'vitest';
import { formatDate, formatFileSize, getInitials, truncate, timeAgo, formatDueDate } from '../utils/formatters';

describe('formatters', () => {
  describe('getInitials', () => {
    it('returns initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns single initial', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('returns ? for empty input', () => {
      expect(getInitials()).toBe('?');
      expect(getInitials('')).toBe('?');
    });

    it('handles multiple spaces', () => {
      expect(getInitials('John  Michael  Doe')).toBe('JM');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('formats MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('truncate', () => {
    it('returns string if within limit', () => {
      expect(truncate('Hello')).toBe('Hello');
    });

    it('truncates long strings', () => {
      const result = truncate('Hello World', 5);
      expect(result).toBe('Hello...');
    });
  });

  describe('formatDate', () => {
    it('returns empty for null date', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatDueDate', () => {
    it('returns null for no date', () => {
      expect(formatDueDate(null)).toBeNull();
    });
  });

  describe('timeAgo', () => {
    it('returns empty for no date', () => {
      expect(timeAgo()).toBe('');
    });
  });
});
