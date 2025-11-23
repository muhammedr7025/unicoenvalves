import { User } from '@/types';

export function requireAdmin(user: User | null): void {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  if (!user.isActive) {
    throw new Error('Account is inactive');
  }
}

export function requireActiveUser(user: User | null): void {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (!user.isActive) {
    throw new Error('Account is inactive');
  }
}

export function canEditQuote(user: User | null, quoteCreatorId: string): boolean {
  if (!user || !user.isActive) return false;
  if (user.role === 'admin') return true;
  return user.id === quoteCreatorId;
}