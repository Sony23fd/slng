const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('password', 10);
  await prisma.user.updateMany({ data: { password: hash } });
  console.log("Passwords reset to 'password'");
}
main().finally(() => prisma.$disconnect());
