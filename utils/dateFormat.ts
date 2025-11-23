import { format } from 'date-fns';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}