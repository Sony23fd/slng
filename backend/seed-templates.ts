import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

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
  },
  {
    template_name: 'Ном А5 (Хатуу хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Хатуу хавтастай',
    size: 'A5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А5 хатуу хавтастай ном (160 нүүр, 1000ш standard)',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A5',
          print_size: 'A2',
          press_sheet: '0.5',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 4,
          sheet_qty: 150,
          unit_cost: 890,
          notes: 'Хавтас (157гр)',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 14,
          sheet_qty: 72,
          unit_cost: 6300,
          notes: 'Суурь картон 2мм',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 200гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 8,
          sheet_qty: 125,
          unit_cost: 1150,
          notes: 'Форзац (200гр хэвлэлгүй)',
          is_cover: false
        },
        {
          material_name: 'Номын капитал (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 40,
          divide_by: 1,
          sheet_qty: 40,
          unit_cost: 0,
          notes: 'Номын капитал (1000ш / 25)',
          is_cover: false
        },
        {
          material_name: 'Хавчуурга тууз (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 300,
          divide_by: 1,
          sheet_qty: 300,
          unit_cost: 0,
          notes: 'Хавчуурга тууз (1000ш * 0.30м)',
          is_cover: false
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
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 500, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 6, unit_cost: 1500, notes: 'Хавтас матт бүрэлт (A2 0.006 * 1000)' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Хатуу хавтас (A5)', qty: 1000, unit_cost: 2000, notes: 'Хатуу хавтас угсрах, наах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_printed_endpaper: false,
        has_bookmark: 'true'
      }
    }
  },
  {
    template_name: 'Ном В5 (Хатуу хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Хатуу хавтастай',
    size: 'B5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'В5 хатуу хавтастай ном (160 нүүр, 1000ш standard)',
    order_data: {
      sub_size: '176x250mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'B5',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 5,
          sheet_qty: 220,
          unit_cost: 890,
          notes: 'Хавтас (157гр)',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 9,
          sheet_qty: 112,
          unit_cost: 6300,
          notes: 'Суурь картон 2мм',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 200гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 5,
          sheet_qty: 200,
          unit_cost: 1150,
          notes: 'Форзац (200гр хэвлэлгүй)',
          is_cover: false
        },
        {
          material_name: 'Номын капитал (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 63,
          divide_by: 1,
          sheet_qty: 63,
          unit_cost: 0,
          notes: 'Номын капитал (1000ш / 16)',
          is_cover: false
        },
        {
          material_name: 'Хавчуурга тууз (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 330,
          divide_by: 1,
          sheet_qty: 330,
          unit_cost: 0,
          notes: 'Хавчуурга тууз (1000ш * 0.33м)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'B5',
          print_size: 'B2',
          press_sheet: '10',
          base_qty: 1000,
          extra_qty: 200,
          total_qty: 10200,
          divide_by: 2,
          sheet_qty: 5100,
          unit_cost: 510,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 4, unit_cost: 1500, notes: 'Хавтас матт бүрэлт (B3 0.004 * 1000)' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Хатуу хавтас (B5)', qty: 1000, unit_cost: 2500, notes: 'Хатуу хавтас угсрах, наах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_printed_endpaper: false,
        has_bookmark: 'true'
      }
    }
  },
  {
    template_name: 'Ном А4 (Хатуу хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Хатуу хавтастай',
    size: 'A4',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А4 хатуу хавтастай ном (160 нүүр, 1000ш standard)',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A4',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 5,
          sheet_qty: 220,
          unit_cost: 890,
          notes: 'Хавтас (157гр)',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 7,
          sheet_qty: 143,
          unit_cost: 6300,
          notes: 'Суурь картон 2мм',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 200гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 4,
          sheet_qty: 250,
          unit_cost: 1150,
          notes: 'Форзац (200гр хэвлэлгүй)',
          is_cover: false
        },
        {
          material_name: 'Номын капитал (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 72,
          divide_by: 1,
          sheet_qty: 72,
          unit_cost: 0,
          notes: 'Номын капитал (1000ш / 14)',
          is_cover: false
        },
        {
          material_name: 'Хавчуурга тууз (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 380,
          divide_by: 1,
          sheet_qty: 380,
          unit_cost: 0,
          notes: 'Хавчуурга тууз (1000ш * 0.38м)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A4',
          print_size: 'A2',
          press_sheet: '20',
          base_qty: 1000,
          extra_qty: 300,
          total_qty: 20300,
          divide_by: 4,
          sheet_qty: 5075,
          unit_cost: 510,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 20000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 20000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 20000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 20000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 4, unit_cost: 1500, notes: 'Хавтас матт бүрэлт (B3 0.004 * 1000)' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Хатуу хавтас (A4)', qty: 1000, unit_cost: 3000, notes: 'Хатуу хавтас угсрах, наах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_printed_endpaper: false,
        has_bookmark: 'true'
      }
    }
  },
  {
    template_name: 'Ном А4 (Хөөсөн хатуу хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Хөөсөн хатуу хавтастай',
    size: 'A4',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А4 хөөсөн хатуу хавтастай ном (дэлгээс 720х390мм, 1000ш standard)',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр B1 (787x1092)',
          size: 'A4',
          print_size: 'B2',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 3,
          sheet_qty: 367,
          unit_cost: 752,
          notes: 'Хавтас (157гр хөөсөн, 3 хуваалт)',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 7,
          sheet_qty: 143,
          unit_cost: 6300,
          notes: 'Суурь картон 2мм',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 200гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 4,
          sheet_qty: 250,
          unit_cost: 1150,
          notes: 'Форзац (200гр хэвлэлгүй)',
          is_cover: false
        },
        {
          material_name: 'Номын капитал (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 72,
          divide_by: 1,
          sheet_qty: 72,
          unit_cost: 0,
          notes: 'Номын капитал (1000ш / 14)',
          is_cover: false
        },
        {
          material_name: 'Хавчуурга тууз (м)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 380,
          divide_by: 1,
          sheet_qty: 380,
          unit_cost: 0,
          notes: 'Хавчуурга тууз (1000ш * 0.38м)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A4',
          print_size: 'A2',
          press_sheet: '20',
          base_qty: 1000,
          extra_qty: 300,
          total_qty: 20300,
          divide_by: 4,
          sheet_qty: 5075,
          unit_cost: 510,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 20000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 20000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 20000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 20000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 7, unit_cost: 1500, notes: 'Хавтас матт бүрэлт (B2 0.007 * 1000)' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Хөөсөн хатуу хавтас хийх', qty: 1000, unit_cost: 3500, notes: 'Хөөсөн хатуу хавтас угсрах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_printed_endpaper: false,
        has_bookmark: 'true'
      }
    }
  },
  {
    template_name: 'Ном А5 (Супер хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Супер хавтастай',
    size: 'A5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А5 супер хавтастай ном (дэлгээс B3, 1000ш standard)',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр B1 (787x1092)',
          size: 'B1',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 6,
          sheet_qty: 184,
          unit_cost: 1150,
          notes: 'Супер хавтас (250гр, 6 хуваалт)',
          is_cover: true
        },
        {
          material_name: 'Мат цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 16,
          sheet_qty: 63,
          unit_cost: 890,
          notes: 'Супер хавтасны форзац 157гр (16 хуваалт)',
          is_cover: false
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
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 4, unit_cost: 1500, notes: 'Хавтас матт бүрэлт (B3 0.004 * 1000)' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Супер хавтас хийх', qty: 1000, unit_cost: 1000, notes: 'А5 супер хавтас нугалах, өмсгөх' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_super_cover: true
      }
    }
  },
  {
    template_name: 'Ном В5 (Супер хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Супер хавтастай',
    size: 'B5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'В5 супер хавтастай ном (дэлгээс 594x280мм, 1000ш standard)',
    order_data: {
      sub_size: '176x250mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр B1 (787x1092)',
          size: 'B1',
          print_size: '594x280',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 6,
          sheet_qty: 184,
          unit_cost: 1150,
          notes: 'Супер хавтас (594x280, 6 хуваалт)',
          is_cover: true
        },
        {
          material_name: 'Мат цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 10,
          sheet_qty: 100,
          unit_cost: 890,
          notes: 'Супер хавтасны форзац 157гр (10 хуваалт)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр B1 (787x1092)',
          size: 'B5',
          print_size: 'B2',
          press_sheet: '10',
          base_qty: 1000,
          extra_qty: 200,
          total_qty: 10200,
          divide_by: 2,
          sheet_qty: 5100,
          unit_cost: 510,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 6, unit_cost: 1500, notes: 'Хавтас матт бүрэлт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Супер хавтас хийх', qty: 1000, unit_cost: 1000, notes: 'В5 супер хавтас нугалах, өмсгөх' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_super_cover: true
      }
    }
  },
  {
    template_name: 'Ном А4 (Супер хавтастай, 160 нүүр, 1000ш)',
    category: 'Ном',
    binding_type: 'Супер хавтастай',
    size: 'A4',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 160,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'А4 супер хавтастай ном (дэлгээс 720x380мм, 1000ш standard)',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр B1 (787x1092)',
          size: 'B1',
          print_size: '720x380',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 3,
          sheet_qty: 367,
          unit_cost: 1150,
          notes: 'Супер хавтас 250гр (720x380, 3 хуваалт)',
          is_cover: true
        },
        {
          material_name: 'Мат цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 1000,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 8,
          sheet_qty: 125,
          unit_cost: 890,
          notes: 'Супер хавтасны форзац 157гр (8 хуваалт)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A4',
          print_size: 'A2',
          press_sheet: '20',
          base_qty: 1000,
          extra_qty: 300,
          total_qty: 20300,
          divide_by: 4,
          sheet_qty: 5075,
          unit_cost: 510,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 40, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 20000, unit_cost: 10, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 20000, unit_cost: 10, notes: 'Дотор нугалах' },
        { operation_name: 'Цуглуулга', qty: 20000, unit_cost: 10, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 20000, unit_cost: 10, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 150, notes: 'Дотор блок наах' },
        { operation_name: 'Бүрэлт (Матт)', qty: 7, unit_cost: 1500, notes: 'Хавтас матт бүрэлт (B2 0.007 * 1000)' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 2500, notes: 'Блок 3 тал огтлох' },
        { operation_name: 'Супер хавтас хийх', qty: 1000, unit_cost: 1000, notes: 'А4 супер хавтас нугалах, өмсгөх' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_super_cover: true
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
