const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function main() {
  try {
    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@quanthive.in';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      // Generate a secure admin password if not provided
      const adminPassword = 'QuanthiveAdmin123!'; // For initial setup
      const hashedPassword = await hashPassword(adminPassword);

      // Create the admin user
      const admin = await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          status: 'approved', // Automatically approved
        },
      });

      console.log(`Admin user created with email: ${adminEmail}`);
      console.log(`Initial password: ${adminPassword}`);
      console.log('Please change this password after first login');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 