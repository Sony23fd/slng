const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const papers = await prisma.masterprice.count({ where: { category: 'Цаас' } });
  const materials = await prisma.masterprice.count({ where: { category: 'Материал' } });
  const ops = await prisma.masterprice.count({ where: { category: 'Ажиллагаа' } });
  console.log({ papers, materials, ops });
}
main().finally(() => prisma.$disconnect());
