import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SYSTEM user with unlimited permissions...\n');

  try {
    // 1. Create departments first (required for user)
    let adminDepartment = await prisma.department.findFirst({
      where: {
        department_code: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    if (!adminDepartment) {
      adminDepartment = await prisma.department.create({
        data: {
          department_code: 'ADMIN',
          department_name: 'Administration',
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ Admin Department created:', adminDepartment.department_name);

    // Create DEFAULT department for Google OAuth users
    let defaultDepartment = await prisma.department.findFirst({
      where: {
        department_code: 'DEFAULT',
        status: 'ACTIVE',
      },
    });
    if (!defaultDepartment) {
      defaultDepartment = await prisma.department.create({
        data: {
          department_code: 'DEFAULT',
          department_name: 'Default Department',
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ Default Department created:', defaultDepartment.department_name);

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

      // Hotel permissions
      {
        name: 'hotels:create',
        description: 'Create hotels',
        module: 'hotels',
        action: 'create',
      },
      {
        name: 'hotels:read',
        description: 'View hotels',
        module: 'hotels',
        action: 'read',
      },
      {
        name: 'hotels:update',
        description: 'Update hotels',
        module: 'hotels',
        action: 'update',
      },
      {
        name: 'hotels:delete',
        description: 'Delete hotels',
        module: 'hotels',
        action: 'delete',
      },
      {
        name: 'hotels:list',
        description: 'List hotels',
        module: 'hotels',
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

    // 3. Create the roles
    let adminRole = await prisma.role.findFirst({
      where: {
        role_code: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    if (!adminRole) {
      // If no active admin role exists, create a new one
      adminRole = await prisma.role.create({
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
                {
                  menuName: 'Hotels',
                  actions: {
                    create: true,
                    delete: true,
                    update: true,
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
    console.log('✅ Admin Role created:', adminRole.role_name);

    // Create USER role for Google OAuth users
    let userRole = await prisma.role.findFirst({
      where: {
        role_code: 'USER',
        status: 'ACTIVE',
      },
    });

    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          role_code: 'USER',
          role_name: 'User',
          status: 'ACTIVE',
          permissions: [
            {
              menuName: 'Dashboard',
              subMenus: [
                {
                  menuName: 'Profile',
                  actions: {
                    read: true,
                    edit: true,
                  },
                },
                {
                  menuName: 'Hotels',
                  actions: {
                    read: true,
                    list: true,
                  },
                },
              ],
            },
          ],
        },
      });
    }
    console.log('✅ User Role created:', userRole.role_name);

    // 4. Assign permissions to the admin role
    const existingPermissions = await prisma.permission.findMany({
      where: { name: { in: permissions.map((p) => p.name) } },
    });

    console.log('🔗 Assigning permissions to admin role...');
    for (const permission of existingPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.id,
            permission_id: permission.id,
          },
        },
        update: {},
        create: {
          role_id: adminRole.id,
          permission_id: permission.id,
        },
      });
    }
    console.log('✅ Permissions assigned to admin role');

    // 5. Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // 6. Create the admin user
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
          role_id: adminRole.id,
          department_id: adminDepartment.id,
          user_type: 'CHECKER',
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ System User created Successfully:');

    // 7. Seed hotel data
    console.log('🏨 Seeding hotel data...');
    
    const hotels = [
      {
        name: 'Grand Palace Hotel',
        description: 'Luxurious 5-star hotel in the heart of the city with stunning views and world-class amenities. Experience unparalleled comfort and service.',
        location: 'Downtown',
        city: 'Yangon',
        country: 'Myanmar',
        price: 250.00,
        currency: 'USD',
        rating: 4.8,
        star_rating: 5,
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        has_wifi: true,
        has_pool: true,
        has_spa: true,
        has_gym: true,
        has_restaurant: true,
        has_parking: true,
        has_pet_friendly: false,
        phone: '+95-1-234-5678',
        email: 'info@grandpalace.com',
        website: 'https://grandpalace.com',
        address: '123 Downtown Street, Yangon, Myanmar',
        latitude: 16.8661,
        longitude: 96.1951,
      },
      {
        name: 'Riverside Resort',
        description: 'Peaceful riverside retreat with beautiful gardens and spa facilities. Perfect for relaxation and rejuvenation.',
        location: 'Riverside',
        city: 'Mandalay',
        country: 'Myanmar',
        price: 180.00,
        currency: 'USD',
        rating: 4.5,
        star_rating: 4,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        has_wifi: true,
        has_pool: true,
        has_spa: true,
        has_gym: false,
        has_restaurant: true,
        has_parking: true,
        has_pet_friendly: true,
        phone: '+95-2-345-6789',
        email: 'info@riverside.com',
        website: 'https://riverside.com',
        address: '456 Riverside Road, Mandalay, Myanmar',
        latitude: 21.9588,
        longitude: 96.0891,
      },
      {
        name: 'City Center Inn',
        description: 'Modern boutique hotel with contemporary design and excellent location. Walking distance to major attractions.',
        location: 'City Center',
        city: 'Yangon',
        country: 'Myanmar',
        price: 120.00,
        currency: 'USD',
        rating: 4.2,
        star_rating: 3,
        amenities: ['WiFi', 'Restaurant', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        has_wifi: true,
        has_pool: false,
        has_spa: false,
        has_gym: false,
        has_restaurant: true,
        has_parking: true,
        has_pet_friendly: false,
        phone: '+95-1-456-7890',
        email: 'info@citycenter.com',
        website: 'https://citycenter.com',
        address: '789 City Center, Yangon, Myanmar',
        latitude: 16.8661,
        longitude: 96.1951,
      },
      {
        name: 'Mountain View Lodge',
        description: 'Scenic mountain lodge offering breathtaking views and outdoor activities. Perfect for nature lovers and adventure seekers.',
        location: 'Shan Hills',
        city: 'Kalaw',
        country: 'Myanmar',
        price: 95.00,
        currency: 'USD',
        rating: 4.6,
        star_rating: 4,
        amenities: ['WiFi', 'Restaurant', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        has_wifi: true,
        has_pool: false,
        has_spa: false,
        has_gym: false,
        has_restaurant: true,
        has_parking: true,
        has_pet_friendly: true,
        phone: '+95-81-234-5678',
        email: 'info@mountainview.com',
        website: 'https://mountainview.com',
        address: '321 Mountain Road, Kalaw, Myanmar',
        latitude: 20.6221,
        longitude: 96.5689,
      },
      {
        name: 'Beach Paradise Resort',
        description: 'Tropical beachfront resort with pristine white sand beaches and crystal clear waters. Ultimate beach vacation destination.',
        location: 'Ngapali Beach',
        city: 'Ngapali',
        country: 'Myanmar',
        price: 320.00,
        currency: 'USD',
        rating: 4.9,
        star_rating: 5,
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        has_wifi: true,
        has_pool: true,
        has_spa: true,
        has_gym: true,
        has_restaurant: true,
        has_parking: true,
        has_pet_friendly: false,
        phone: '+95-43-234-5678',
        email: 'info@beachparadise.com',
        website: 'https://beachparadise.com',
        address: '654 Beach Road, Ngapali, Myanmar',
        latitude: 18.4500,
        longitude: 94.3000,
      },
      {
        name: 'Heritage Boutique Hotel',
        description: 'Charming heritage hotel with traditional architecture and modern comforts. Rich cultural experience in historic setting.',
        location: 'Old Bagan',
        city: 'Bagan',
        country: 'Myanmar',
        price: 160.00,
        currency: 'USD',
        rating: 4.7,
        star_rating: 4,
        amenities: ['WiFi', 'Restaurant', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        has_wifi: true,
        has_pool: false,
        has_spa: false,
        has_gym: false,
        has_restaurant: true,
        has_parking: true,
        has_pet_friendly: false,
        phone: '+95-61-234-5678',
        email: 'info@heritage.com',
        website: 'https://heritage.com',
        address: '987 Heritage Street, Bagan, Myanmar',
        latitude: 21.1722,
        longitude: 94.8602,
      },
    ];

    for (const hotelData of hotels) {
      const existingHotel = await prisma.hotel.findFirst({
        where: {
          name: hotelData.name,
          location: hotelData.location,
          deleted_at: null,
        },
      });

      if (!existingHotel) {
        await prisma.hotel.create({
          data: {
            ...hotelData,
            created_by_id: user.id,
          },
        });
        console.log(`✅ Hotel created: ${hotelData.name}`);
      }
    }

    console.log('✅ Hotel data seeded successfully!');
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
