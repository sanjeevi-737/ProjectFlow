import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(parseISO(date), fmt);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(parseISO(date), 'MMM d, yyyy h:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
};

export const formatDueDate = (date) => {
  if (!date) return null;
  const d = parseISO(date);
  if (isPast(d)) return { label: formatDate(date), isOverdue: true };
  if (isToday(d)) return { label: 'Today', isOverdue: false };
  if (isTomorrow(d)) return { label: 'Tomorrow', isOverdue: false };
  return { label: formatDate(date), isOverdue: false };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
