const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ops = await prisma.masterprice.findMany({ where: { category: 'Ажиллагаа' }, select: { item_name: true } });
  console.log(ops.map(o => o.item_name));
}
main().finally(() => prisma.$disconnect());
