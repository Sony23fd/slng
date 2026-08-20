import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.masterprice.findMany({ where: { category: 'Ажиллагаа' } }).then(res => console.log(JSON.stringify(res, null, 2))).finally(() => prisma.$disconnect());
