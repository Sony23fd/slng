import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedConstants } from '../seed-constants';
import { seedPrices } from '../seed-prices';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  // 1. Админ хэрэглэгч
  const admin = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'admin',
      role: 'ADMIN',
      password: passwordHash,
    },
  });

  // 2. Санхүү
  const finance = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'finance',
      role: 'FINANCE',
      password: passwordHash,
    },
  });

  // 3. Борлуулагч
  const sales = await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'sales',
      role: 'SALES',
      password: passwordHash,
    },
  });

  // 4. Үйлдвэр (Production)
  const production = await prisma.user.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: 'production',
      role: 'PRODUCTION',
      password: passwordHash,
    },
  });

  console.log('Үндсэн хэрэглэгчдийг амжилттай үүсгэлээ!');
  await seedConstants(prisma);
  await seedPrices(prisma);
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
