export const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: [
    '*', // wildcard: full access
  ],
  ADMIN: [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'role:create',
    'role:read',
    'role:update',
    'role:delete',
  ],
  MEMBER: [
    'post:create',
    'post:read',
    'post:update',
  ],
  USER: [
    'post:read',
  ],
};
