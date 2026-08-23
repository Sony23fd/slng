import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.order.count();
  console.log("Order count:", result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
