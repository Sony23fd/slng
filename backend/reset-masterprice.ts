import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { seedPrices } from './seed-prices';

const prisma = new PrismaClient();

async function main() {
  console.log('Wiping masterprice...');
  await prisma.masterprice.deleteMany({});
  
  console.log('Running seedPrices...');
  await seedPrices(prisma);
  
  console.log('Reset complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
