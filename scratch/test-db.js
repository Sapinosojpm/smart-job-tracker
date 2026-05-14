const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const jobCount = await prisma.job.count();
    const settingsCount = await prisma.settings.count();
    console.log('Success!');
    console.log('Job count:', jobCount);
    console.log('Settings count:', settingsCount);
  } catch (err) {
    console.error('Error connecting to Prisma:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
