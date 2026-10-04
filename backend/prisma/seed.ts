import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedConstants } from '../seed-constants';
import { seedPrices } from '../seed-prices';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

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
  await seedConstants(prisma);
  await seedPrices(prisma);

  // Cover Rules Seeding
  const coverRules = [
    { size: 'A4', binding: 'Наалттай', press_sheet: 1.0, divide_by: 6, print_size: 'A3' },
    { size: 'A4', binding: 'Үдээстэй', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'A5', binding: 'Наалттай', press_sheet: 0.5, divide_by: 5, print_size: 'B3' },
    { size: 'A5', binding: 'Үдээстэй', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'A6', binding: 'Наалттай', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'A6', binding: 'Үдээстэй', press_sheet: 0.125, divide_by: 4, print_size: 'A2' },
    { size: 'B4', binding: 'Наалттай', press_sheet: 1.0, divide_by: 4, print_size: 'A2' },
    { size: 'B4', binding: 'Үдээстэй', press_sheet: 0.5, divide_by: 2, print_size: 'B2' },
    { size: 'B5', binding: 'Наалттай', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'B5', binding: 'Үдээстэй', press_sheet: 0.5, divide_by: 5, print_size: 'B3' },
    { size: 'B6', binding: 'Наалттай', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'B6', binding: 'Үдээстэй', press_sheet: 0.25, divide_by: 5, print_size: 'B3' },
    // Хатуу хавтастай (xx1.jpg)
    { size: 'A4', binding: 'Хатуу хавтастай', press_sheet: 1.0, divide_by: 5, print_size: 'B3' },
    { size: 'A5', binding: 'Хатуу хавтастай', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'B4', binding: 'Хатуу хавтастай', press_sheet: 1.0, divide_by: 4, print_size: 'A2' },
    { size: 'B5', binding: 'Хатуу хавтастай', press_sheet: 1.0, divide_by: 5, print_size: 'B3' },
    // Хөндлөн хатуу хавтастай (xx2.jpg - Landscape Hardcover)
    { size: 'A4', binding: 'Хөндлөн хатуу хавтастай', press_sheet: 1.0, divide_by: 3, print_size: 'B2' },
    { size: 'A5', binding: 'Хөндлөн хатуу хавтастай', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'B5', binding: 'Хөндлөн хатуу хавтастай', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    // Супер хавтастай (sx.jpg)
    { size: 'A5', binding: 'Супер хавтастай', press_sheet: 1.0, divide_by: 6, print_size: 'B3' },
    { size: 'B5', binding: 'Супер хавтастай', press_sheet: 1.0, divide_by: 6, print_size: '594x280' },
    { size: 'A4', binding: 'Супер хавтастай', press_sheet: 1.0, divide_by: 3, print_size: '720x380' },
    { size: 'B4', binding: 'Супер хавтастай', press_sheet: 1.0, divide_by: 2, print_size: 'B2' },
    // Блокон оёо (Section sewing)
    { size: 'A4', binding: 'Блокон оёо', press_sheet: 1.0, divide_by: 6, print_size: 'A3' },
    { size: 'A5', binding: 'Блокон оёо', press_sheet: 0.5, divide_by: 5, print_size: 'B3' },
    { size: 'B5', binding: 'Блокон оёо', press_sheet: 0.5, divide_by: 4, print_size: 'A2' },
    { size: 'B4', binding: 'Блокон оёо', press_sheet: 1.0, divide_by: 4, print_size: 'A2' },
    { size: 'A6', binding: 'Блокон оёо', press_sheet: 0.25, divide_by: 4, print_size: 'A2' },
    { size: 'B6', binding: 'Блокон оёо', press_sheet: 0.25, divide_by: 4, print_size: 'A2' }
  ];

  for (const r of coverRules) {
    // @ts-ignore
    await prisma.coverrule.upsert({
      where: { size_binding: { size: r.size, binding: r.binding } },
      update: {},
      create: r,
    });
  }
  console.log('Cover rules seeded successfully!');

  // Product Categories Seeding (27 Standard Categories)
  const productCategories = [
    { 
      name: 'Танилцуулга', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: true, 
      has_pages: true, 
      has_bookmark: false, 
      waste_qty: 100,
      default_materials: ['Шохойтой цаас 250гр A0 (889x1194)', 'Шохойтой цаас 157гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Нугалаа', 'Цуглуулга', 'Үдээ (Унаа үдээ)', 'Огтлоо (Гурван талт)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Бланк', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Офсет цаас 80гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Даралт', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 20,
      default_materials: ['Мат цаас 300гр A0 (889x1194)'],
      default_operations: ['Клише (Алтлаг)', 'Эмбосс', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Зурагт хуудас', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Шохойтой цаас 157гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Огтлоо (Том)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Календар', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: false, 
      has_pages: true, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Мат цаас 250гр A0 (889x1194)', 'Картон 2 A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Цуглуулга', 'Спираль дарагч', 'Огтлоо (Дунд)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Ном хар', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: true, 
      has_pages: true, 
      has_bookmark: true, 
      waste_qty: 100,
      default_materials: ['Шохойтой цаас 250гр A0 (889x1194)', 'Офсет цаас 80гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Хэвлэх (1 өнгө)', 'Шалгах', 'Нугалаа', 'Цуглуулга', 'Наалт', 'Огтлоо (Гурван талт)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Ном өнгөт', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: true, 
      has_pages: true, 
      has_bookmark: true, 
      waste_qty: 100,
      default_materials: ['Шохойтой цаас 250гр A0 (889x1194)', 'Шохойтой цаас 128гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Нугалаа', 'Цуглуулга', 'Наалт', 'Огтлоо (Гурван талт)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Сонин', 
      calc_mode: 'BOOK_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: true, 
      has_bookmark: false, 
      waste_qty: 100,
      default_materials: ['Офсет цаас 70гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Нугалаа', 'Цуглуулга', 'Огтлоо (Том)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Сэтгүүл', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: true, 
      has_pages: true, 
      has_bookmark: false, 
      waste_qty: 100,
      default_materials: ['Шохойтой цаас 200гр A0 (889x1194)', 'Шохойтой цаас 105гр A0 (889x1194)', 'Бүрэлт (Гялгар)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Нугалаа', 'Цуглуулга', 'Үдээ (Унаа үдээ)', 'Огтлоо (Гурван талт)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Түргэн хэвлэл Konica', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Шохойтой цаас 250гр A0 (889x1194)'],
      default_operations: ['Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Тор', 
      calc_mode: 'PACKAGING_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Шохойтой цаас 250гр B1 (787x1092)', 'Бүрэлт (Матт)', 'Оосор (Торны оосор)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Хэв дарах (A2)', 'Бөгж цоологч', 'Гараар хийх ажил', 'Огтлоо (Том)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Хортой маягт', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 20,
      default_materials: ['Хортой цаас I өнгө 48гр Ao (889x1194)', 'Хортой цаас II өнгө/шар 50гр Ao (889x1194)'],
      default_operations: ['Хэвлэх (1 өнгө)', 'Шалгах', 'Цуглуулга', 'Нууцлал наах', 'Наалт', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Шошго', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 20,
      default_materials: ['Шохойтой цаас 300гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Хэв дарах (A3)', 'Бөгж цоологч', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Дэвтэр', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: true, 
      has_pages: true, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Шохойтой цаас 250гр A0 (889x1194)', 'Офсет цаас 80гр A0 (889x1194)', 'Бүрэлт (Гялгар)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Хэвлэх (1 өнгө)', 'Шалгах', 'Нугалаа', 'Цуглуулга', 'Үдээ (Унаа үдээ)', 'Огтлоо (Гурван талт)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'EPSON', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Шохойтой цаас 200гр A0 (889x1194)'],
      default_operations: ['Огтлоо (Том)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Маягт', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Офсет цаас 80гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (1 өнгө)', 'Шалгах', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Хавтас', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Шохойтой цаас 300гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Хэв дарах (A2)', 'Гараар хийх ажил', 'Наалт', 'Огтлоо (Том)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Дугтуй', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 20,
      default_materials: ['Офсет цаас 100гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Хэв дарах (A3)', 'Гараар хийх ажил', 'Наалт', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Урилга', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Мат цаас 250гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Нугалаа', 'Клише (Алтлаг)', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Меню', 
      calc_mode: 'BOOK_MODE', 
      has_cover: true, 
      has_inner: true, 
      has_binding: true, 
      has_pages: true, 
      has_bookmark: false, 
      waste_qty: 50,
      default_materials: ['Шохойтой цаас 300гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Цуглуулга', 'Спираль дарагч', 'Огтлоо (Дунд)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Нэрийн хуудас', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Шохойтой цаас 300гр A0 (889x1194)', 'Бүрэлт (Матт)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Дахин хэвлэлт', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Офсет цаас 80гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Промо', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: [],
      default_operations: ['Гараар хийх ажил', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Билет', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Офсет цаас 80гр A0 (889x1194)'],
      default_operations: ['Хэвлэх (4 өнгө)', 'Шалгах', 'Нууцлал наах', 'Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Бал', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: [],
      default_operations: ['Гараар хийх ажил', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Шуурхай принт', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: ['Офсет цаас 80гр A0 (889x1194)'],
      default_operations: ['Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    },
    { 
      name: 'Бусад', 
      calc_mode: 'STANDARD_MODE', 
      has_cover: false, 
      has_inner: true, 
      has_binding: false, 
      has_pages: false, 
      has_bookmark: false, 
      waste_qty: 0,
      default_materials: [],
      default_operations: ['Огтлоо (Жижиг)', 'Чанарын эцсийн хяналт']
    }
  ];

  for (const c of productCategories) {
    // @ts-ignore
    await prisma.product_category.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });

    await prisma.constant.upsert({
      where: { id: -1 }, // fallback dummy
      create: { type: 'CATEGORY', value: c.name },
      update: {}
    }).catch(async () => {
      const exists = await prisma.constant.findFirst({ where: { type: 'CATEGORY', value: c.name } });
      if (!exists) {
        await prisma.constant.create({ data: { type: 'CATEGORY', value: c.name } });
      }
    });
  }
  console.log('Product categories seeded successfully!');

}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
