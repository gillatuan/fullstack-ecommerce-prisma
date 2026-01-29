import { Prisma } from 'generated/prisma/client';
import { UserRoleUncheckedCreateNestedManyWithoutUserInput } from 'generated/prisma/models';

export type UserResponseType = {
  id: number;
  name: string;
  email: string;
  role?: UserRoleUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRoleUncheckedCreateNestedManyWithoutUserInput;
};

export type UserGetPayload = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: { include: { permissions: { include: { permission: true } } } };
      };
    };
  };
}>;
