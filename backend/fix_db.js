const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.coverrule.updateMany({
    where: { size: 'A5', binding: 'наалттай' },
    data: { divide_by: 5 }
  });
  console.log('Updated coverrule');
}
main().catch(console.error).finally(() => prisma.$disconnect());
