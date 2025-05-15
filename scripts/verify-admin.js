const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'mail@quanthive.in';
    console.log(`Checking admin user: ${adminEmail}`);

    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      console.log('Admin user not found!');
      return;
    }

    console.log('Admin user details:');
    console.log(`- ID: ${admin.id}`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Status: ${admin.status}`);

    // Update the admin role if needed
    if (admin.role !== 'admin') {
      console.log('Updating user to admin role...');
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'admin', status: 'approved' },
      });
      console.log('Admin role updated successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 