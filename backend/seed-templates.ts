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
          size: 'A0',
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
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B3',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 4.4,
          divide_by: 1,
          sheet_qty: 4.4,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B3 0.004)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'B3',
          print_size: 'B3',
          press_sheet: '0.5',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '10',
          base_qty: 20,
          extra_qty: 0,
          total_qty: 20,
          divide_by: 1,
          sheet_qty: 20,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Дотор хуудас нугалах' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Дэвтэрлэх цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Хуудас шалгах' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Термо цавуун наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн согог шалгалт' },
        { operation_name: 'Тусгай боодол / Хайрцаглах', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Баглаж хайрцаглах' }
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
    total_pages: 28,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'Өнгөт сэтгүүл А4 хэмжээтэй, төмөр үдээстэй (Хавтас 4 нүүр + Дотор 28 нүүр)',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 200гр A0 (889x1194)',
          size: 'A0',
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
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Гялгар)',
          size: '',
          print_size: 'A2',
          press_sheet: '',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 3.6,
          divide_by: 1,
          sheet_qty: 3.6,
          unit_cost: 1500,
          notes: 'Хавтасны гялгар бүрэлт (A2 0.006)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '0.5',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Хавтасны CTP хэвлэлийн хавтан (4+4)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '3.5',
          base_qty: 28,
          extra_qty: 0,
          total_qty: 28,
          divide_by: 1,
          sheet_qty: 28,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (4+4, 3.5 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 2000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Өнгөт хэвлэлт' },
        { operation_name: 'Нугалаа', qty: 1750, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Үдээ (Унаа үдээ)', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Төмөр үдээс' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 1, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Огтлох' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+4',
        inner_color: '4+4',
        total_pages: 28
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
    notes: 'А4 нугалбар брошур (Дэлгээс А3 хэмжээтэй, 1 нугалаатай)',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 200гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 4,
          sheet_qty: 150,
          unit_cost: 1150,
          notes: 'Брошурын цаас',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'A2',
          press_sheet: '',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 3.6,
          divide_by: 1,
          sheet_qty: 3.6,
          unit_cost: 1500,
          notes: 'Матт бүрэлт (A2 0.006)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Үндсэн)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 8,
          extra_qty: 0,
          total_qty: 8,
          divide_by: 1,
          sheet_qty: 8,
          unit_cost: 8800,
          notes: 'CTP хэвлэлийн хавтан (4+4, 1 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Өнгөт хэвлэлт' },
        { operation_name: 'Нугалаа', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалах' },
        { operation_name: 'Огтлоо (Дунд)', qty: 1, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Огтлох' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Шалгах' }
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
    total_pages: 1,
    needs_design: false,
    design_status: 'Эх бэлэн',
    design_cost: 0,
    notes: 'B2 хэмжээтэй стандарт цаасан тор, даавуун оосортой',
    order_data: {
      sub_size: '240x320x80mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 250гр B1 (787x1092)',
          size: 'B1',
          print_size: 'B2',
          press_sheet: '1',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 2,
          sheet_qty: 300,
          unit_cost: 1150,
          notes: 'Торны их бие (Дэлгээс 64х44см)',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B2',
          press_sheet: '',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 4.2,
          divide_by: 1,
          sheet_qty: 4.2,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B2 0.007)',
          is_cover: false
        },
        {
          material_name: 'Оосор (Торны оосор)',
          size: '',
          print_size: '',
          press_sheet: '',
          base_qty: 500,
          extra_qty: 0,
          total_qty: 1000,
          divide_by: 1,
          sheet_qty: 1000,
          unit_cost: 80,
          notes: 'Оосор (1 торонд 2ш)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Үндсэн)',
          size: 'B2',
          print_size: 'B2',
          press_sheet: '1',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'B2 хэвлэх' },
        { operation_name: 'Бөгж цоологч', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нүхлэх' },
        { operation_name: 'Гараар хийх ажил', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Угсрах, наах' },
        { operation_name: 'Хэв дарах (A3)', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Хэвлэх огтлох' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Тусгай боодол / Хайрцаглах', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Савлах' }
      ],
      specifications: {
        cover_color: '4+0',
        total_pages: 1
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
    notes: 'Ширээний хуанли А5 (13 хуудас, 26 нүүр, төмөр спираль үдээс, картон суурь)',
    order_data: {
      sub_size: '210x148mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A2',
          press_sheet: '1.625',
          base_qty: 300,
          extra_qty: 150,
          total_qty: 637.5,
          divide_by: 4,
          sheet_qty: 160,
          unit_cost: 1400,
          notes: 'Календарийн хуудас (13 хуудас)',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 300гр A0 (889x1194)',
          size: 'A0',
          print_size: 'B3',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 100,
          total_qty: 400,
          divide_by: 5,
          sheet_qty: 80,
          unit_cost: 1800,
          notes: 'Суурийн цаас',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 0,
          total_qty: 300,
          divide_by: 12,
          sheet_qty: 25,
          unit_cost: 6300,
          notes: 'Суурийн картон',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B3',
          press_sheet: '',
          base_qty: 300,
          extra_qty: 100,
          total_qty: 1.6,
          divide_by: 1,
          sheet_qty: 1.6,
          unit_cost: 1500,
          notes: 'Суурийн матт бүрэлт (B3 0.004)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хуудас)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '1.625',
          base_qty: 16,
          extra_qty: 0,
          total_qty: 16,
          divide_by: 1,
          sheet_qty: 16,
          unit_cost: 8800,
          notes: 'Хуудасны CTP хэвлэлийн хавтан (4+4, 1.625 х.х)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Суурь)',
          size: 'B3',
          print_size: 'B3',
          press_sheet: '1',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Суурийн CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 300, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Өнгөт хэвлэлт' },
        { operation_name: 'Спираль дарагч', qty: 7200, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '24 нүх спираль' },
        { operation_name: 'Суурь хийх (А5)', qty: 300, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Суурь угсрах' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 300, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
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
    notes: 'Ширээний хуанли B5 (13 хуудас, 26 нүүр, спираль үдээс, картон суурь)',
    order_data: {
      sub_size: '250x176mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр B1 (787x1092)',
          size: 'B1',
          print_size: 'B2',
          press_sheet: '1.625',
          base_qty: 300,
          extra_qty: 150,
          total_qty: 637.5,
          divide_by: 2,
          sheet_qty: 319,
          unit_cost: 1150,
          notes: 'Календарийн хуудас (13 хуудас)',
          is_cover: false
        },
        {
          material_name: 'Мат цаас 300гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 100,
          total_qty: 400,
          divide_by: 4,
          sheet_qty: 100,
          unit_cost: 1800,
          notes: 'Суурийн цаас',
          is_cover: true
        },
        {
          material_name: 'Картон 2 A0 (889x1194)',
          size: 'A0',
          print_size: '',
          press_sheet: '1',
          base_qty: 300,
          extra_qty: 0,
          total_qty: 300,
          divide_by: 8,
          sheet_qty: 38,
          unit_cost: 6300,
          notes: 'Суурийн картон',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'A2',
          press_sheet: '',
          base_qty: 300,
          extra_qty: 100,
          total_qty: 2.4,
          divide_by: 1,
          sheet_qty: 2.4,
          unit_cost: 1500,
          notes: 'Суурийн матт бүрэлт (A2 0.006)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хуудас)',
          size: 'B2',
          print_size: 'B2',
          press_sheet: '1.625',
          base_qty: 16,
          extra_qty: 0,
          total_qty: 16,
          divide_by: 1,
          sheet_qty: 16,
          unit_cost: 8800,
          notes: 'Хуудасны CTP хэвлэлийн хавтан (4+4, 1.625 х.х)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Суурь)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Суурийн CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 300, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Өнгөт хэвлэлт' },
        { operation_name: 'Спираль дарагч', qty: 8400, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '28 нүх спираль' },
        { operation_name: 'Суурь хийх (B5)', qty: 300, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Суурь угсрах' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 300, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
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
    notes: 'Ханын А2 хуанли (7 хуудас, спираль үдээстэй, дүүжлэгчтэй)',
    order_data: {
      sub_size: '420x594mm',
      materials: [
        {
          material_name: 'Мат цаас 250гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A2',
          press_sheet: '7',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 3600,
          divide_by: 4,
          sheet_qty: 900,
          unit_cost: 1400,
          notes: 'Календарийн хуудас (7 хуудас)',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'A2',
          press_sheet: '',
          base_qty: 500,
          extra_qty: 100,
          total_qty: 3.6,
          divide_by: 1,
          sheet_qty: 3.6,
          unit_cost: 1500,
          notes: 'Хавтас бүрэлт',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Үндсэн)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '7',
          base_qty: 28,
          extra_qty: 0,
          total_qty: 28,
          divide_by: 1,
          sheet_qty: 28,
          unit_cost: 8800,
          notes: 'CTP хэвлэлийн хавтан (4+0, 7 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 3500, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Өнгөт хэвлэлт' },
        { operation_name: 'Спираль дарагч', qty: 28000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '56 нүх спираль + дүүжлэгч' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
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
    notes: 'А5 хэмжээтэй стандарт флаер, 2 тал өнгөт хэвлэл',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 250,
          extra_qty: 100,
          total_qty: 350,
          divide_by: 4,
          sheet_qty: 88,
          unit_cost: 890,
          notes: 'Флаер',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Үндсэн)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '1',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'CTP хэвлэлийн хавтан (4+4 татаж хөмрөх)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 250, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: '2 тал хэвлэх' },
        { operation_name: 'Огтлоо (Жижиг)', qty: 1, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Огтлох' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
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
    notes: 'Стандарт нэрийн хуудас 90х50мм, 100ш, 2 тал матт бүрэлттэй',
    order_data: {
      sub_size: '90x50mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 300гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A3',
          press_sheet: '1',
          base_qty: 100,
          extra_qty: 50,
          total_qty: 150,
          divide_by: 8,
          sheet_qty: 19,
          unit_cost: 1800,
          notes: 'Нэрийн хуудасны цаас',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'A3',
          press_sheet: '',
          base_qty: 100,
          extra_qty: 50,
          total_qty: 0.6,
          divide_by: 1,
          sheet_qty: 0.6,
          unit_cost: 1500,
          notes: 'Матт бүрэлт',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Үндсэн)',
          size: 'A3',
          print_size: 'A3',
          press_sheet: '1',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'CTP хэвлэлийн хавтан (4+4)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 100, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: '2 тал хэвлэх' },
        { operation_name: 'Огтлоо (Жижиг)', qty: 1, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нэрийн хуудас огтлох' },
        { operation_name: 'Тусгай боодол / Хайрцаглах', qty: 1, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Хайрцаглах' }
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
    notes: 'Хатуу хавтастай А5 ном (Картон суурь, форзац, капитал, хавчуурга туузтай)',
    order_data: {
      sub_size: '148x210mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: 'A2',
          press_sheet: '0.5',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 600,
          divide_by: 4,
          sheet_qty: 150,
          unit_cost: 890,
          notes: 'Хавтасны цаас',
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
          notes: 'Хатуу хавтасны картон (14ш гарна)',
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
          notes: 'Хэвлэлгүй форзац (8ш гарна)',
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
          notes: 'Хавчуурга тууз (30см)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'A2',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 6.6,
          divide_by: 1,
          sheet_qty: 6.6,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (A2 0.006)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '0.5',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '10',
          base_qty: 20,
          extra_qty: 0,
          total_qty: 20,
          divide_by: 1,
          sheet_qty: 20,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 500, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Утас оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Блок наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Хатуу хавтас (A5)', qty: 1000, unit_cost: 2000, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Хавтас угсрах' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн согог шалгалт' },
        { operation_name: 'Тусгай боодол / Хайрцаглах', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Баглаж хайрцаглах' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_bookmark: 'Тийм'
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
    notes: 'Хатуу хавтастай В5 ном (Картон суурь, форзац, капитал, хавчуурга туузтай)',
    order_data: {
      sub_size: '176x250mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 5,
          sheet_qty: 220,
          unit_cost: 890,
          notes: 'Хавтасны цаас',
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
          notes: 'Хатуу хавтасны картон (9ш гарна)',
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
          notes: 'Хэвлэлгүй форзац (5ш гарна)',
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
          notes: 'Хавчуурга тууз (33см)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр B1 (787x1092)',
          size: 'B1',
          print_size: 'B2',
          press_sheet: '10',
          base_qty: 1000,
          extra_qty: 200,
          total_qty: 10200,
          divide_by: 2,
          sheet_qty: 5100,
          unit_cost: 408,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B3',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 4.4,
          divide_by: 1,
          sheet_qty: 4.4,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B3 0.004)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'B3',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'B2',
          print_size: 'B2',
          press_sheet: '10',
          base_qty: 20,
          extra_qty: 0,
          total_qty: 20,
          divide_by: 1,
          sheet_qty: 20,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Утас оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Блок наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Хатуу хавтас (B5)', qty: 1000, unit_cost: 2500, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Хавтас угсрах' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_bookmark: 'Тийм'
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
    notes: 'Хатуу хавтастай А4 ном (Картон суурь, форзац, капитал, хавчуурга туузтай)',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр A0 (889x1194)',
          size: 'A0',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 5,
          sheet_qty: 220,
          unit_cost: 890,
          notes: 'Хавтасны цаас',
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
          notes: 'Хатуу хавтасны картон (7ш гарна)',
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
          notes: 'Хэвлэлгүй форзац (4ш гарна)',
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
          notes: 'Хавчуурга тууз (38см)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B3',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 4.4,
          divide_by: 1,
          sheet_qty: 4.4,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B3 0.004)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'B3',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '20',
          base_qty: 40,
          extra_qty: 0,
          total_qty: 40,
          divide_by: 1,
          sheet_qty: 40,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 20 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Утас оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Блок наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Хатуу хавтас (A4)', qty: 1000, unit_cost: 3000, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Хавтас угсрах' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_bookmark: 'Тийм'
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
    notes: 'Хөөсөн зөөлөвчтэй хатуу хавтастай А4 ном',
    order_data: {
      sub_size: '210x297mm',
      materials: [
        {
          material_name: 'Шохойтой цаас 157гр B1 (787x1092)',
          size: 'B1',
          print_size: 'B2',
          press_sheet: '1.0',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 1100,
          divide_by: 3,
          sheet_qty: 367,
          unit_cost: 752,
          notes: 'Хавтасны цаас',
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
          notes: 'Хатуу хавтасны картон (7ш гарна)',
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
          notes: 'Хэвлэлгүй форзац (4ш гарна)',
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
          notes: 'Хавчуурга тууз (38см)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B2',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 7.7,
          divide_by: 1,
          sheet_qty: 7.7,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B2 0.007)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'B2',
          print_size: 'B2',
          press_sheet: '1.0',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '20',
          base_qty: 40,
          extra_qty: 0,
          total_qty: 40,
          divide_by: 1,
          sheet_qty: 40,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 20 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Утас оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Блок наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Хөөсөн хатуу хавтас хийх', qty: 1000, unit_cost: 3500, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Хөөсөн хавтас угсрах' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160,
        has_bookmark: 'Тийм'
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
    notes: 'Супер хавтастай А5 ном (Гадуур нэмэлт өмсгөл хавтастай)',
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
          notes: 'Үндсэн хавтасны цаас',
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
          unit_cost: 940,
          notes: 'Хэвлэлгүй форзац (16ш гарна)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B3',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 4.4,
          divide_by: 1,
          sheet_qty: 4.4,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B3 0.004)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: 'B3',
          print_size: 'B3',
          press_sheet: '1.0',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Супер хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '10',
          base_qty: 20,
          extra_qty: 0,
          total_qty: 20,
          divide_by: 1,
          sheet_qty: 20,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Супер хавтас хийх', qty: 1000, unit_cost: 1000, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Өмсгөх' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160
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
    notes: 'Супер хавтастай В5 ном (Гадуур нэмэлт өмсгөл хавтастай)',
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
          notes: 'Үндсэн хавтасны цаас',
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
          unit_cost: 940,
          notes: 'Хэвлэлгүй форзац (10ш гарна)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр B1 (787x1092)',
          size: 'B1',
          print_size: 'B2',
          press_sheet: '10',
          base_qty: 1000,
          extra_qty: 200,
          total_qty: 10200,
          divide_by: 2,
          sheet_qty: 5100,
          unit_cost: 408,
          notes: 'Дотор хуудас (160 нүүр)',
          is_cover: false
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B2',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 7.7,
          divide_by: 1,
          sheet_qty: 7.7,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B2 0.007)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: '594x280',
          print_size: '594x280',
          press_sheet: '1.0',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Супер хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'B2',
          print_size: 'B2',
          press_sheet: '10',
          base_qty: 20,
          extra_qty: 0,
          total_qty: 20,
          divide_by: 1,
          sheet_qty: 20,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 10 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 10000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Супер хавтас хийх', qty: 1000, unit_cost: 1000, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Өмсгөх' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160
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
    notes: 'Супер хавтастай А4 ном (Гадуур нэмэлт өмсгөл хавтастай)',
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
          notes: 'Үндсэн хавтасны цаас',
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
          unit_cost: 940,
          notes: 'Хэвлэлгүй форзац (8ш гарна)',
          is_cover: false
        },
        {
          material_name: 'Офсет цаас 80гр A0 (889x1194)',
          size: 'A0',
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
        },
        {
          material_name: 'Бүрэлт (Матт)',
          size: '',
          print_size: 'B2',
          press_sheet: '',
          base_qty: 1000,
          extra_qty: 100,
          total_qty: 7.7,
          divide_by: 1,
          sheet_qty: 7.7,
          unit_cost: 1500,
          notes: 'Хавтасны матт бүрэлт (B2 0.007)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Хавтас)',
          size: '720x380',
          print_size: '720x380',
          press_sheet: '1.0',
          base_qty: 4,
          extra_qty: 0,
          total_qty: 4,
          divide_by: 1,
          sheet_qty: 4,
          unit_cost: 8800,
          notes: 'Супер хавтасны CTP хэвлэлийн хавтан (4+0)',
          is_cover: false
        },
        {
          material_name: 'CTP хавтан (Дотор)',
          size: 'A2',
          print_size: 'A2',
          press_sheet: '20',
          base_qty: 40,
          extra_qty: 0,
          total_qty: 40,
          divide_by: 1,
          sheet_qty: 40,
          unit_cost: 8800,
          notes: 'Дотор хуудасны CTP хэвлэлийн хавтан (1+1, 20 х.х)',
          is_cover: false
        }
      ],
      operations: [
        { operation_name: 'Хэвлэх (4 өнгө)', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Хавтас хэвлэх' },
        { operation_name: 'Хэвлэх (1 өнгө)', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'PRINTING', is_manual: false, notes: 'Дотор хэвлэх' },
        { operation_name: 'Нугалаа', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Нугалаа' },
        { operation_name: 'Цуглуулга', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Цуглуулга' },
        { operation_name: 'Шалгах', qty: 20000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Шалгах' },
        { operation_name: 'Блокон оёо', qty: 10000, unit_cost: 100, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Оёо' },
        { operation_name: 'Наалт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: 'Наалт' },
        { operation_name: 'Огтлоо (Гурван талт)', qty: 2, unit_cost: 0, is_pricing: false, production_stage: 'POST_PRESS', is_manual: false, notes: '3 тал огтлох' },
        { operation_name: 'Супер хавтас хийх', qty: 1000, unit_cost: 1000, is_pricing: true, production_stage: 'POST_PRESS', is_manual: false, notes: 'Өмсгөх' },
        { operation_name: 'Чанарын эцсийн хяналт', qty: 1000, unit_cost: 0, is_pricing: false, production_stage: 'PACKAGING', is_manual: false, notes: 'Эцсийн шалгалт' }
      ],
      specifications: {
        cover_color: '4+0',
        inner_color: '1+1',
        total_pages: 160
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
