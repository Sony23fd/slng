import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

export const verifiedWorkshopTemplates = [
  {
    template_name: "Ном өнгөт B5 (Зөөлөн хавтас, 160 нүүр, 4+4 өнгөт)",
    category: "Ном өнгөт",
    binding_type: "Наалттай",
    size: "B5",
    cover_color: "4+0",
    inner_color: "4+4",
    total_pages: 160,
    needs_design: false,
    design_status: "Эх бэлэн",
    design_cost: 0,
    notes: "Стандарт B5 өнгөт зөөлөн хавтастай ном (Komori B2 машин, 10 х.х)",
    order_data: {
      sub_size: "176x250mm",
      total_qty: 1000,
      materials: [
        {
          material_name: "Шохойтой цаас 250гр A0 (889x1194)",
          size: "A0",
          print_size: "A2",
          press_sheet: "0.5",
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 4,
          sheet_qty: 150,
          unit_cost: 1400,
          notes: "Хавтас",
          is_cover: true
        },
        {
          material_name: "Шохойтой цаас 128гр A0 (889x1194)",
          size: "B1",
          print_size: "B2",
          press_sheet: "10",
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 11000,
          divide_by: 2,
          sheet_qty: 5500,
          unit_cost: 720,
          notes: "Дотор хуудас (160 нүүр, 10 х.х)",
          is_cover: false
        },
        {
          material_name: "Бүрэлт матт Хятад 44 см",
          size: "44 см",
          print_size: "A2",
          press_sheet: "0.5",
          base_qty: 1000,
          extra_qty: 20,
          total_qty: 1020,
          divide_by: 1,
          sheet_qty: 6.12,
          unit_cost: 1500,
          notes: "Хавтасны матт бүрэлт (44 см хуулга, коэф: 0.006)",
          is_cover: false
        },
        {
          material_name: "CTP хавтан (74.5x60.5)",
          size: "74.5x60.5",
          print_size: "B2",
          press_sheet: "10",
          base_qty: 84,
          extra_qty: 0,
          total_qty: 84,
          divide_by: 1,
          sheet_qty: 84,
          unit_cost: 8800,
          notes: "CTP хэвлэлийн хавтан (Дотор 80ш + Хавтас 4ш = 84ш)",
          is_cover: false
        }
      ],
      operations: [
        {
          operation_name: "Хэвлэх (4 өнгө)",
          qty: 500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "Хавтас хэвлэх (A2)"
        },
        {
          operation_name: "Хэвлэх (4 өнгө)",
          qty: 10000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "Дотор хэвлэх (Komori B2)"
        },
        {
          operation_name: "Шалгах",
          qty: 10500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "Хэвлэл шалгах"
        },
        {
          operation_name: "Нугалаа",
          qty: 10000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false,
          notes: "Дотор хуудас нугалах"
        },
        {
          operation_name: "Цуглуулга",
          qty: 10000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false,
          notes: "Тетрад цуглуулах"
        },
        {
          operation_name: "Халуун цавуут наалт",
          qty: 1000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false,
          notes: "Блок хавтастай наах"
        },
        {
          operation_name: "Огтлоо",
          qty: 1000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false,
          notes: "3 тал огтлох"
        },
        {
          operation_name: "Чанарын эцсийн хяналт",
          qty: 1000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PACKAGING",
          is_manual: false,
          notes: "Эцсийн согог шалгалт"
        }
      ],
      specifications: {
        cover_color: "4+0",
        inner_color: "4+4",
        total_pages: 160
      }
    }
  },
  {
    template_name: "Ном хар B5 (Зөөлөн хавтас, 160 нүүр, 1+1, B3)",
    category: "Ном хар",
    binding_type: "Наалттай",
    size: "B5",
    cover_color: "4+0",
    inner_color: "1+1",
    total_pages: 160,
    needs_design: false,
    design_status: "Эх бэлэн",
    design_cost: 0,
    notes: "Стандарт B5 хар ном (Ryobi 680 B3 машин, 20 х.х, хуваалт 5)",
    order_data: {
      sub_size: "176x250mm",
      total_qty: 1000,
      materials: [
        {
          material_name: "Шохойтой цаас 250гр A0 (889x1194)",
          size: "A0",
          print_size: "A2",
          press_sheet: "0.5",
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 4,
          sheet_qty: 150,
          unit_cost: 1400,
          notes: "Хавтас",
          is_cover: true
        },
        {
          material_name: "Офсет цаас 80гр A0 (889x1194)",
          size: "A0",
          print_size: "B3",
          press_sheet: "20",
          base_qty: 1000,
          extra_qty: 80,
          total_qty: 21600,
          divide_by: 5,
          sheet_qty: 4320,
          unit_cost: 460,
          notes: "Дотор хуудас (160 нүүр, 20 х.х, Ryobi)",
          is_cover: false
        },
        {
          material_name: "Бүрэлт матт Хятад 44 см",
          size: "44 см",
          print_size: "A2",
          press_sheet: "0.5",
          base_qty: 1000,
          extra_qty: 20,
          total_qty: 1020,
          divide_by: 1,
          sheet_qty: 6.12,
          unit_cost: 1500,
          notes: "Хавтасны матт бүрэлт",
          is_cover: false
        },
        {
          material_name: "CTP хавтан (65x55)",
          size: "65x55",
          print_size: "B3",
          press_sheet: "20",
          base_qty: 40,
          extra_qty: 0,
          total_qty: 40,
          divide_by: 1,
          sheet_qty: 40,
          unit_cost: 6800,
          notes: "Дотор CTP хэвлэлийн хавтан (1+1, 20 х.х x 2 = 40ш)",
          is_cover: false
        },
        {
          material_name: "CTP хавтан (74.5x60.5)",
          size: "74.5x60.5",
          print_size: "A2",
          press_sheet: "0.5",
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: "Хавтасны CTP хэвлэлийн хавтан (4+0, 4ш)",
          is_cover: false
        }
      ],
      operations: [
        {
          operation_name: "Хэвлэх (4 өнгө)",
          qty: 500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "Хавтас хэвлэх"
        },
        {
          operation_name: "Хэвлэх (1 өнгө)",
          qty: 20000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "Дотор хэвлэх (Ryobi)"
        },
        {
          operation_name: "Шалгах",
          qty: 20500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false
        },
        {
          operation_name: "Нугалаа",
          qty: 20000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Цуглуулга",
          qty: 20000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Халуун цавуут наалт",
          qty: 1000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Огтлоо",
          qty: 1000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Чанарын эцсийн хяналт",
          qty: 1000,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PACKAGING",
          is_manual: false
        }
      ],
      specifications: {
        cover_color: "4+0",
        inner_color: "1+1",
        total_pages: 160
      }
    }
  },
  {
    template_name: "Ширээний Календар 240х160 (100ш, 26 нүүр, Картон суурьтай)",
    category: "Календар",
    binding_type: "Спираль",
    size: "240x160",
    cover_color: "4+4",
    inner_color: "4+4",
    total_pages: 26,
    needs_design: false,
    design_status: "Эх бэлэн",
    design_cost: 0,
    notes: "Ширээний стандарт календарь 240х160 (SP2601421, 2.5мм картон суурь, спираль)",
    order_data: {
      sub_size: "240x160mm",
      total_qty: 100,
      materials: [
        {
          material_name: "Шохойтой цаас 250гр B1 (900x1200)",
          size: "B1",
          print_size: "B2",
          press_sheet: "1.0",
          base_qty: 100,
          extra_qty: 100,
          total_qty: 200,
          divide_by: 2,
          sheet_qty: 100,
          unit_cost: 1400,
          notes: "Календарийн хуудас (26 нүүр, B2)",
          is_cover: true
        },
        {
          material_name: "Шохойтой цаас 157гр B1 (900x1200)",
          size: "B1",
          print_size: "A2",
          press_sheet: "1.0",
          base_qty: 200,
          extra_qty: 100,
          total_qty: 300,
          divide_by: 6,
          sheet_qty: 50,
          unit_cost: 940,
          notes: "Суурь наах цаас",
          is_cover: false
        },
        {
          material_name: "Шохойтой цаас 250гр B1 (900x1200)",
          size: "B1",
          print_size: "B2",
          press_sheet: "1.0",
          base_qty: 50,
          extra_qty: 100,
          total_qty: 150,
          divide_by: 2,
          sheet_qty: 75,
          unit_cost: 1400,
          notes: "Суурийн дотор под",
          is_cover: false
        },
        {
          material_name: "Хатуу картон 2.5мм (900x1194)",
          size: "900x1194",
          print_size: "",
          press_sheet: "—",
          base_qty: 100,
          extra_qty: 0,
          total_qty: 100,
          divide_by: 7,
          sheet_qty: 15,
          unit_cost: 3700,
          notes: "Суурийн картон 2.5мм (7 гарна, 15 том хуудас)",
          is_cover: false
        },
        {
          material_name: "Бүрэлт матт Хятад 44 см",
          size: "44 см",
          print_size: "A2",
          press_sheet: "—",
          base_qty: 100,
          extra_qty: 20,
          total_qty: 120,
          divide_by: 1,
          sheet_qty: 2.6,
          unit_cost: 12150,
          notes: "Суурийн матт бүрэлт (44см)",
          is_cover: false
        },
        {
          material_name: "Спираль нуруу (төмөр)",
          size: "5/16",
          print_size: "",
          press_sheet: "—",
          base_qty: 100,
          extra_qty: 0,
          total_qty: 100,
          divide_by: 1,
          sheet_qty: 100,
          unit_cost: 125,
          notes: "Спираль пүрш 5/16 (100ш)",
          is_cover: false
        },
        {
          material_name: "CTP хавтан (74.5x60.5)",
          size: "74.5x60.5",
          print_size: "B2",
          press_sheet: "1.0",
          base_qty: 8,
          extra_qty: 0,
          total_qty: 8,
          divide_by: 1,
          sheet_qty: 8,
          unit_cost: 8800,
          notes: "CTP хавтан (B2, 4+4)",
          is_cover: false
        }
      ],
      operations: [
        {
          operation_name: "Хэвлэх (4 өнгө)",
          qty: 250,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "Календарийн хуудас хэвлэх"
        },
        {
          operation_name: "Шалгах",
          qty: 250,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false
        },
        {
          operation_name: "Огтлоо",
          qty: 250,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Хатуу хавтас",
          qty: 100,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false,
          notes: "Суурь угсрах"
        },
        {
          operation_name: "Спираль дарах",
          qty: 100,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Хэсэгчилсэн лак",
          qty: 100,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Чанарын эцсийн хяналт",
          qty: 100,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PACKAGING",
          is_manual: false
        }
      ],
      specifications: {
        cover_color: "4+4",
        inner_color: "4+4",
        total_pages: 26
      }
    }
  },
  {
    template_name: "Хортой маягт А5 (3 хувьтай, 100 хуудас, Дугаарлалттай, 500ш)",
    category: "Маягт",
    binding_type: "Цавуут",
    size: "A5",
    cover_color: "1+0",
    inner_color: "1+0",
    total_pages: 100,
    needs_design: false,
    design_status: "Эх бэлэн",
    design_cost: 0,
    notes: "Хортой маягт А5 хэмжээтэй 3 хувьтай (Цагаан, Ягаан, Ногоон), 500 ширхэг",
    order_data: {
      sub_size: "148x210mm",
      total_qty: 500,
      materials: [
        {
          material_name: "Офсет цаас 80гр A0 (889x1194)",
          size: "A0",
          print_size: "A2",
          press_sheet: "1.0",
          base_qty: 500,
          extra_qty: 50,
          total_qty: 550,
          divide_by: 4,
          sheet_qty: 138,
          unit_cost: 650,
          notes: "I хувь цагаан (CB)",
          is_cover: false
        },
        {
          material_name: "Офсет цаас 80гр A0 (889x1194)",
          size: "A0",
          print_size: "A2",
          press_sheet: "1.0",
          base_qty: 500,
          extra_qty: 50,
          total_qty: 550,
          divide_by: 4,
          sheet_qty: 138,
          unit_cost: 650,
          notes: "II хувь ягаан (CFB)",
          is_cover: false
        },
        {
          material_name: "Офсет цаас 80гр A0 (889x1194)",
          size: "A0",
          print_size: "A2",
          press_sheet: "1.0",
          base_qty: 500,
          extra_qty: 50,
          total_qty: 550,
          divide_by: 4,
          sheet_qty: 138,
          unit_cost: 650,
          notes: "III хувь ногоон (CF)",
          is_cover: false
        },
        {
          material_name: "CTP хавтан (74.5x60.5)",
          size: "74.5x60.5",
          print_size: "A2",
          press_sheet: "1.0",
          base_qty: 1,
          extra_qty: 0,
          total_qty: 1,
          divide_by: 1,
          sheet_qty: 1,
          unit_cost: 8800,
          notes: "CTP хэвлэлийн хавтан (1+0)",
          is_cover: false
        }
      ],
      operations: [
        {
          operation_name: "Хэвлэх (1 өнгө)",
          qty: 1500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PRINTING",
          is_manual: false,
          notes: "3 хувь хэвлэх"
        },
        {
          operation_name: "Дугаарлалт",
          qty: 1500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Цуглуулга",
          qty: 500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Блок наалт",
          qty: 500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Огтлоо",
          qty: 500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "POST_PRESS",
          is_manual: false
        },
        {
          operation_name: "Чанарын эцсийн хяналт",
          qty: 500,
          unit_cost: 0,
          is_pricing: false,
          production_stage: "PACKAGING",
          is_manual: false
        }
      ],
      specifications: {
        cover_color: "1+0",
        inner_color: "1+0",
        total_pages: 100
      }
    }
  }
];

