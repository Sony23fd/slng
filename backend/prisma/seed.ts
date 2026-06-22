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

  // Cover Rules Seeding
  const coverRules = [
    { size: 'A4', binding: 'Наалттай', press_sheet: 1.0, divide_by: 6, print_size: 'A3' },
    { size: 'A4', binding: 'Үдээстэй', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'A5', binding: 'Наалттай', press_sheet: 0.5, divide_by: 5, print_size: 'B3' },
    { size: 'A5', binding: 'Үдээстэй', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'A6', binding: 'Наалттай', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'A6', binding: 'Үдээстэй', press_sheet: 0.125, divide_by: 4, print_size: 'A2' },
    { size: 'B4', binding: 'Наалттай', press_sheet: 1.0, divide_by: 4, print_size: 'A2' },
    { size: 'B4', binding: 'Үдээстэй', press_sheet: 0.5, divide_by: 2, print_size: 'B2' },
    { size: 'B5', binding: 'Наалттай', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'B5', binding: 'Үдээстэй', press_sheet: 0.5, divide_by: 5, print_size: 'B3' },
    { size: 'B6', binding: 'Наалттай', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'B6', binding: 'Үдээстэй', press_sheet: 0.25, divide_by: 5, print_size: 'B3' }
  ];

  for (const r of coverRules) {
    // @ts-ignore
    await prisma.coverrule.upsert({
      where: { size_binding: { size: r.size, binding: r.binding } },
      update: {},
      create: r,
    });
  }
  console.log('Cover rules seeded successfully!');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
