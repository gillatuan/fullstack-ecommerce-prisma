import { Prisma } from "generated/prisma/client";

export class RoleDto {
  id?: string
  name: string
  description?: string

  permissions?: string[]
}

export type RoleWithRelations =
  Prisma.RoleGetPayload<{
    include: {
      permissions: true;
      users: true;
    };
  }>;
