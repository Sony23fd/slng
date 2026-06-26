const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  console.log('--- CONSTANTS ---');
  console.log(await prisma.constant.findMany({ where: { type: { in: ['INNER_COLOR', 'COVER_COLOR'] } } })); 
  console.log('--- MASTER PRICES ---');
  console.log(await prisma.masterprice.findMany({ where: { category: { in: ['Дотор өнгө', 'Хавтасны өнгө'] } } })); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
