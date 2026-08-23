import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialStatuses = [
  { name: 'Үнийн санал', color: '#94a3b8', sequence: 10, type: 'QUOTE', is_system: true },
  { name: 'Санхүү хүлээгдэж буй', color: '#f59e0b', sequence: 20, type: 'PENDING', is_system: true },
  { name: 'Үйлдвэрлэлд', color: '#3b82f6', sequence: 30, type: 'ACTIVE', is_system: true },
  { name: 'Бэлэн болсон', color: '#10b981', sequence: 60, type: 'READY', is_system: true },
  { name: 'Хүлээлгэн өгсөн', color: '#64748b', sequence: 70, type: 'DELIVERED', is_system: true },
  { name: 'Цуцлагдсан', color: '#ef4444', sequence: 80, type: 'CANCELLED', is_system: true },
];

async function main() {
  console.log('Seeding order statuses...');
  
  for (const status of initialStatuses) {
    await prisma.order_status.upsert({
      where: { name: status.name },
      update: {
        color: status.color,
        sequence: status.sequence,
        type: status.type,
        is_system: status.is_system
      },
      create: status
    });
  }
  
  // Update any existing edge cases
  await prisma.order_status.upsert({
    where: { name: 'Бэлэн болсон' },
    update: {},
    create: { name: 'Бэлэн болсон', color: '#10b981', sequence: 65, type: 'READY', is_system: false }
  });
  
  await prisma.order_status.upsert({
    where: { name: 'Хүлээлгэж өгсөн' },
    update: {},
    create: { name: 'Хүлээлгэж өгсөн', color: '#64748b', sequence: 75, type: 'DELIVERED', is_system: false }
  });

  console.log('Finished seeding order statuses.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
