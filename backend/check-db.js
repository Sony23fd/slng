const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prices = await prisma.masterPrice.findMany({
    where: { item_name: { contains: 'Дабль' } }
  });
  console.log(prices);
}

main().finally(() => prisma.$disconnect());
