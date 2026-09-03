import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const standardTemplates = [
  {
    template_name: 'Ном А5 (Зөөлөн хавтас, 160 нүүр, Наалттай)',
    category: 'Ном',
    binding_type: 'Наалттай',
    size: 'A5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Стандарт А5 хэмжээтэй зөөлөн хавтастай ном',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 250гр A0 (889x1194)',
          size: 'A5',
          print_size: 'B3',
          press_sheet: '0.5',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 5,
          sheet_qty: 120,
          unit_cost: 1400,
          notes: 'Хавтас',
          is_cover: true
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A5',
          print_size: 'A2',
          press_sheet: '10',
          base_qty: 1000,
          extra_qty: 200,
          total_qty: 10200,
          divide_by: 4,
          sheet_qty: 2550,
          unit_cost: 510,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 10, notes: 'Дотор хуудас нугалах' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Термо цавуун наалт' },
        { operation_name: 'Бүрэлт (Матт)', qty: 1, unit_cost: 1500, notes: 'Хавтас матт бүрэлт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: '3 тал огтлох' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_bookmark: 'Үгүй'
      }
    }
  },
  {
    template_name: 'Сэтгүүл А4 (32 нүүр, Үдээстэй)',
    category: 'Сэтгүүл',
    binding_type: 'Үдээстэй',
    size: 'A4',
    cover_color: '4+4',
    inner_color: '4+4',
    total_pages: 32,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Өнгөт сэтгүүл А4 хэмжээтэй, төмөр үдээстэй',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 200гр A0 (889x1194)',
          size: 'A4',
          print_size: 'A2',
          press_sheet: '0.5',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 350,
          divide_by: 4,
          sheet_qty: 88,
          unit_cost: 1150,
          notes: 'Хавтас',
          is_cover: true
        },
        {
          material_name: 'Шохойтой цаас 128гр A0 (889x1194)',
          size: 'A4',
          print_size: 'A2',
          press_sheet: '3.5',
          base_qty: 500,
          extra_qty: 150,
          total_qty: 1900,
          divide_by: 4,
          sheet_qty: 475,
          unit_cost: 720,
          notes: 'Дотор хуудас (28 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Нугалаа', qty: 1750, unit_cost: 10, notes: 'Нугалаа' },
        { operation_name: 'Үдээ (Унаа үдээ)', qty: 500, unit_cost: 50, notes: 'Төмөр үдээс' },
        { operation_name: 'Бүрэлт (Гялгар)', qty: 1, unit_cost: 1500, notes: 'Хавтас гялгар бүрэлт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 1, unit_cost: 2500, notes: 'Огтлох' }
      ],
      specifications: {
        cover_color: '4+4',
        inner_color: '4+4',
        total_pages: 32
      }
    }
  },
  {
    template_name: 'Брошур А4 (1 нугалаа, 4 нүүр)',
    category: 'Брошур',
    binding_type: 'Үдээстэй',
    size: 'A4',
    cover_color: '4+4',
    inner_color: '4+4',
    total_pages: 4,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А4 дэлгээс, дундуураа 1 нугалсан танилцуулга брошур',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 200гр A0 (889x1194)',
          size: 'A4',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 4,
          sheet_qty: 275,
          unit_cost: 1150,
          notes: 'Үндсэн цаас',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Нугалаа', qty: 1000, unit_cost: 10, notes: '1 нугалаа' },
        { operation_name: 'Бүрэлт (Матт)', qty: 1, unit_cost: 1500, notes: '2 тал матт бүрэлт' },
        { operation_name: 'Огтлоо (Дунд)', qty: 2, unit_cost: 1500, notes: 'Зүсэлт' }
      ],
      specifications: {
        cover_color: '4+4',
        inner_color: '4+4',
        total_pages: 4
      }
    }
  },
  {
    template_name: 'Цаасан Тор (B2 дэлгээс, оосортой, 500ш)',
    category: 'Тор',
    binding_type: 'Бусад',
    size: 'Тор 24х32х8 (Дэлгээс: 64х44см)',
    cover_color: '4+0',
    inner_color: '',
    total_pages: 0,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Стандарт цаасан тор B2 дэлгээс, оосортой',
    order_data: {
      sub_size: '24x32x8cm',
      materials: [
        {
          material_name: 'Шохойтой цаас 250гр B1 (787x1092)',
          size: 'B2',
          print_size: 'B2',
          press_sheet: '1',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 2,
          sheet_qty: 300,
          unit_cost: 1150,
          notes: 'Торны үндсэн цаас',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B2',
          press_sheet: '1',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 1,
          sheet_qty: 4.2,
          unit_cost: 1500,
          notes: 'Хуулга бүрэлт (B2 0.007)',
          is_cover: false
        },
        {
          material_name: 'Оосор (Торны оосор)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 1,
          sheet_qty: 1000,
          unit_cost: 80,
          notes: 'Торны бариул оосор (хосоор)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Бөгж цоологч', qty: 500, unit_cost: 20, notes: 'Нүх цоолж бөгж шахах' },
        { operation_name: 'Гараар хийх ажил', qty: 500, unit_cost: 100, notes: 'Тор нугалж наах угсрах' },
        { operation_name: 'Хэв дарах (A3)', qty: 500, unit_cost: 350, notes: 'Торны хэлбэрт зүсэх хэв' }
      ],
      specifications: {
        cover_color: '4+0'
      }
    }
  },
  {
    template_name: 'Ширээний Календарь А5 (26 нүүр, Спираль, Картон суурьтай)',
    category: 'Календарь',
    binding_type: 'Спираль',
    size: 'A5',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 26,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Ширээний хуанли 13 хуудастай, хатуу картон хөл суурьтай',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр A0 (889x1194)',
          size: 'A5',
          print_size: 'A2',
          press_sheet: '1.625',
          base_qty: 300,
          extra_qty: 300,
          total_qty: 787.5,
          divide_by: 4,
          sheet_qty: 197,
          unit_cost: 1400,
          notes: 'Дотор 26 нүүр (13 хуудас)',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 300гр A0 (889x1194)',
          size: 'B3',
          print_size: 'B3',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 100,
          total_qty: 400,
          divide_by: 5,
          sheet_qty: 80,
          unit_cost: 1800,
          notes: 'Хавтас / Суурийн өнгөлгөө',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: 'A0',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 0,
          total_qty: 300,
          divide_by: 12,
          sheet_qty: 25,
          unit_cost: 6300,
          notes: 'Суурь картон (12ш багтана)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Бүрэлт', qty: 0.35, unit_cost: 1500, notes: 'Эхний 1 хуудсыг бүрнэ' },
        { operation_name: 'Нуруу (Спирал үдээс А5)', qty: 7200, unit_cost: 20, notes: 'А5 календарт 24ш (300 × 24 = 7200)' },
        { operation_name: 'Суурь хийх (А5)', qty: 300, unit_cost: 1500, notes: 'Хатуу картон суурь наах, угсрах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '4+4',
        total_pages: 26
      }
    }
  },
  {
    template_name: 'Ширээний Календарь B5 (26 нүүр, Спираль, Картон суурьтай)',
    category: 'Календарь',
    binding_type: 'Спираль',
    size: 'B5',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 26,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'B5 хэмжээтэй ширээний хуанли',
    order_data: {
      sub_size: '176x250mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр B1 (787x1092)',
          size: 'B5',
          print_size: 'B2',
          press_sheet: '1.625',
          base_qty: 300,
          extra_qty: 300,
          total_qty: 787.5,
          divide_by: 2,
          sheet_qty: 394,
          unit_cost: 1150,
          notes: 'Дотор 26 нүүр',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 300гр A0 (889x1194)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 100,
          total_qty: 400,
          divide_by: 4,
          sheet_qty: 100,
          unit_cost: 1800,
          notes: 'Хавтас / Суурь',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: 'A0',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 0,
          total_qty: 300,
          divide_by: 8,
          sheet_qty: 38,
          unit_cost: 6300,
          notes: 'Суурь картон (8ш багтана)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Бүрэлт', qty: 2.8, unit_cost: 1500, notes: 'Хавтас болон 1 хуудас бүрэх' },
        { operation_name: 'Нуруу (Спирал үдээс B5)', qty: 8400, unit_cost: 20, notes: 'B5 спираль 28ш (300 × 28 = 8400)' },
        { operation_name: 'Суурь хийх (B5)', qty: 300, unit_cost: 1800, notes: 'Суурь угсрах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '4+4',
        total_pages: 26
      }
    }
  },
  {
    template_name: 'Ханын Календарь А2 (7 хуудас / 14 нүүр, Спираль үдээстэй)',
    category: 'Календарь',
    binding_type: 'Спираль',
    size: 'A2',
    cover_color: '4+0',
    inner_color: '4+0',
    total_pages: 14,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Ханын А2 том хэмжээтэй 7 хуудас календарь',
    order_data: {
      sub_size: '420x594mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр A0 (889x1194)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '7',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 4200,
          divide_by: 4,
          sheet_qty: 1050,
          unit_cost: 1400,
          notes: '14 нүүр (7 хуудас)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Бүрэлт', qty: 3.12, unit_cost: 1500, notes: 'Эхний 1 хуудсыг бүрнэ' },
        { operation_name: 'Нуруу (Спирал үдээс Ханын А2)', qty: 28000, unit_cost: 5, notes: 'А2 ханын спираль 56ш (500 × 56 = 28000)' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '4+0',
        total_pages: 14
      }
    }
  },
  {
    template_name: 'Флаер А5 (Шохойтой 157гр, 2 тал 4+4)',
    category: 'Флаер',
    binding_type: 'Бусад',
    size: 'A5',
    cover_color: '4+4',
    inner_color: '',
    total_pages: 2,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А5 хэмжээтэй 2 тал бүрэн өнгөт тараах хуудас',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A5',
          print_size: 'A2',
          press_sheet: '0.25',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 350,
          divide_by: 4,
          sheet_qty: 88,
          unit_cost: 890,
          notes: 'Үндсэн цаас',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Огтлоо (Жижиг)', qty: 2, unit_cost: 1000, notes: 'А5 хэмжээгээр зүсэх' }
      ],
      specifications: {
        cover_color: '4+4',
        total_pages: 2
      }
    }
  },
  {
    template_name: 'Нэрийн хуудас (Шохойтой 300гр, 90х50мм, 100ш)',
    category: 'Нэрийн хуудас',
    binding_type: 'Бусад',
    size: 'Custom',
    cover_color: '4+4',
    inner_color: '',
    total_pages: 2,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Стандарт нэрийн хуудас 90х50мм, 2 тал өнгөт',
    order_data: {
      sub_size: '90x50mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 300гр A0 (889x1194)',
          size: 'Custom',
          print_size: 'A3',
          press_sheet: '1',
          base_qty: 100,
          extra_qty: 50,
          total_qty: 150,
          divide_by: 8,
          sheet_qty: 19,
          unit_cost: 1800,
          notes: 'Үндсэн хатуу цаас',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Бүрэлт (Матт)', qty: 1, unit_cost: 1500, notes: 'Матт бүрэлт' },
        { operation_name: 'Огтлоо (Жижиг)', qty: 1, unit_cost: 1000, notes: 'Нэрийн хуудас зүсэлт' }
      ],
      specifications: {
        cover_color: '4+4',
        total_pages: 2
      }
    }
  }
];

export async function seedTemplates() {
  console.log('Seeding standard product templates...');
  for (const t of standardTemplates) {
    await prisma.producttemplate.upsert({
      where: { template_name: t.template_name },
      create: t,
      update: t
    });
    console.log(`✓ Template seeded: ${t.template_name}`);
  }
  console.log('Templates seeding completed successfully!');
}

if (require.main === module) {
  seedTemplates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
