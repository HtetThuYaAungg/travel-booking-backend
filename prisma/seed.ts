import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SYSTEM user with unlimited permissions...\n');

  try {
    // 1. Create a department first (required for user)
    let department = await prisma.department.findFirst({
      where: {
        department_code: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    if (!department) {
      department = await prisma.department.create({
        data: {
          department_code: 'ADMIN',
          department_name: 'Administration',
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ Department created:', department.department_name);

    //2. Create master permission data
    console.log('🔗 Seeding master permissions...');

    const permissions = [
      // User permissions
      {
        name: 'users:create',
        description: 'Create users',
        module: 'users',
        action: 'create',
      },
      {
        name: 'users:read',
        description: 'View users',
        module: 'users',
        action: 'read',
      },
      {
        name: 'users:edit',
        description: 'Update users',
        module: 'users',
        action: 'edit',
      },
      {
        name: 'users:delete',
        description: 'Delete users',
        module: 'users',
        action: 'delete',
      },
      {
        name: 'users:list',
        description: 'List users',
        module: 'users',
        action: 'list',
      },

      // Role permissions
      {
        name: 'roles:create',
        description: 'Create roles',
        module: 'roles',
        action: 'create',
      },
      {
        name: 'roles:read',
        description: 'View roles',
        module: 'roles',
        action: 'read',
      },
      {
        name: 'roles:edit',
        description: 'Update roles',
        module: 'roles',
        action: 'edit',
      },
      {
        name: 'roles:delete',
        description: 'Delete roles',
        module: 'roles',
        action: 'delete',
      },
      {
        name: 'roles:list',
        description: 'List roles',
        module: 'roles',
        action: 'list',
      },

      // Department permissions
      {
        name: 'departments:create',
        description: 'Create departments',
        module: 'departments',
        action: 'create',
      },
      {
        name: 'departments:read',
        description: 'View departments',
        module: 'departments',
        action: 'read',
      },
      {
        name: 'departments:edit',
        description: 'Update departments',
        module: 'departments',
        action: 'edit',
      },
      {
        name: 'departments:delete',
        description: 'Delete departments',
        module: 'departments',
        action: 'delete',
      },
      {
        name: 'departments:list',
        description: 'List departments',
        module: 'departments',
        action: 'list',
      },

      // Permission permissions
      {
        name: 'permissions:create',
        description: 'Create permissions',
        module: 'permissions',
        action: 'create',
      },
      {
        name: 'permissions:read',
        description: 'View permissions',
        module: 'permissions',
        action: 'read',
      },
      {
        name: 'permissions:edit',
        description: 'Update permissions',
        module: 'permissions',
        action: 'edit',
      },
      {
        name: 'permissions:delete',
        description: 'Delete permissions',
        module: 'permissions',
        action: 'delete',
      },
      {
        name: 'permissions:list',
        description: 'List permissions',
        module: 'permissions',
        action: 'list',
      },
    ];

    for (const permission of permissions) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          module: permission.module,
          action: permission.action,
          deleted_at: null,
        },
      });
      if (!existingPermission) {
        await prisma.permission.create({
          data: permission,
        });
      }
    }

    console.log('✅ Master permissions seeded successfully!');

    // 3. Create the role
    let role = await prisma.role.findFirst({
      where: {
        role_code: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    if (!role) {
      // If no active role exists, create a new one
      role = await prisma.role.create({
        data: {
          role_code: 'ADMIN',
          role_name: 'Admin',
          status: 'ACTIVE',
          permissions: [
            {
              menuName: 'Setting',
              subMenus: [
                {
                  menuName: 'Users',
                  actions: {
                    create: true,
                    delete: true,
                    edit: true,
                    list: true,
                    read: true,
                  },
                },
                {
                  menuName: 'Roles',
                  actions: {
                    create: true,
                    delete: true,
                    edit: true,
                    list: true,
                    read: true,
                  },
                },
                {
                  menuName: 'Departments',
                  actions: {
                    create: true,
                    delete: true,
                    edit: true,
                    list: true,
                    read: true,
                  },
                },
                {
                  menuName: 'Permissions',
                  actions: {
                    create: true,
                    delete: true,
                    edit: true,
                    list: true,
                    read: true,
                  },
                },
              ],
            },
          ],
        },
      });
    }
    console.log('✅ Role created:', role.role_name);

    // 4. Assign permissions to the role
    const existingPermissions = await prisma.permission.findMany({
      where: { name: { in: permissions.map((p) => p.name) } },
    });

    console.log('🔗 Assigning permissions to role...');
    for (const permission of existingPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: role.id,
            permission_id: permission.id,
          },
        },
        update: {},
        create: {
          role_id: role.id,
          permission_id: permission.id,
        },
      });
    }
    console.log('✅ Permissions assigned to role');

    // 5. Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // 6. Create the user
    let user = await prisma.user.findFirst({
      where: {
        email: 'admin@gmail.com',
        staff_id: '00001',
        status: 'ACTIVE',
      },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          staff_id: '00001',
          full_name: 'System User',
          password: hashedPassword,
          role_id: role.id,
          department_id: department.id,
          user_type: 'CHECKER',
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ System User created Successfully:');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
