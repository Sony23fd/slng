const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const formulas = await prisma.calculation_formula.findMany();
  console.log(formulas);
}
main().finally(() => prisma.$disconnect());
