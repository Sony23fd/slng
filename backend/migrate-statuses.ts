import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating existing order statuses...');
  
  // 1. Хүлээгдэж буй -> Санхүү хүлээгдэж буй
  const res1 = await prisma.order.updateMany({
    where: { current_status: 'Хүлээгдэж буй' },
    data: { current_status: 'Санхүү хүлээгдэж буй' }
  });
  console.log(`Updated ${res1.count} orders from 'Хүлээгдэж буй' to 'Санхүү хүлээгдэж буй'`);

  // 2. Шинэ захиалга -> Үйлдвэрлэлд
  const res2 = await prisma.order.updateMany({
    where: { current_status: 'Шинэ захиалга' },
    data: { current_status: 'Үйлдвэрлэлд' }
  });
  console.log(`Updated ${res2.count} orders from 'Шинэ захиалга' to 'Үйлдвэрлэлд'`);

  // 3. Бэлэн -> Бэлэн болсон
  const res3 = await prisma.order.updateMany({
    where: { current_status: 'Бэлэн' },
    data: { current_status: 'Бэлэн болсон' }
  });
  console.log(`Updated ${res3.count} orders from 'Бэлэн' to 'Бэлэн болсон'`);

  // 4. Олгосон -> Хүлээлгэн өгсөн
  const res4 = await prisma.order.updateMany({
    where: { current_status: 'Олгосон' },
    data: { current_status: 'Хүлээлгэн өгсөн' }
  });
  console.log(`Updated ${res4.count} orders from 'Олгосон' to 'Хүлээлгэн өгсөн'`);

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
