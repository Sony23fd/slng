import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALL_PRODUCT_CATEGORIES = [
  {
    name: 'Ном',
    calc_mode: 'BOOK_MODE',
    has_cover: true,
    has_inner: true,
    has_binding: true,
    has_pages: true,
    has_bookmark: true,
    waste_qty: 100,
    default_operations: ['Нугалаа', 'Цуглуулга', 'Наалт', 'Огтлоо (Гурван талт)'],
    default_materials: ['Шохойтой цаас 250гр A0 (889x1194)', 'Офсет цаас 80гр A0 (889x1194)']
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
    default_operations: ['Нугалаа', 'Үдээ (Унаа үдээ)', 'Огтлоо (Гурван талт)'],
    default_materials: ['Шохойтой цаас 200гр A0 (889x1194)', 'Шохойтой цаас 128гр A0 (889x1194)']
  },
  {
    name: 'Брошур',
    calc_mode: 'BOOK_MODE',
    has_cover: true,
    has_inner: true,
    has_binding: true,
    has_pages: true,
    has_bookmark: false,
    waste_qty: 100,
    default_operations: ['Нугалаа', 'Огтлоо (Дунд)'],
    default_materials: ['Шохойтой цаас 200гр A0 (889x1194)']
  },
  {
    name: 'Календарь',
    calc_mode: 'BOOK_MODE',
    has_cover: true,
    has_inner: true,
    has_binding: false,
    has_pages: true,
    has_bookmark: false,
    waste_qty: 50,
    default_operations: ['Нуруу (Спирал үдээс А5)', 'Суурь хийх (А5)'],
    default_materials: ['Мат цаас 250гр A0 (889x1194)', 'Картон 2 A0 (889x1194)']
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
    default_operations: ['Бөгж цоологч', 'Гараар хийх ажил', 'Хэв дарах (A3)'],
    default_materials: ['Шохойтой цаас 250гр B1 (787x1092)', 'Оосор (Торны оосор)']
  },
  {
    name: 'Хайрцаг',
    calc_mode: 'PACKAGING_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 50,
    default_operations: ['Хэв дарах (A2)', 'Бүрэлт (Мат)', 'Гараар хийх ажил'],
    default_materials: ['Хайрцагны картон 350гр B1 (787x1092)']
  },
  {
    name: 'Түргэн хэвлэл',
    calc_mode: 'STANDARD_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 0,
    default_operations: ['Огтлоо (Жижиг)'],
    default_materials: ['Шохойтой цаас 250гр A3 (297x420)']
  },
  {
    name: 'Флаер',
    calc_mode: 'STANDARD_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 0,
    default_operations: ['Огтлоо (Жижиг)'],
    default_materials: ['Шохойтой цаас 157гр A0 (889x1194)']
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
    default_operations: ['Огтлоо (Жижиг)'],
    default_materials: ['Шохойтой цаас 300гр A0 (889x1194)']
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
    default_operations: ['Нугалаа', 'Огтлоо (Жижиг)'],
    default_materials: ['Мат цаас 250гр A0 (889x1194)']
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
    default_operations: ['Бүрэлт (Мат)', 'Нуруу (Спирал үдээс А5)', 'Нугалаа'],
    default_materials: ['Шохойтой цаас 300гр A0 (889x1194)']
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
    default_operations: ['Огтлоо (Жижиг)', 'Нууцлал / Дугаарлалт'],
    default_materials: ['Офсет цаас 80гр A0 (889x1194)']
  },
  {
    name: 'Албан бланк',
    calc_mode: 'STANDARD_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 0,
    default_operations: ['Огтлоо (Жижиг)'],
    default_materials: ['Офсет цаас 80гр A0 (889x1194)']
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
    default_operations: ['Хэв дарах (A3)', 'Гараар хийх ажил', 'Наалт'],
    default_materials: ['Офсет цаас 100гр A0 (889x1194)']
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
    default_operations: ['Хэв дарах (A2)', 'Бүрэлт (Мат)', 'Гараар хийх ажил'],
    default_materials: ['Шохойтой цаас 350гр B1 (787x1092)']
  },
  {
    name: 'Стикер',
    calc_mode: 'STANDARD_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 20,
    default_operations: ['Зүсэлт (Хэлбэрт зүсэх)', 'Огтлоо (Жижиг)'],
    default_materials: ['Өөрөө наалддаг цаас A0 (889x1194)']
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
    default_operations: ['Нуруу (Спирал үдээс А5)', 'Нугалаа', 'Огтлоо (Гурван талт)'],
    default_materials: ['Шохойтой цаас 250гр A0 (889x1194)', 'Офсет цаас 80гр A0 (889x1194)']
  },
  {
    name: 'Сертификат',
    calc_mode: 'STANDARD_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 10,
    default_operations: ['Огтлоо (Жижиг)', 'Клише дарах (Алтлаг даралт)'],
    default_materials: ['Мат цаас 300гр A0 (889x1194)']
  },
  {
    name: 'Постер',
    calc_mode: 'STANDARD_MODE',
    has_cover: false,
    has_inner: true,
    has_binding: false,
    has_pages: false,
    has_bookmark: false,
    waste_qty: 10,
    default_operations: ['Огтлоо (Том)', 'Бүрэлт (Гялгар)'],
    default_materials: ['Шохойтой цаас 200гр A0 (889x1194)']
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
    default_operations: ['Огтлоо (Жижиг)', 'Бөгж цоологч'],
    default_materials: ['Шохойтой цаас 350гр A0 (889x1194)']
  }
];

async function seedAll() {
  console.log('--- Seeding All Product Categories ---');
  for (const cat of ALL_PRODUCT_CATEGORIES) {
    // 1. Upsert into product_category
    await (prisma as any).product_category.upsert({
      where: { name: cat.name },
      update: {
        calc_mode: cat.calc_mode,
        has_cover: cat.has_cover,
        has_inner: cat.has_inner,
        has_binding: cat.has_binding,
        has_pages: cat.has_pages,
        has_bookmark: cat.has_bookmark,
        waste_qty: cat.waste_qty,
        default_operations: cat.default_operations,
        default_materials: cat.default_materials
      },
      create: {
        name: cat.name,
        calc_mode: cat.calc_mode,
        has_cover: cat.has_cover,
        has_inner: cat.has_inner,
        has_binding: cat.has_binding,
        has_pages: cat.has_pages,
        has_bookmark: cat.has_bookmark,
        waste_qty: cat.waste_qty,
        default_operations: cat.default_operations,
        default_materials: cat.default_materials
      }
    });

    // 2. Also ensure it exists in constant table (type: 'CATEGORY')
    const existingConstant = await prisma.constant.findFirst({
      where: { type: 'CATEGORY', value: cat.name }
    });
    if (!existingConstant) {
      await prisma.constant.create({
        data: {
          type: 'CATEGORY',
          value: cat.name,
          description: `${cat.name} бүтээгдэхүүний ангилал`
        }
      });
    }
  }

  console.log(`Successfully seeded ${ALL_PRODUCT_CATEGORIES.length} product categories!`);
  await prisma.$disconnect();
}

seedAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
