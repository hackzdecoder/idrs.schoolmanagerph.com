export const ROLES = ['Super Admin', 'Admin', 'Faculty', 'Accounting', 'Student'] as const;

export type UserRole = (typeof ROLES)[number];

export const CURRENT_USER_ROLE: UserRole = 'Student';
