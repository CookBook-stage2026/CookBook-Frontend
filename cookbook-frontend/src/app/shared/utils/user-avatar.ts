import { User } from '@shared/domain/user';

const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#10b981', '#06b6d4', '#f59e0b', '#6366f1',
];

export function getUserInitials(user: User): string {
  return user.displayName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getUserAvatarColor(user: User): string {
  const index = (user.userId.codePointAt(user.userId.length - 1) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

