import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); //key:value
export const IS_PUBLIC_PERMISSION = "isPublicPermission";
export const SkipCheckPermission = () => SetMetadata(IS_PUBLIC_PERMISSION, true);

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
