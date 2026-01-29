export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
  },
  POST: {
    CREATE: 'post:create',
    READ: 'post:read',
    UPDATE: 'post:update',
    DELETE: 'post:delete',
  },
};

export const ROLE_PERMISSIONS_MAP = {
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS.USER),
    ...Object.values(PERMISSIONS.POST),
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.POST.CREATE,
    PERMISSIONS.POST.READ,
    PERMISSIONS.POST.UPDATE,
  ],

  [ROLES.MEMBER]: [PERMISSIONS.POST.READ],
};
