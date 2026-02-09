import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient } from 'generated/prisma/client';
import { ROLES, ROLE_PERMISSIONS_MAP } from './rbac.constants';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString }); // Instantiate the adapter

const prisma = new PrismaClient({ adapter }); // Pass the adapter instance to PrismaClient

async function seedRoles() {
  for (const roleName of Object.values(ROLES)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
      },
    });
  }
}

async function seedPermissions() {
  const permissionSet = new Set<string>();

  Object.values(ROLE_PERMISSIONS_MAP).forEach((permissions) => {
    permissions.forEach((p) => permissionSet.add(p));
  });

  for (const permission of permissionSet) {
    const [resource, action] = permission.split(':');

    await prisma.permission.upsert({
      where: {
        action_resource: {
          action,
          resource,
        },
      },
      update: {},
      create: {
        action,
        resource,
      },
    });
  }
}

async function seedRolePermissions() {
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) continue;

    for (const permission of permissions) {
      const [resource, action] = permission.split(':');

      const permissionRecord = await prisma.permission.findUnique({
        where: {
          action_resource: {
            action,
            resource,
          },
        },
      });

      if (!permissionRecord) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissionRecord.id,
        },
      });
    }
  }
}

async function seedSuperAdmin() {
  const superAdminRole = await prisma.role.findUnique({
    where: { name: ROLES.SUPER_ADMIN },
  });

  if (!superAdminRole) {
    console.error('Super Admin role not found');
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: process.env.SUPER_ADMIN_EMAIL },
  });

  if (existingUser) {
    console.log('Super Admin user already exists');
    return;
  }

  const email = process.env.SUPER_ADMIN_EMAIL || 'super_admin@gmail.com';
  const hashedPassword = await argon2.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'Admin@3010',
  );

  await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email,
      password: hashedPassword,
      roles: {
        create: {
          roleId: superAdminRole.id,
        },
      },
    },
  });
}

async function seedAdmin() {
  const email = 'admin_for_test@gmail.com';
  const adminRole = await prisma.role.findUnique({
    where: { name: ROLES.ADMIN },
  });

  if (!adminRole) {
    console.error('Super Admin role not found');
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }, // for test
  });

  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await argon2.hash('hashedpassword');

  await prisma.user.create({
    data: {
      fullName: 'Admin',
      email,
      password: hashedPassword,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });
}

async function seedMember() {
  const email = 'member_for_test@gmail.com'
  const memberRole = await prisma.role.findUnique({
    where: { name: ROLES.MEMBER },
  });

  if (!memberRole) {
    console.error('Member role not found');
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }, // for test
  });

  if (existingUser) {
    console.log('Member user already exists');
    return;
  }

  const hashedPassword = await argon2.hash('hashedpassword');

  await prisma.user.create({
    data: {
      fullName: 'Member',
      email,
      password: hashedPassword,
      roles: {
        create: {
          roleId: memberRole.id,
        },
      },
    },
  });
}

async function main() {
  console.log('🌱 Seeding RBAC...');
  /* await seedRoles();
  await seedPermissions();
  await seedRolePermissions();
  await seedSuperAdmin();
  await seedAdmin();
  await seedMember(); */

  console.log('✅ RBAC seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
