import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate, formatDateTime, formatFileSize, getInitials, truncate, timeAgo, formatDueDate } from '../utils/formatters';

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

    it('handles three word name', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('truncates to 2 characters max', () => {
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
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

    it('formats GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('formats fractional values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
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

    it('returns empty for falsy input', () => {
      expect(truncate(null)).toBe('');
      expect(truncate(undefined)).toBe('');
      expect(truncate('')).toBe('');
    });

    it('returns exact string at boundary', () => {
      expect(truncate('12345', 5)).toBe('12345');
    });
  });

  describe('formatDate', () => {
    it('returns empty for null date', () => {
      expect(formatDate(null)).toBe('');
    });

    it('returns empty for undefined date', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('formats a valid date', () => {
      const result = formatDate('2025-06-15T00:00:00.000Z');
      expect(result).toBe('Jun 15, 2025');
    });

    it('formats with custom format', () => {
      const result = formatDate('2025-01-01T00:00:00.000Z', 'yyyy-MM-dd');
      expect(result).toBe('2025-01-01');
    });
  });

  describe('formatDateTime', () => {
    it('returns empty for null date', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('formats a valid date with time', () => {
      const result = formatDateTime('2025-06-15T14:30:00.000Z');
      expect(result).toMatch(/Jun 15, 2025/);
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });
  });

  describe('timeAgo', () => {
    it('returns empty for no date', () => {
      expect(timeAgo()).toBe('');
    });

    it('returns empty for null', () => {
      expect(timeAgo(null)).toBe('');
    });

    it('returns a string for a past date', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      const result = timeAgo(pastDate);
      expect(result).toContain('ago');
    });
  });

  describe('formatDueDate', () => {
    it('returns null for no date', () => {
      expect(formatDueDate(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(formatDueDate(undefined)).toBeNull();
    });

    it('returns object with label for valid date', () => {
      const result = formatDueDate('2025-06-15T00:00:00.000Z');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('isOverdue');
    });

    it('marks today as not overdue', () => {
      const today = new Date().toISOString();
      const result = formatDueDate(today);
      expect(result.isOverdue).toBe(false);
    });

    it('marks past dates as overdue', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const result = formatDueDate(pastDate);
      expect(result.isOverdue).toBe(true);
    });
  });
});
