import { PERMISSIONS } from './rbac.constants';

export const ROLE_PERMISSION_MAP = {
  SUPER_ADMIN: [
    ...Object.values(PERMISSIONS.USER),
    ...Object.values(PERMISSIONS.POST),
  ],
  ADMIN: [
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.UPDATE,
    ...Object.values(PERMISSIONS.POST),
  ],
  MEMBER: [PERMISSIONS.USER.READ, PERMISSIONS.POST.READ],
};
