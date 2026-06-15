"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
    // 1. Админ хэрэглэгч
    const admin = await prisma.user.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'admin',
            role: 'ADMIN',
            password: passwordHash,
        },
    });
    // 2. Санхүү
    const finance = await prisma.user.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            name: 'finance',
            role: 'FINANCE',
            password: passwordHash,
        },
    });
    // 3. Борлуулагч
    const sales = await prisma.user.upsert({
        where: { id: 3 },
        update: {},
        create: {
            id: 3,
            name: 'sales',
            role: 'SALES',
            password: passwordHash,
        },
    });
    // 4. Үйлдвэр (Production)
    const production = await prisma.user.upsert({
        where: { id: 4 },
        update: {},
        create: {
            id: 4,
            name: 'production',
            role: 'PRODUCTION',
            password: passwordHash,
        },
    });
    console.log('Үндсэн хэрэглэгчдийг амжилттай үүсгэлээ!');
    console.log({ admin, finance, sales, production });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