export async function seedVerifiedWorkshopTemplates() {
  console.log('Seeding Verified Workshop Product Templates...');
  let admin = null;
  try {
    admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  } catch (e) {
    console.log('Could not fetch admin user. Skipping created_by assignment.');
  }

  for (const t of verifiedWorkshopTemplates) {
    const existing = await prisma.producttemplate.findFirst({
      where: { template_name: t.template_name }
    });

    if (existing) {
      console.log(`Updating template: ${t.template_name}`);
      await prisma.producttemplate.update({
        where: { id: existing.id },
        data: {
          category: t.category,
          binding_type: t.binding_type,
          size: t.size,
          cover_color: t.cover_color,
          inner_color: t.inner_color,
          total_pages: t.total_pages,
          needs_design: t.needs_design,
          design_status: t.design_status,
          design_cost: t.design_cost,
          notes: t.notes,
          order_data: t.order_data
        }
      });
    } else {
      console.log(`Creating template: ${t.template_name}`);
      await prisma.producttemplate.create({
        data: {
          template_name: t.template_name,
          category: t.category,
          binding_type: t.binding_type,
          size: t.size,
          cover_color: t.cover_color,
          inner_color: t.inner_color,
          total_pages: t.total_pages,
          needs_design: t.needs_design,
          design_status: t.design_status,
          design_cost: t.design_cost,
          notes: t.notes,
          order_data: t.order_data
        }
      });
    }
  }
  console.log('Done seeding verified workshop templates!');
}

if (require.main === module) {
  seedVerifiedWorkshopTemplates()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
