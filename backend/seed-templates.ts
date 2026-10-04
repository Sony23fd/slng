import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

const standardTemplates = [
  {
    "template_name": "Ном А5 (Зөөлөн хавтас, 160 нүүр, Наалттай)",
    "category": "Ном хар",
    "binding_type": "Наалттай",
    "size": "A5",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Стандарт А5 хэмжээтэй зөөлөн хавтастай ном",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "B3",
          "press_sheet": "0.5",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 600,
          "divide_by": 5,
          "sheet_qty": 120,
          "unit_cost": 1400,
          "notes": "Хавтас",
          "is_cover": true
        },
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "10",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 10200,
          "divide_by": 4,
          "sheet_qty": 2550,
          "unit_cost": 510,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B3",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 4.08,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B3 0.004)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B3",
          "press_sheet": "0.5",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "Хавтасны CTP хэвлэлийн хавтан (4+0)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "10",
          "base_qty": 20,
          "extra_qty": 0,
          "total_qty": 20,
          "divide_by": 1,
          "sheet_qty": 20,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Дотор хуудас нугалах"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Дэвтэрлэх цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Термо цавуун наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160,
        "has_bookmark": "Үгүй"
      }
    }
  },
  {
    "template_name": "Сэтгүүл А4 (32 нүүр, Үдээстэй)",
    "category": "Сэтгүүл",
    "binding_type": "Үдээстэй",
    "size": "A4",
    "cover_color": "4+4",
    "inner_color": "4+4",
    "total_pages": 28,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Өнгөт сэтгүүл А4 хэмжээтэй, төмөр үдээстэй (Хавтас 4 нүүр + Дотор 28 нүүр)",
    "order_data": {
      "sub_size": "210x297mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 200гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "0.5",
          "base_qty": 500,
          "extra_qty": 100,
          "total_qty": 350,
          "divide_by": 4,
          "sheet_qty": 88,
          "unit_cost": 1150,
          "notes": "Хавтас",
          "is_cover": true
        },
        {
          "material_name": "Шохойтой цаас 128гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "3.5",
          "base_qty": 500,
          "extra_qty": 150,
          "total_qty": 1900,
          "divide_by": 4,
          "sheet_qty": 475,
          "unit_cost": 720,
          "notes": "Дотор хуудас (28 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Гялгар)",
          "size": "",
          "print_size": "A2",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 20,
          "total_qty": 520,
          "divide_by": 1,
          "sheet_qty": 3.12,
          "unit_cost": 1500,
          "notes": "Хавтасны гялгар бүрэлт (A2 0.006)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "4",
          "base_qty": 32,
          "extra_qty": 0,
          "total_qty": 32,
          "divide_by": 1,
          "sheet_qty": 32,
          "unit_cost": 8800,
          "notes": "Хавтас (4 ш) + Дотор (28 ш)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 2000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Өнгөт хэвлэлт"
        },
        {
          "operation_name": "Шалгах",
          "qty": 2000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 1750,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Үдээ (Унаа үдээ)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Төмөр үдээс"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+4",
        "inner_color": "4+4",
        "total_pages": 28
      }
    }
  },
  {
    "template_name": "Брошур А4 (1 нугалаа, 4 нүүр)",
    "category": "Танилцуулга",
    "binding_type": "Үдээстэй",
    "size": "A4",
    "cover_color": "4+4",
    "inner_color": "4+4",
    "total_pages": 4,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "А4 нугалбар брошур (Дэлгээс А3 хэмжээтэй, 1 нугалаатай)",
    "order_data": {
      "sub_size": "210x297mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 200гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 500,
          "extra_qty": 100,
          "total_qty": 600,
          "divide_by": 4,
          "sheet_qty": 150,
          "unit_cost": 1150,
          "notes": "Брошурын цаас",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "A2",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 20,
          "total_qty": 520,
          "divide_by": 1,
          "sheet_qty": 3.12,
          "unit_cost": 1500,
          "notes": "Матт бүрэлт (A2 0.006)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 8,
          "extra_qty": 0,
          "total_qty": 8,
          "divide_by": 1,
          "sheet_qty": 8,
          "unit_cost": 8800,
          "notes": "CTP хэвлэлийн хавтан (4+4, 1 х.х)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Өнгөт хэвлэлт"
        },
        {
          "operation_name": "Шалгах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалах"
        },
        {
          "operation_name": "Огтлоо (Дунд)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Шалгах"
        }
      ],
      "specifications": {
        "cover_color": "4+4",
        "inner_color": "4+4",
        "total_pages": 4
      }
    }
  },
  {
    "template_name": "Цаасан Тор (B2 дэлгээс, оосортой, 500ш)",
    "category": "Тор",
    "binding_type": "Бусад",
    "size": "Тор 24х32х8 (Дэлгээс: 64х44см)",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "B2 хэмжээтэй стандарт цаасан тор, даавуун оосортой",
    "order_data": {
      "sub_size": "240x320x80mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 250гр B1 (787x1092)",
          "size": "B1",
          "print_size": "B2",
          "press_sheet": "1",
          "base_qty": 500,
          "extra_qty": 100,
          "total_qty": 600,
          "divide_by": 2,
          "sheet_qty": 300,
          "unit_cost": 1150,
          "notes": "Торны их бие (Дэлгээс 64х44см)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B2",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 20,
          "total_qty": 520,
          "divide_by": 1,
          "sheet_qty": 3.64,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B2 0.007)",
          "is_cover": false
        },
        {
          "material_name": "Оосор (Торны оосор)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 1,
          "sheet_qty": 1000,
          "unit_cost": 80,
          "notes": "Оосор (1 торонд 2ш)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B2",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хэвлэлийн хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "B2 хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Хэв дарах (A3)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хэвлэх огтлох"
        },
        {
          "operation_name": "Бөгж цоологч",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нүхлэх"
        },
        {
          "operation_name": "Гараар хийх ажил",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Угсрах, наах"
        },
        {
          "operation_name": "Огтлоо (Том)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цаас зүсэх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Шалгах"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Ширээний Календарь А5 (26 нүүр, Спираль, Картон суурьтай)",
    "category": "Календар",
    "binding_type": "Спираль",
    "size": "A5",
    "cover_color": "4+0",
    "inner_color": "4+4",
    "total_pages": 26,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Ширээний хуанли А5 (13 хуудас, 26 нүүр, төмөр спираль үдээс, картон суурь)",
    "order_data": {
      "sub_size": "210x148mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1.625",
          "base_qty": 300,
          "extra_qty": 150,
          "total_qty": 637.5,
          "divide_by": 4,
          "sheet_qty": 160,
          "unit_cost": 1400,
          "notes": "Календарийн хуудас (13 хуудас)",
          "is_cover": false
        },
        {
          "material_name": "Мат цаас 300гр A0 (889x1194)",
          "size": "A0",
          "print_size": "B3",
          "press_sheet": "1",
          "base_qty": 300,
          "extra_qty": 100,
          "total_qty": 400,
          "divide_by": 5,
          "sheet_qty": 80,
          "unit_cost": 1800,
          "notes": "Суурийн цаас",
          "is_cover": true
        },
        {
          "material_name": "Картон 2 A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 300,
          "extra_qty": 0,
          "total_qty": 300,
          "divide_by": 12,
          "sheet_qty": 25,
          "unit_cost": 6300,
          "notes": "Суурийн картон",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B3",
          "press_sheet": "",
          "base_qty": 300,
          "extra_qty": 20,
          "total_qty": 320,
          "divide_by": 1,
          "sheet_qty": 1.28,
          "unit_cost": 1500,
          "notes": "Суурийн матт бүрэлт (B3 0.004)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "1.625",
          "base_qty": 16,
          "extra_qty": 0,
          "total_qty": 16,
          "divide_by": 1,
          "sheet_qty": 16,
          "unit_cost": 8800,
          "notes": "Хуудасны CTP хэвлэлийн хавтан (4+4)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B3",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "Суурийн CTP хэвлэлийн хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Өнгөт хэвлэлт"
        },
        {
          "operation_name": "Шалгах",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Спираль дарагч",
          "qty": 7200,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "24 нүх спираль"
        },
        {
          "operation_name": "Суурь хийх (А5)",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Суурь угсрах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "4+4",
        "total_pages": 26
      }
    }
  },
  {
    "template_name": "Ширээний Календарь B5 (26 нүүр, Спираль, Картон суурьтай)",
    "category": "Календар",
    "binding_type": "Спираль",
    "size": "B5",
    "cover_color": "4+0",
    "inner_color": "4+4",
    "total_pages": 26,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Ширээний хуанли B5 (13 хуудас, 26 нүүр, спираль үдээс, картон суурь)",
    "order_data": {
      "sub_size": "250x176mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр B1 (787x1092)",
          "size": "B1",
          "print_size": "B2",
          "press_sheet": "1.625",
          "base_qty": 300,
          "extra_qty": 150,
          "total_qty": 637.5,
          "divide_by": 2,
          "sheet_qty": 319,
          "unit_cost": 1150,
          "notes": "Календарийн хуудас (13 хуудас)",
          "is_cover": false
        },
        {
          "material_name": "Мат цаас 300гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 300,
          "extra_qty": 100,
          "total_qty": 400,
          "divide_by": 4,
          "sheet_qty": 100,
          "unit_cost": 1800,
          "notes": "Суурийн цаас",
          "is_cover": true
        },
        {
          "material_name": "Картон 2 A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 300,
          "extra_qty": 0,
          "total_qty": 300,
          "divide_by": 8,
          "sheet_qty": 38,
          "unit_cost": 6300,
          "notes": "Суурийн картон",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "A2",
          "press_sheet": "",
          "base_qty": 300,
          "extra_qty": 20,
          "total_qty": 320,
          "divide_by": 1,
          "sheet_qty": 1.92,
          "unit_cost": 1500,
          "notes": "Суурийн матт бүрэлт (A2 0.006)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B2",
          "press_sheet": "1.625",
          "base_qty": 16,
          "extra_qty": 0,
          "total_qty": 16,
          "divide_by": 1,
          "sheet_qty": 16,
          "unit_cost": 8800,
          "notes": "Хуудасны CTP хэвлэлийн хавтан (4+4)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "Суурийн CTP хэвлэлийн хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Өнгөт хэвлэлт"
        },
        {
          "operation_name": "Шалгах",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Спираль дарагч",
          "qty": 8400,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "28 нүх спираль"
        },
        {
          "operation_name": "Суурь хийх (B5)",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Суурь угсрах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 300,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "4+4",
        "total_pages": 26
      }
    }
  },
  {
    "template_name": "Ханын Календарь А2 (7 хуудас / 14 нүүр, Спираль үдээстэй)",
    "category": "Календар",
    "binding_type": "Спираль",
    "size": "A2",
    "cover_color": "4+0",
    "inner_color": "4+0",
    "total_pages": 14,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Ханын А2 хуанли (7 хуудас, спираль үдээстэй, дүүжлэгчтэй)",
    "order_data": {
      "sub_size": "420x594mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "7",
          "base_qty": 500,
          "extra_qty": 100,
          "total_qty": 3600,
          "divide_by": 4,
          "sheet_qty": 900,
          "unit_cost": 1400,
          "notes": "Календарийн хуудас (7 хуудас)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "A2",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 20,
          "total_qty": 520,
          "divide_by": 1,
          "sheet_qty": 3.12,
          "unit_cost": 1500,
          "notes": "Хавтас бүрэлт",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "7",
          "base_qty": 28,
          "extra_qty": 0,
          "total_qty": 28,
          "divide_by": 1,
          "sheet_qty": 28,
          "unit_cost": 8800,
          "notes": "CTP хэвлэлийн хавтан (4+0, 7 х.х)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 3500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Өнгөт хэвлэлт"
        },
        {
          "operation_name": "Шалгах",
          "qty": 3500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Спираль дарагч",
          "qty": 28000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "56 нүх спираль + дүүжлэгч"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "4+0",
        "total_pages": 14
      }
    }
  },
  {
    "template_name": "Флаер А5 (Шохойтой 157гр, 2 тал 4+4)",
    "category": "Зурагт хуудас",
    "binding_type": "Бусад",
    "size": "A5",
    "cover_color": "4+4",
    "inner_color": "",
    "total_pages": 2,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "А5 хэмжээтэй стандарт флаер, 2 тал өнгөт хэвлэл",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 250,
          "extra_qty": 100,
          "total_qty": 350,
          "divide_by": 4,
          "sheet_qty": 88,
          "unit_cost": 890,
          "notes": "Флаер",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хэвлэлийн хавтан (4+4 татаж хөмрөх)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 250,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "2 тал хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 250,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+4",
        "total_pages": 2
      }
    }
  },
  {
    "template_name": "Нэрийн хуудас (Шохойтой 300гр, 90х50мм, 100ш)",
    "category": "Нэрийн хуудас",
    "binding_type": "Бусад",
    "size": "Custom",
    "cover_color": "4+4",
    "inner_color": "",
    "total_pages": 2,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Стандарт нэрийн хуудас 90х50мм, 100ш, 2 тал матт бүрэлттэй",
    "order_data": {
      "sub_size": "90x50mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 300гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 100,
          "extra_qty": 50,
          "total_qty": 150,
          "divide_by": 8,
          "sheet_qty": 19,
          "unit_cost": 1800,
          "notes": "Нэрийн хуудасны цаас",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "A3",
          "press_sheet": "",
          "base_qty": 100,
          "extra_qty": 20,
          "total_qty": 120,
          "divide_by": 1,
          "sheet_qty": 0.48,
          "unit_cost": 1500,
          "notes": "Матт бүрэлт",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хэвлэлийн хавтан (4+4)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 100,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "2 тал хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 100,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нэрийн хуудас огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 100,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+4",
        "total_pages": 2
      }
    }
  },
  {
    "template_name": "Ном А5 (Хатуу хавтастай, 160 нүүр, 1000ш)",
    "category": "Ном хар",
    "binding_type": "Хатуу хавтастай",
    "size": "A5",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Хатуу хавтастай А5 ном (Картон суурь, форзац, капитал, хавчуурга туузтай)",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "0.5",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 600,
          "divide_by": 4,
          "sheet_qty": 150,
          "unit_cost": 890,
          "notes": "Хавтасны цаас",
          "is_cover": true
        },
        {
          "material_name": "Картон 2 A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 14,
          "sheet_qty": 72,
          "unit_cost": 6300,
          "notes": "Хатуу хавтасны картон (14ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Мат цаас 200гр A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 8,
          "sheet_qty": 125,
          "unit_cost": 1150,
          "notes": "Хэвлэлгүй форзац (8ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Номын капитал (м)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 40,
          "divide_by": 1,
          "sheet_qty": 40,
          "unit_cost": 0,
          "notes": "Номын капитал (1000ш / 25)",
          "is_cover": false
        },
        {
          "material_name": "Хавчуурга тууз (м)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 300,
          "divide_by": 1,
          "sheet_qty": 300,
          "unit_cost": 0,
          "notes": "Хавчуурга тууз (30см)",
          "is_cover": false
        },
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "10",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 10200,
          "divide_by": 4,
          "sheet_qty": 2550,
          "unit_cost": 510,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "A2",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 6.12,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (A2 0.006)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "0.5",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "Хавтасны CTP хэвлэлийн хавтан (4+0)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "10",
          "base_qty": 20,
          "extra_qty": 0,
          "total_qty": 20,
          "divide_by": 1,
          "sheet_qty": 20,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Шалгах"
        },
        {
          "operation_name": "Блокон оёо",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Утас оёо"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Блок наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Хатуу хавтас (A5)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хавтас угсрах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160,
        "has_bookmark": "Тийм"
      }
    }
  },
  {
    "template_name": "Ном В5 (Хатуу хавтастай, 160 нүүр, 1000ш)",
    "category": "Ном хар",
    "binding_type": "Хатуу хавтастай",
    "size": "B5",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Хатуу хавтастай В5 ном (Картон суурь, форзац, капитал, хавчуурга туузтай)",
    "order_data": {
      "sub_size": "176x250mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "B3",
          "press_sheet": "1.0",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 5,
          "sheet_qty": 220,
          "unit_cost": 890,
          "notes": "Хавтасны цаас",
          "is_cover": true
        },
        {
          "material_name": "Картон 2 A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 9,
          "sheet_qty": 112,
          "unit_cost": 6300,
          "notes": "Хатуу хавтасны картон (9ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Мат цаас 200гр A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 5,
          "sheet_qty": 200,
          "unit_cost": 1150,
          "notes": "Хэвлэлгүй форзац (5ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Номын капитал (м)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 63,
          "divide_by": 1,
          "sheet_qty": 63,
          "unit_cost": 0,
          "notes": "Номын капитал (1000ш / 16)",
          "is_cover": false
        },
        {
          "material_name": "Хавчуурга тууз (м)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 330,
          "divide_by": 1,
          "sheet_qty": 330,
          "unit_cost": 0,
          "notes": "Хавчуурга тууз (33см)",
          "is_cover": false
        },
        {
          "material_name": "Офсет цаас 80гр B1 (787x1092)",
          "size": "B1",
          "print_size": "B2",
          "press_sheet": "10",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 10200,
          "divide_by": 2,
          "sheet_qty": 5100,
          "unit_cost": 408,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B3",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 4.08,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B3 0.004)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B3",
          "press_sheet": "B3",
          "base_qty": 1,
          "extra_qty": 0,
          "total_qty": 1,
          "divide_by": 1,
          "sheet_qty": 1,
          "unit_cost": 8800,
          "notes": "4",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "10",
          "base_qty": 20,
          "extra_qty": 0,
          "total_qty": 20,
          "divide_by": 1,
          "sheet_qty": 20,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х, 65*55)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Шалгах"
        },
        {
          "operation_name": "Блокон оёо",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Утас оёо"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Блок наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Хатуу хавтас (B5)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хавтас угсрах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160,
        "has_bookmark": "Тийм"
      }
    }
  },
  {
    "template_name": "Ном А4 (Хатуу хавтастай, 160 нүүр, 1000ш)",
    "category": "Ном хар",
    "binding_type": "Хатуу хавтастай",
    "size": "A4",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Хатуу хавтастай А4 ном (Картон суурь, форзац, капитал, хавчуурга туузтай)",
    "order_data": {
      "sub_size": "210x297mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "B3",
          "press_sheet": "1.0",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 5,
          "sheet_qty": 220,
          "unit_cost": 890,
          "notes": "Хавтасны цаас",
          "is_cover": true
        },
        {
          "material_name": "Картон 2 A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 7,
          "sheet_qty": 143,
          "unit_cost": 6300,
          "notes": "Хатуу хавтасны картон (7ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Мат цаас 200гр A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 4,
          "sheet_qty": 250,
          "unit_cost": 1150,
          "notes": "Хэвлэлгүй форзац (4ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Номын капитал (м)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 72,
          "divide_by": 1,
          "sheet_qty": 72,
          "unit_cost": 0,
          "notes": "Номын капитал (1000ш / 14)",
          "is_cover": false
        },
        {
          "material_name": "Хавчуурга тууз (м)",
          "size": "",
          "print_size": "",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 380,
          "divide_by": 1,
          "sheet_qty": 380,
          "unit_cost": 0,
          "notes": "Хавчуурга тууз (38см)",
          "is_cover": false
        },
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "20",
          "base_qty": 1000,
          "extra_qty": 300,
          "total_qty": 20300,
          "divide_by": 4,
          "sheet_qty": 5075,
          "unit_cost": 510,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B3",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 4.08,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B3 0.004)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B3",
          "press_sheet": "B3",
          "base_qty": 1,
          "extra_qty": 0,
          "total_qty": 1,
          "divide_by": 1,
          "sheet_qty": 1,
          "unit_cost": 8800,
          "notes": "4",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "20",
          "base_qty": 40,
          "extra_qty": 0,
          "total_qty": 40,
          "divide_by": 1,
          "sheet_qty": 40,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 20 х.х, 65*55)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Шалгах"
        },
        {
          "operation_name": "Блокон оёо",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Утас оёо"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Блок наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Хатуу хавтас (A4)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хавтас угсрах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160,
        "has_bookmark": "Тийм"
      }
    }
  },
  {
    "template_name": "Ном А5 (Супер хавтастай, 160 нүүр, 1000ш)",
    "category": "Ном хар",
    "binding_type": "Супер хавтастай",
    "size": "A5",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Супер хавтастай А5 ном (Гадуур нэмэлт өмсгөл хавтастай)",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр B1 (787x1092)",
          "size": "B1",
          "print_size": "B3",
          "press_sheet": "1.0",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 6,
          "sheet_qty": 184,
          "unit_cost": 1150,
          "notes": "Үндсэн хавтасны цаас",
          "is_cover": true
        },
        {
          "material_name": "Мат цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 16,
          "sheet_qty": 63,
          "unit_cost": 940,
          "notes": "Хэвлэлгүй форзац (16ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "10",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 10200,
          "divide_by": 4,
          "sheet_qty": 2550,
          "unit_cost": 510,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B3",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 4.08,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B3 0.004)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B3",
          "press_sheet": "B3",
          "base_qty": 1,
          "extra_qty": 0,
          "total_qty": 1,
          "divide_by": 1,
          "sheet_qty": 1,
          "unit_cost": 8800,
          "notes": "4",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "10",
          "base_qty": 20,
          "extra_qty": 0,
          "total_qty": 20,
          "divide_by": 1,
          "sheet_qty": 20,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х, 65*55)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Шалгах"
        },
        {
          "operation_name": "Блокон оёо",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Оёо"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Супер хавтас хийх",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Өмсгөх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160
      }
    }
  },
  {
    "template_name": "Ном В5 (Супер хавтастай, 160 нүүр, 1000ш)",
    "category": "Ном хар",
    "binding_type": "Супер хавтастай",
    "size": "B5",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Супер хавтастай В5 ном (Гадуур нэмэлт өмсгөл хавтастай)",
    "order_data": {
      "sub_size": "176x250mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр B1 (787x1092)",
          "size": "B1",
          "print_size": "594x280",
          "press_sheet": "1.0",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 6,
          "sheet_qty": 184,
          "unit_cost": 1150,
          "notes": "Үндсэн хавтасны цаас",
          "is_cover": true
        },
        {
          "material_name": "Мат цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 10,
          "sheet_qty": 100,
          "unit_cost": 940,
          "notes": "Хэвлэлгүй форзац (10ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Офсет цаас 80гр B1 (787x1092)",
          "size": "B1",
          "print_size": "B2",
          "press_sheet": "10",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 10200,
          "divide_by": 2,
          "sheet_qty": 5100,
          "unit_cost": 408,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B2",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 7.14,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B2 0.007)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "594x280",
          "press_sheet": "594x280",
          "base_qty": 1,
          "extra_qty": 0,
          "total_qty": 1,
          "divide_by": 1,
          "sheet_qty": 1,
          "unit_cost": 8800,
          "notes": "4",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "10",
          "base_qty": 20,
          "extra_qty": 0,
          "total_qty": 20,
          "divide_by": 1,
          "sheet_qty": 20,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х, 65*55)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Шалгах"
        },
        {
          "operation_name": "Блокон оёо",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Оёо"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Супер хавтас хийх",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Өмсгөх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160
      }
    }
  },
  {
    "template_name": "Ном А4 (Супер хавтастай, 160 нүүр, 1000ш)",
    "category": "Ном хар",
    "binding_type": "Супер хавтастай",
    "size": "A4",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 160,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Супер хавтастай А4 ном (Гадуур нэмэлт өмсгөл хавтастай)",
    "order_data": {
      "sub_size": "210x297mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр B1 (787x1092)",
          "size": "B1",
          "print_size": "720x380",
          "press_sheet": "1.0",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 3,
          "sheet_qty": 367,
          "unit_cost": 1150,
          "notes": "Үндсэн хавтасны цаас",
          "is_cover": true
        },
        {
          "material_name": "Мат цаас 157гр A0 (889x1194)",
          "size": "A0",
          "print_size": "",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 0,
          "total_qty": 1000,
          "divide_by": 8,
          "sheet_qty": 125,
          "unit_cost": 940,
          "notes": "Хэвлэлгүй форзац (8ш гарна)",
          "is_cover": false
        },
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "20",
          "base_qty": 1000,
          "extra_qty": 300,
          "total_qty": 20300,
          "divide_by": 4,
          "sheet_qty": 5075,
          "unit_cost": 510,
          "notes": "Дотор хуудас (160 нүүр)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B2",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 7.14,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт (B2 0.007)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "720x380",
          "press_sheet": "720x380",
          "base_qty": 1,
          "extra_qty": 0,
          "total_qty": 1,
          "divide_by": 1,
          "sheet_qty": 1,
          "unit_cost": 8800,
          "notes": "4",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "20",
          "base_qty": 40,
          "extra_qty": 0,
          "total_qty": 40,
          "divide_by": 1,
          "sheet_qty": 40,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 20 х.х, 65*55)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалаа"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулга"
        },
        {
          "operation_name": "Шалгах",
          "qty": 20000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Шалгах"
        },
        {
          "operation_name": "Блокон оёо",
          "qty": 10000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Оёо"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Супер хавтас хийх",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Өмсгөх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 160
      }
    }
  },
  {
    "template_name": "Ном өнгөт А5 (Зөөлөн хавтас, 96 нүүр, 4+4 өнгөт)",
    "category": "Ном өнгөт",
    "binding_type": "Наалттай",
    "size": "A5",
    "cover_color": "4+0",
    "inner_color": "4+4",
    "total_pages": 96,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Бүрэн өнгөт А5 ном (Хавтас 250гр матт бүрэлттэй, Дотор 128гр шохойтой, 4+4 өнгөт)",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "B3",
          "press_sheet": "0.5",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 600,
          "divide_by": 5,
          "sheet_qty": 120,
          "unit_cost": 1400,
          "notes": "Хавтас",
          "is_cover": true
        },
        {
          "material_name": "Шохойтой цаас 128гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "6",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 6200,
          "divide_by": 4,
          "sheet_qty": 1550,
          "unit_cost": 850,
          "notes": "Дотор хуудас (96 нүүр, 4+4 өнгөт)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B3",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 4.08,
          "unit_cost": 1500,
          "notes": "Хавтасны матт бүрэлт",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B3",
          "press_sheet": "0.5",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "Хавтасны CTP (4+0)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "6",
          "base_qty": 48,
          "extra_qty": 0,
          "total_qty": 48,
          "divide_by": 1,
          "sheet_qty": 48,
          "unit_cost": 8800,
          "notes": "Дотор хуудасны CTP (4+4, 6 х.х, 48 хавтан)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 6500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Өнгөт хэвлэл"
        },
        {
          "operation_name": "Шалгах",
          "qty": 6500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 6000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалах"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 6000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Цуглуулах"
        },
        {
          "operation_name": "Наалт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Термо наалт"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "3 тал огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "4+4",
        "total_pages": 96
      }
    }
  },
  {
    "template_name": "Албан бланк А4 (Офсет 80гр, 4+0 өнгөт, 1000ш)",
    "category": "Бланк",
    "binding_type": "Бусад",
    "size": "A4",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Байгууллагын лого бүхий А4 албан бланк",
    "order_data": {
      "sub_size": "210x297mm",
      "materials": [
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 4,
          "sheet_qty": 275,
          "unit_cost": 510,
          "notes": "Бланкны цаас",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Бланк хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "А4 зүсэх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Хортой маягт А5 (2 хувьтай, 100 хуудас, Дугаарлалттай, 500ш)",
    "category": "Хортой маягт",
    "binding_type": "Наалттай",
    "size": "A5",
    "cover_color": "1+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "2 хувьтай өөрөө хувилагч санхүүгийн маягт (Хар, шар хувь, дараалсан дугаарлалттай)",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Хортой цаас I өнгө 48гр Ao (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 500,
          "extra_qty": 50,
          "total_qty": 550,
          "divide_by": 8,
          "sheet_qty": 69,
          "unit_cost": 350,
          "notes": "Хортой цаас I (Дээд хувь)",
          "is_cover": false
        },
        {
          "material_name": "Хортой цаас II өнгө/шар 50гр Ao (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "1",
          "base_qty": 500,
          "extra_qty": 50,
          "total_qty": 550,
          "divide_by": 8,
          "sheet_qty": 69,
          "unit_cost": 350,
          "notes": "Хортой цаас II (Шар хувь)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "1",
          "base_qty": 1,
          "extra_qty": 0,
          "total_qty": 1,
          "divide_by": 1,
          "sheet_qty": 1,
          "unit_cost": 6800,
          "notes": "CTP хавтан (1+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нууцлал наах",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Дараалсан дугаар тавих"
        },
        {
          "operation_name": "Наалт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Блок наалт"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "1+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Шошго (Шохойтой 300гр, 50х90мм, Бөгжтэй, Матт бүрэлттэй, 1000ш)",
    "category": "Шошго",
    "binding_type": "Бусад",
    "size": "Custom",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Хувцас, барааны шошго (300гр шохойтой, матт бүрэлт, бөгж нүхтэй)",
    "order_data": {
      "sub_size": "50x90mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 300гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 8,
          "sheet_qty": 138,
          "unit_cost": 1650,
          "notes": "Шошгоны цаас",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "A3",
          "press_sheet": "",
          "base_qty": 1000,
          "extra_qty": 20,
          "total_qty": 1020,
          "divide_by": 1,
          "sheet_qty": 4.08,
          "unit_cost": 1500,
          "notes": "Матт бүрэлт",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Бөгж цоологч",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Бөгж цоолох"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Зүсэх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Дэвтэр А5 (48 нүүр, Үдээстэй, Мөрлөсөн, 500ш)",
    "category": "Дэвтэр",
    "binding_type": "Үдээстэй",
    "size": "A5",
    "cover_color": "4+0",
    "inner_color": "1+1",
    "total_pages": 44,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Сургуулийн болон тэмдэглэлийн дэвтэр А5 (Хавтас 4 нүүр + Дотор 44 нүүр мөрлөсөн)",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "0.25",
          "base_qty": 500,
          "extra_qty": 100,
          "total_qty": 225,
          "divide_by": 4,
          "sheet_qty": 57,
          "unit_cost": 1400,
          "notes": "Хавтас",
          "is_cover": true
        },
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "2.75",
          "base_qty": 500,
          "extra_qty": 150,
          "total_qty": 1525,
          "divide_by": 4,
          "sheet_qty": 382,
          "unit_cost": 510,
          "notes": "Дотор хуудас (Мөрлөсөн)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Гялгар)",
          "size": "",
          "print_size": "A2",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 20,
          "total_qty": 520,
          "divide_by": 1,
          "sheet_qty": 3.12,
          "unit_cost": 1500,
          "notes": "Гялгар бүрэлт",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "0.25",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "Хавтасны CTP (4+0)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (65x55)",
          "size": "65x55",
          "print_size": "65*55",
          "press_sheet": "2.75",
          "base_qty": 6,
          "extra_qty": 0,
          "total_qty": 6,
          "divide_by": 1,
          "sheet_qty": 6,
          "unit_cost": 6800,
          "notes": "Дотор хуудасны CTP (1+1)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 250,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хавтас хэвлэх"
        },
        {
          "operation_name": "Хэвлэх (1 өнгө)",
          "qty": 1375,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Дотор хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 250,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 1375,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалах"
        },
        {
          "operation_name": "Үдээ (Унаа үдээ)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Төмөр үдээс"
        },
        {
          "operation_name": "Огтлоо (Гурван талт)",
          "qty": 2,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "inner_color": "1+1",
        "total_pages": 44
      }
    }
  },
  {
    "template_name": "Хавтас А4 (Халаастай, Шохойтой 300гр, Матт бүрэлттэй, 500ш)",
    "category": "Хавтас",
    "binding_type": "Бусад",
    "size": "A4",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Бичиг баримтын албан хавтас (Нэрийн хуудасны завсартай халаастай, 300гр шохойтой, матт бүрэлттэй)",
    "order_data": {
      "sub_size": "220x310mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 300гр A0 (889x1194)",
          "size": "A0",
          "print_size": "B2",
          "press_sheet": "1",
          "base_qty": 500,
          "extra_qty": 100,
          "total_qty": 600,
          "divide_by": 2,
          "sheet_qty": 300,
          "unit_cost": 1650,
          "notes": "Хавтасны их бие (B2 дэлгээс)",
          "is_cover": false
        },
        {
          "material_name": "Бүрэлт (Матт)",
          "size": "",
          "print_size": "B2",
          "press_sheet": "",
          "base_qty": 500,
          "extra_qty": 20,
          "total_qty": 520,
          "divide_by": 1,
          "sheet_qty": 3.64,
          "unit_cost": 1500,
          "notes": "Матт бүрэлт",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (74.5x60.5)",
          "size": "74.5x60.5",
          "print_size": "B2",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Хэв дарах (A2)",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хэлбэрт огтлох"
        },
        {
          "operation_name": "Гараар хийх ажил",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Халаас нугалж наах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 500,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Дугтуй DL (Офсет 100гр, 110х220мм, 4+0, 1000ш)",
    "category": "Дугтуй",
    "binding_type": "Бусад",
    "size": "Custom",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Евро стандарт DL дугтуй (110х220мм, өнгөт логотой)",
    "order_data": {
      "sub_size": "110x220mm",
      "materials": [
        {
          "material_name": "Офсет цаас 100гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 8,
          "sheet_qty": 138,
          "unit_cost": 650,
          "notes": "Дугтуйн цаас",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Хэв дарах (A3)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Гараар хийх ажил",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Эвхэж наах"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Урилга (Матт 250гр, 1 нугалаа, Алтлаг клише дардастай, 200ш)",
    "category": "Урилга",
    "binding_type": "Бусад",
    "size": "A5",
    "cover_color": "4+4",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Хүндэтгэлийн урилга (250гр матт цаас, алтлаг фольга клише дардас, 1 нугалаа)",
    "order_data": {
      "sub_size": "148x210mm",
      "materials": [
        {
          "material_name": "Мат цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 200,
          "extra_qty": 50,
          "total_qty": 250,
          "divide_by": 4,
          "sheet_qty": 63,
          "unit_cost": 1400,
          "notes": "Урилгын цаас",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 8,
          "extra_qty": 0,
          "total_qty": 8,
          "divide_by": 1,
          "sheet_qty": 8,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+4)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 400,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 400,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Клише (Алтлаг)",
          "qty": 200,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Алтлаг клише дарах"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 200,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалах"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Зүсэх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 200,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+4",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Билет / Тасалбар (Офсет 80гр, Нууцлал дугаарлалттай, 1000ш)",
    "category": "Билет",
    "binding_type": "Бусад",
    "size": "Custom",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Арга хэмжээ, тоглолтын тасалбар билет (Цоолбор таслагчтай, дараалсан дугаарлалттай)",
    "order_data": {
      "sub_size": "200x70mm",
      "materials": [
        {
          "material_name": "Офсет цаас 80гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 1000,
          "extra_qty": 100,
          "total_qty": 1100,
          "divide_by": 8,
          "sheet_qty": 138,
          "unit_cost": 510,
          "notes": "Тасалбарын цаас",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 4,
          "extra_qty": 0,
          "total_qty": 4,
          "divide_by": 1,
          "sheet_qty": 4,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+0)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нууцлал наах",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Дараалсан дугаар тавих"
        },
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Зүсэх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Түргэн хэвлэл Konica А3 (Шохойтой 250гр, 4+0, 100ш)",
    "category": "Түргэн хэвлэл Konica",
    "binding_type": "Бусад",
    "size": "A3",
    "cover_color": "4+0",
    "inner_color": "",
    "total_pages": 1,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "Дижитал лазер принтерээр шуурхай хэвлэх А3 хуудас (CTP хавтан ашиглахгүй)",
    "order_data": {
      "sub_size": "297x420mm",
      "materials": [
        {
          "material_name": "Шохойтой цаас 250гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A3",
          "press_sheet": "1",
          "base_qty": 100,
          "extra_qty": 0,
          "total_qty": 100,
          "divide_by": 8,
          "sheet_qty": 13,
          "unit_cost": 1400,
          "notes": "А3 хэвлэх цаас",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Огтлоо (Жижиг)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Зүсэх"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 100,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+0",
        "total_pages": 1
      }
    }
  },
  {
    "template_name": "Сонин А3 (8 нүүр, Офсет 70гр, 4+4, 1000ш)",
    "category": "Сонин",
    "binding_type": "Бусад",
    "size": "A3",
    "cover_color": "4+4",
    "inner_color": "4+4",
    "total_pages": 8,
    "needs_design": false,
    "design_status": "Эх бэлэн",
    "design_cost": 0,
    "notes": "8 нүүртэй өнгөт сонин (А2 хэмжээтэй 2 хуудас дэлгээс, нугалсан)",
    "order_data": {
      "sub_size": "297x420mm",
      "materials": [
        {
          "material_name": "Офсет цаас 70гр A0 (889x1194)",
          "size": "A0",
          "print_size": "A2",
          "press_sheet": "2",
          "base_qty": 1000,
          "extra_qty": 200,
          "total_qty": 2200,
          "divide_by": 2,
          "sheet_qty": 1100,
          "unit_cost": 450,
          "notes": "Сонины цаас (А2 дэлгээс, 2 х.х)",
          "is_cover": false
        },
        {
          "material_name": "CTP хавтан (76x60.5)",
          "size": "76x60.5",
          "print_size": "A2",
          "press_sheet": "2",
          "base_qty": 16,
          "extra_qty": 0,
          "total_qty": 16,
          "divide_by": 1,
          "sheet_qty": 16,
          "unit_cost": 8800,
          "notes": "CTP хавтан (4+4, 2 х.х = 16 хавтан)",
          "is_cover": false
        }
      ],
      "operations": [
        {
          "operation_name": "Хэвлэх (4 өнгө)",
          "qty": 2000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PRINTING",
          "is_manual": false,
          "notes": "Хэвлэх"
        },
        {
          "operation_name": "Шалгах",
          "qty": 2000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хуудас шалгах"
        },
        {
          "operation_name": "Нугалаа",
          "qty": 2000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Нугалах"
        },
        {
          "operation_name": "Цуглуулга",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Хавсаргах"
        },
        {
          "operation_name": "Огтлоо (Том)",
          "qty": 1,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "POST_PRESS",
          "is_manual": false,
          "notes": "Огтлох"
        },
        {
          "operation_name": "Чанарын эцсийн хяналт",
          "qty": 1000,
          "unit_cost": 0,
          "is_pricing": false,
          "production_stage": "PACKAGING",
          "is_manual": false,
          "notes": "Эцсийн согог шалгалт"
        }
      ],
      "specifications": {
        "cover_color": "4+4",
        "inner_color": "4+4",
        "total_pages": 8
      }
    }
  }
];

export async function seedTemplates() {
  console.log('Seeding Product Templates...');
  let admin = null;
  try {
    admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  } catch (e) {
    console.log('Could not fetch admin user. Skipping created_by assignment.');
  }

  for (const t of standardTemplates) {
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
          order_data: t.order_data,
          created_by: admin ? admin.id : null
        }
      });
    }
  }
  console.log('Done seeding product templates!');
}

if (require.main === module) {
  seedTemplates()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
