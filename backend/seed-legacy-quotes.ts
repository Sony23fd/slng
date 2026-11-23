import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LegacyMaterial {
  material_name: string;
  size?: string;
  print_size?: string;
  press_sheet?: string;
  base_qty?: number;
  extra_qty?: number;
  total_qty: number;
  divide_by: number;
  sheet_qty: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  is_cover?: boolean;
}

interface LegacyOperation {
  operation_name: string;
  qty: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  production_stage?: string;
}

interface LegacyQuote {
  order_number: string;
  customer_name: string;
  phone?: string;
  product_name: string;
  category: string;
  total_qty: number;
  size: string;
  cover_color?: string;
  inner_color?: string;
  total_pages?: number;
  profit_margin: number;
  has_vat: boolean;
  legacy_total_cost: number;
  legacy_unit_cost: number;
  legacy_unit_price: number;
  final_price: number;
  notes?: string;
  materials: LegacyMaterial[];
  operations: LegacyOperation[];
}

const LEGACY_QUOTES: LegacyQuote[] = [
  // 1. SP2301414
  {
    order_number: 'SP2301414',
    customer_name: 'KRC',
    product_name: 'Цэцэрлэгийн багшийн гарын авлага',
    category: 'Ном өнгөт',
    total_qty: 2000,
    size: 'B5',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 80,
    profit_margin: 1.84,
    has_vat: false,
    legacy_total_cost: 4880245,
    legacy_unit_cost: 2440.12,
    legacy_unit_price: 4500,
    final_price: 9000000,
    materials: [
      { material_name: 'Матт 250 гр/м2, Hansol paper', size: '900x1200', print_size: 'B3', press_sheet: '1.00', base_qty: 1000, extra_qty: 100, total_qty: 1100, divide_by: 5, sheet_qty: 220, unit_cost: 1400, total_cost: 308000, is_cover: true },
      { material_name: 'Матт 157 гр/м2, Hansol paper', size: '900x1200', print_size: 'B2', press_sheet: '5.00', base_qty: 5000, extra_qty: 500, total_qty: 5500, divide_by: 2, sheet_qty: 2750, unit_cost: 940, total_cost: 2585000 },
      { material_name: 'Бүрэлт матт Хятад, 36 см', size: '36 см', total_qty: 0, divide_by: 1, sheet_qty: 8.8, unit_cost: 8976, total_cost: 78988.8 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 44, unit_cost: 8800, total_cost: 387200 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 6000, unit_cost: 16.73, total_cost: 100380, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 6000, unit_cost: 0.92, total_cost: 5520, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 5000, unit_cost: 0.92, total_cost: 4600, production_stage: 'POST_PRESS' },
      { operation_name: 'Цуглуулга', qty: 5000, unit_cost: 0.65, total_cost: 3250, production_stage: 'POST_PRESS' },
      { operation_name: 'Наалт-1 HORIZON BQ-470', qty: 2000, unit_cost: 26.17, total_cost: 52340, production_stage: 'POST_PRESS' },
      { operation_name: 'Огтлоо-3 талт 75В', qty: 2000, unit_cost: 1.83, total_cost: 3660, production_stage: 'POST_PRESS' },
    ],
  },

  // 2. SP2600922
  {
    order_number: 'SP2600922',
    customer_name: 'Ц.Оюунгэрэл',
    product_name: 'Ногоон нүдэн лам',
    category: 'Ном хар',
    total_qty: 1000,
    size: 'B5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 544,
    profit_margin: 1.82,
    has_vat: false,
    legacy_total_cost: 7238008,
    legacy_unit_cost: 7238.01,
    legacy_unit_price: 13200,
    final_price: 13200000,
    materials: [
      { material_name: 'Матт 250 гр/м2, Hansol paper', size: '900x1200', print_size: 'B3', press_sheet: '1.00', base_qty: 500, extra_qty: 100, total_qty: 600, divide_by: 5, sheet_qty: 120, unit_cost: 1400, total_cost: 168000, is_cover: true },
      { material_name: 'Офсет цагаан 70 гр/м2, Хансол', size: '900x1200', print_size: 'B2', press_sheet: '17.00', base_qty: 8500, extra_qty: 680, total_qty: 9180, divide_by: 2, sheet_qty: 4590, unit_cost: 460, total_cost: 2111400 },
      { material_name: 'Бүрэлт матт Хятад, 36 см', size: '36 см', total_qty: 0, divide_by: 1, sheet_qty: 4.8, unit_cost: 8976, total_cost: 43084.8 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 4, unit_cost: 8800, total_cost: 35200 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 34, unit_cost: 8800, total_cost: 299200 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 500, unit_cost: 16.73, total_cost: 8365, production_stage: 'PRINT' },
      { operation_name: 'Хэвлэгч -1 өнгө RYOBI -680', qty: 17000, unit_cost: 4.15, total_cost: 70550, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 9000, unit_cost: 0.92, total_cost: 8280, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 17000, unit_cost: 0.92, total_cost: 15640, production_stage: 'POST_PRESS' },
      { operation_name: 'Цуглуулга', qty: 17000, unit_cost: 0.65, total_cost: 11050, production_stage: 'POST_PRESS' },
      { operation_name: 'Наалт-1 HORIZON BQ-470', qty: 1000, unit_cost: 26.17, total_cost: 26170, production_stage: 'POST_PRESS' },
      { operation_name: 'Огтлоо-3 талт 75В', qty: 1000, unit_cost: 1.83, total_cost: 1830, production_stage: 'POST_PRESS' },
    ],
  },

  // 3. SP2600934
  {
    order_number: 'SP2600934',
    customer_name: 'Орхон цагдаа',
    product_name: 'Ойн ном',
    category: 'Ном өнгөт',
    total_qty: 500,
    size: 'A4',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 400,
    profit_margin: 2.09,
    has_vat: false,
    legacy_total_cost: 11990080,
    legacy_unit_cost: 23980.16,
    legacy_unit_price: 50000,
    final_price: 25000000,
    materials: [
      { material_name: 'Матт 157 гр/м2, Hansol paper', size: '900x1200', print_size: 'B3', press_sheet: '1.00', base_qty: 500, extra_qty: 100, total_qty: 600, divide_by: 5, sheet_qty: 120, unit_cost: 940, total_cost: 112800, is_cover: true },
      { material_name: 'Матт 157 гр/м2, Hansol paper', size: '900x1200', print_size: 'A2', press_sheet: '25.00', base_qty: 12500, extra_qty: 1000, total_qty: 13500, divide_by: 4, sheet_qty: 3375, unit_cost: 940, total_cost: 3172500 },
      { material_name: 'Картон цаас 2 мм Хятад', size: '800x1100', total_qty: 0, divide_by: 1, sheet_qty: 72, unit_cost: 2600, total_cost: 187200 },
      { material_name: 'Шохойтой 157 гр/м2, Hansol paper', size: '900x1200', print_size: 'A3', press_sheet: '1.00', base_qty: 500, extra_qty: 40, total_qty: 540, divide_by: 8, sheet_qty: 68, unit_cost: 940, total_cost: 63920 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 104, unit_cost: 8800, total_cost: 915200 },
      { material_name: 'Бүрэлт матт Хятад, 44 см', size: '44 см', total_qty: 0, divide_by: 1, sheet_qty: 3.6, unit_cost: 8976, total_cost: 32313.6 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 13000, unit_cost: 16.73, total_cost: 217490, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 13000, unit_cost: 0.92, total_cost: 11960, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 12500, unit_cost: 0.92, total_cost: 11500, production_stage: 'POST_PRESS' },
      { operation_name: 'Огтлоо-3 талт 75В', qty: 500, unit_cost: 1.83, total_cost: 915, production_stage: 'POST_PRESS' },
      { operation_name: 'Хатуу хавтас хийх-1 HONGMING', qty: 500, unit_cost: 16.14, total_cost: 8070, production_stage: 'POST_PRESS' },
      { operation_name: 'Хатуу хавтас бэлтгэх-1 HONGMING', qty: 500, unit_cost: 6.78, total_cost: 3390, production_stage: 'POST_PRESS' },
      { operation_name: 'Утас оёо ASTER', qty: 12500, unit_cost: 5.76, total_cost: 72000, production_stage: 'POST_PRESS' },
      { operation_name: 'Цуглуулга', qty: 12500, unit_cost: 0.65, total_cost: 8125, production_stage: 'POST_PRESS' },
    ],
  },

  // 4. SP2600962
  {
    order_number: 'SP2600962',
    customer_name: 'Бат-Очир',
    product_name: 'Лимбэний суралцах ном',
    category: 'Ном хар',
    total_qty: 500,
    size: 'A4',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 140,
    profit_margin: 1.73,
    has_vat: false,
    legacy_total_cost: 1968010.5,
    legacy_unit_cost: 3936.02,
    legacy_unit_price: 6800,
    final_price: 3400000,
    materials: [
      { material_name: 'Матт 250 гр/м2, Hansol paper', size: '900x1200', print_size: 'A3', press_sheet: '1.00', base_qty: 500, extra_qty: 100, total_qty: 600, divide_by: 6, sheet_qty: 100, unit_cost: 1400, total_cost: 140000, is_cover: true },
      { material_name: 'Офсет цагаан 80 гр/м2, APP-Gold', size: '900x1200', print_size: 'A2', press_sheet: '9.00', base_qty: 4500, extra_qty: 450, total_qty: 4950, divide_by: 4, sheet_qty: 1238, unit_cost: 540, total_cost: 668520 },
      { material_name: 'Бүрэлт матт Хятад, 44 см', size: '44 см', total_qty: 0, divide_by: 1, sheet_qty: 3.6, unit_cost: 8976, total_cost: 32313.6 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 4, unit_cost: 8800, total_cost: 35200 },
      { material_name: 'CTP хавтан Хятад, 65*55', size: '65*55', total_qty: 0, divide_by: 1, sheet_qty: 18, unit_cost: 6800, total_cost: 122400 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 500, unit_cost: 16.73, total_cost: 8365, production_stage: 'PRINT' },
      { operation_name: 'Хэвлэгч -1 өнгө RYOBI -680', qty: 4500, unit_cost: 4.15, total_cost: 18675, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 5000, unit_cost: 0.92, total_cost: 4600, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 4500, unit_cost: 0.92, total_cost: 4140, production_stage: 'POST_PRESS' },
      { operation_name: 'Цуглуулга', qty: 4500, unit_cost: 0.65, total_cost: 2925, production_stage: 'POST_PRESS' },
      { operation_name: 'Наалт-1 HORIZON BQ-470', qty: 500, unit_cost: 26.17, total_cost: 13085, production_stage: 'POST_PRESS' },
      { operation_name: 'Огтлоо-3 талт 75В', qty: 500, unit_cost: 1.83, total_cost: 915, production_stage: 'POST_PRESS' },
    ],
  },

  // 5. SP2600972
  {
    order_number: 'SP2600972',
    customer_name: 'Сүмбэр цамхаг ХХК',
    product_name: 'Цаасан тор',
    category: 'Тор',
    total_qty: 500,
    size: '300x240x100',
    cover_color: '4+0',
    profit_margin: 2.91,
    has_vat: false,
    legacy_total_cost: 1000475,
    legacy_unit_cost: 2000.95,
    legacy_unit_price: 5830,
    final_price: 2915000,
    materials: [
      { material_name: 'Шохойтой 210 гр/м2, Hansol paper', size: '700x1000', print_size: 'B2', press_sheet: '1.00', base_qty: 500, extra_qty: 100, total_qty: 600, divide_by: 2, sheet_qty: 300, unit_cost: 1200, total_cost: 360000, is_cover: true },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 4, unit_cost: 8800, total_cost: 35200 },
      { material_name: 'Бүрэлт матт Хятад, 54 см', size: '54 см', total_qty: 0, divide_by: 1, sheet_qty: 4.2, unit_cost: 8976, total_cost: 37699.2 },
      { material_name: 'Торны картон 350 гр/м2, Хансол', size: '700x1000', total_qty: 0, divide_by: 1, sheet_qty: 30, unit_cost: 650, total_cost: 19500 },
      { material_name: 'Торны оосор PP 40 см Хятад', size: '40 см', total_qty: 0, divide_by: 1, sheet_qty: 1000, unit_cost: 70, total_cost: 70000 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 500, unit_cost: 16.73, total_cost: 8365, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 500, unit_cost: 0.92, total_cost: 460, production_stage: 'PRINT' },
      { operation_name: 'Тор наах гар ажиллагаа', qty: 500, unit_cost: 150, total_cost: 75000, production_stage: 'POST_PRESS' },
      { operation_name: 'Оосор сүвлэх гар ажиллагаа', qty: 500, unit_cost: 60, total_cost: 30000, production_stage: 'POST_PRESS' },
      { operation_name: 'Огтлоо дунд', qty: 500, unit_cost: 1.52, total_cost: 760, production_stage: 'POST_PRESS' },
    ],
  },

  // 6. SP2600992
  {
    order_number: 'SP2600992',
    customer_name: 'Ховд Буянт сум',
    product_name: 'Ойн ном',
    category: 'Ном өнгөт',
    total_qty: 1500,
    size: '175x250',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 592,
    profit_margin: 2.39,
    has_vat: false,
    legacy_total_cost: 20010855.5,
    legacy_unit_cost: 13340.57,
    legacy_unit_price: 31900,
    final_price: 47850000,
    materials: [
      { material_name: 'Матт 250 гр/м2, Hansol paper', size: '900x1200', print_size: 'B3', press_sheet: '1.00', base_qty: 750, extra_qty: 100, total_qty: 850, divide_by: 5, sheet_qty: 170, unit_cost: 1400, total_cost: 238000, is_cover: true },
      { material_name: 'Матт 128 гр/м2, Hansol paper', size: '740x1040', print_size: 'B2', press_sheet: '19.00', base_qty: 28500, extra_qty: 1520, total_qty: 30020, divide_by: 2, sheet_qty: 15010, unit_cost: 770, total_cost: 11557700 },
      { material_name: 'Бүрэлт матт Хятад, 36 см', size: '36 см', total_qty: 0, divide_by: 1, sheet_qty: 6.8, unit_cost: 8976, total_cost: 61036.8 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 156, unit_cost: 8800, total_cost: 1372800 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 29250, unit_cost: 16.73, total_cost: 489352.5, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 29250, unit_cost: 0.92, total_cost: 26910, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 28500, unit_cost: 0.92, total_cost: 26220, production_stage: 'POST_PRESS' },
      { operation_name: 'Цуглуулга', qty: 28500, unit_cost: 0.65, total_cost: 18525, production_stage: 'POST_PRESS' },
      { operation_name: 'Утас оёо ASTER', qty: 28500, unit_cost: 5.76, total_cost: 164160, production_stage: 'POST_PRESS' },
      { operation_name: 'Наалт-1 HORIZON BQ-470', qty: 1500, unit_cost: 26.17, total_cost: 39255, production_stage: 'POST_PRESS' },
      { operation_name: 'Огтлоо-3 талт 75В', qty: 1500, unit_cost: 1.83, total_cost: 2745, production_stage: 'POST_PRESS' },
    ],
  },

  // 7. SP2600997
  {
    order_number: 'SP2600997',
    customer_name: 'Да винчи Италиан скул',
    product_name: 'Дэвтэр',
    category: 'Дэвтэр',
    total_qty: 300,
    size: 'A5',
    cover_color: '4+0',
    inner_color: '1+1',
    total_pages: 100,
    profit_margin: 2.75,
    has_vat: true,
    legacy_total_cost: 647778,
    legacy_unit_cost: 2159.26,
    legacy_unit_price: 6600,
    final_price: 1980000,
    materials: [
      { material_name: 'Офсет цагаан 100 гр/м2, Hansol paper', size: '900x1200', print_size: 'A2', press_sheet: '6.00', base_qty: 300, extra_qty: 60, total_qty: 2160, divide_by: 4, sheet_qty: 540, unit_cost: 675, total_cost: 364500 },
      { material_name: 'Офсет цагаан 100 гр/м2, Hansol paper', size: '900x1200', print_size: 'A2', press_sheet: '1.00', base_qty: 75, extra_qty: 55, total_qty: 130, divide_by: 4, sheet_qty: 32, unit_cost: 675, total_cost: 21600 },
      { material_name: 'Матт 300 гр/м2, Hansol paper', size: '900x1200', print_size: 'A2', press_sheet: '1.00', base_qty: 75, extra_qty: 100, total_qty: 175, divide_by: 4, sheet_qty: 44, unit_cost: 1800, total_cost: 79200, is_cover: true },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 4, unit_cost: 8800, total_cost: 35200 },
      { material_name: 'CTP хавтан Хятад, 65*55', size: '65*55', total_qty: 0, divide_by: 1, sheet_qty: 13, unit_cost: 6800, total_cost: 88400 },
      { material_name: 'Бүрэлт матт Хятад, 44 см', size: '44 см', total_qty: 0, divide_by: 1, sheet_qty: 0.58, unit_cost: 12150, total_cost: 7046 },
      { material_name: 'Нуруу Хятад, 3/8', size: '3/8', total_qty: 0, divide_by: 1, sheet_qty: 7200, unit_cost: 5, total_cost: 36000 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч -1 өнгө RYOBI -680', qty: 1875, unit_cost: 4.15, total_cost: 7782, production_stage: 'PRINT' },
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 75, unit_cost: 16.73, total_cost: 1255, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 1875, unit_cost: 0.92, total_cost: 1725, production_stage: 'PRINT' },
      { operation_name: 'Огтлоо дунд', qty: 1875, unit_cost: 1.52, total_cost: 2850, production_stage: 'POST_PRESS' },
      { operation_name: 'Сприаль дарагч', qty: 300, unit_cost: 7.4, total_cost: 2220, production_stage: 'POST_PRESS' },
    ],
  },

  // 8. SP2600998
  {
    order_number: 'SP2600998',
    customer_name: 'Мөнх-Эрдэнэ',
    phone: '88992238',
    product_name: 'журнал',
    category: 'Түргэн хэвлэл KONICA',
    total_qty: 1,
    size: 'A4',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 168,
    profit_margin: 6.61,
    has_vat: false,
    legacy_total_cost: 4001.52,
    legacy_unit_cost: 4001.52,
    legacy_unit_price: 26450,
    final_price: 26450,
    materials: [
      { material_name: 'Дабль А 80гр, Дабль А, 210х297', size: '210x297', print_size: 'A2', press_sheet: '1.00', base_qty: 1, extra_qty: 1, total_qty: 2, divide_by: 8, sheet_qty: 200, unit_cost: 20, total_cost: 4000 },
    ],
    operations: [
      { operation_name: 'Огтлоо дунд', qty: 1, unit_cost: 1.52, total_cost: 1.52, production_stage: 'POST_PRESS' },
    ],
  },

  // 9. SP2600999
  {
    order_number: 'SP2600999',
    customer_name: 'Централ гарден',
    phone: '99115124',
    product_name: 'Брошур',
    category: 'Бусад',
    total_qty: 1000,
    size: '504x238',
    cover_color: '4+4',
    profit_margin: 2.89,
    has_vat: true,
    legacy_total_cost: 342445.2,
    legacy_unit_cost: 342.45,
    legacy_unit_price: 1100,
    final_price: 1100000,
    notes: 'Өнгө анхаарах',
    materials: [
      { material_name: 'Матт 157 гр/м2, Hansol paper', size: '900x1200', print_size: 'B3', press_sheet: '1.00', base_qty: 1000, extra_qty: 100, total_qty: 1100, divide_by: 5, sheet_qty: 220, unit_cost: 940, total_cost: 206800, is_cover: true },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 8, unit_cost: 8800, total_cost: 70400 },
      { material_name: 'Бүрэлт матт Хятад, 36 см', size: '36 см', total_qty: 0, divide_by: 1, sheet_qty: 5.2, unit_cost: 8976, total_cost: 46675.2, notes: '1 тал' },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 1000, unit_cost: 16.73, total_cost: 16730, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 1000, unit_cost: 0.92, total_cost: 920, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 1000, unit_cost: 0.92, total_cost: 920, production_stage: 'POST_PRESS' },
    ],
  },

  // 10. SP2601001
  {
    order_number: 'SP2601001',
    customer_name: 'Заяабилгээ ХХК',
    product_name: 'Брошур',
    category: 'Түргэн хэвлэл KONICA',
    total_qty: 300,
    size: '21x9см',
    cover_color: '4+4',
    profit_margin: 14.73,
    has_vat: true,
    legacy_total_cost: 10079,
    legacy_unit_cost: 33.6,
    legacy_unit_price: 550,
    final_price: 165000,
    materials: [
      { material_name: 'Матт 250 гр/м2, Hansol paper', size: '900x1200', print_size: 'A3', press_sheet: '1.00', base_qty: 50, extra_qty: 6, total_qty: 56, divide_by: 8, sheet_qty: 7, unit_cost: 1400, total_cost: 9800, is_cover: true },
    ],
    operations: [
      { operation_name: 'Огтлоо жижиг', qty: 300, unit_cost: 0.93, total_cost: 279, production_stage: 'POST_PRESS' },
    ],
  },

  // 11. SP2601003
  {
    order_number: 'SP2601003',
    customer_name: 'Мобинет',
    product_name: 'Нэрийн хуудас',
    category: 'Түргэн хэвлэл KONICA',
    total_qty: 800,
    size: '90x55',
    profit_margin: 19.72,
    has_vat: true,
    legacy_total_cost: 14057.28,
    legacy_unit_cost: 17.57,
    legacy_unit_price: 385,
    final_price: 308000,
    materials: [
      { material_name: 'Матт 300 гр/м2, Hansol paper', size: '900x1200', print_size: 'A3', press_sheet: '1.00', base_qty: 40, extra_qty: 8, total_qty: 48, divide_by: 8, sheet_qty: 6, unit_cost: 1800, total_cost: 10800, is_cover: true },
      { material_name: 'Бүрэлт матт Хятад, 36 см', size: '36 см', total_qty: 0, divide_by: 1, sheet_qty: 0.28, unit_cost: 8976, total_cost: 2513.28 },
    ],
    operations: [
      { operation_name: 'Огтлоо жижиг', qty: 800, unit_cost: 0.93, total_cost: 744, production_stage: 'POST_PRESS' },
    ],
  },

  // 12. SP2601004
  {
    order_number: 'SP2601004',
    customer_name: 'GRNasan',
    product_name: 'Инчон каталоги',
    category: 'Танилцуулга',
    total_qty: 1000,
    size: 'A5',
    cover_color: '4+0',
    inner_color: '4+4',
    total_pages: 20,
    profit_margin: 2.04,
    has_vat: true,
    legacy_total_cost: 726211.82,
    legacy_unit_cost: 726.21,
    legacy_unit_price: 1650,
    final_price: 1650000,
    materials: [
      { material_name: 'Шохойтой 250 гр/м2, Hansol paper', size: '900x1200', print_size: 'A2', press_sheet: '1.00', base_qty: 250, extra_qty: 100, total_qty: 350, divide_by: 4, sheet_qty: 88, unit_cost: 1400, total_cost: 123200, is_cover: true },
      { material_name: 'Бүрэлт гялгар Хятад, 36 см', size: '36 см', total_qty: 0, divide_by: 1, sheet_qty: 1.62, unit_cost: 6211, total_cost: 10061.82 },
      { material_name: 'Тусгай цаас 128 гр, Солонгос', size: 'A0', print_size: 'A2', press_sheet: '1.00', base_qty: 1000, extra_qty: 100, total_qty: 1100, divide_by: 4, sheet_qty: 275, unit_cost: 1300, total_cost: 357500 },
      { material_name: 'Тусгай цаас 128 гр, Солонгос', size: 'A0', print_size: 'A2', press_sheet: '1.00', base_qty: 125, extra_qty: 100, total_qty: 225, divide_by: 4, sheet_qty: 57, unit_cost: 1300, total_cost: 74100 },
      { material_name: 'CTP хавтан Хятад, 76*60.5', size: '76*60.5', total_qty: 0, divide_by: 1, sheet_qty: 16, unit_cost: 8800, total_cost: 140800 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч-4 өнгө КОМОРИ', qty: 1000, unit_cost: 16.73, total_cost: 16730, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 1000, unit_cost: 0.92, total_cost: 920, production_stage: 'PRINT' },
      { operation_name: 'Нугалаа-1 ZUH780A', qty: 1000, unit_cost: 0.92, total_cost: 920, production_stage: 'POST_PRESS' },
      { operation_name: 'Шугамын үдээний машин', qty: 1000, unit_cost: 1.98, total_cost: 1980, production_stage: 'POST_PRESS' },
    ],
  },

  // 13. SP2601005
  {
    order_number: 'SP2601005',
    customer_name: 'Анд паблишн',
    product_name: 'А6 кассын зарлага',
    category: 'Хортой маягт',
    total_qty: 1000,
    size: 'A6',
    cover_color: '1+0',
    profit_margin: 2.13,
    has_vat: false,
    legacy_total_cost: 46969.2,
    legacy_unit_cost: 46.97,
    legacy_unit_price: 100,
    final_price: 100000,
    materials: [
      { material_name: 'I өнгө 52гр/м2, APP-GHS, 900x1200', size: '900x1200', print_size: 'A2', press_sheet: '1.00', base_qty: 125, extra_qty: 45, total_qty: 170, divide_by: 4, sheet_qty: 42, unit_cost: 460, total_cost: 19320 },
      { material_name: 'III ягаан 55гр/м2, APP-GHS, 900x1200', size: '900x1200', print_size: 'A2', press_sheet: '1.00', base_qty: 125, extra_qty: 45, total_qty: 170, divide_by: 4, sheet_qty: 42, unit_cost: 460, total_cost: 19320 },
      { material_name: 'CTP хавтан Хятад, 65*55', size: '65*55', total_qty: 0, divide_by: 1, sheet_qty: 1, unit_cost: 6800, total_cost: 6800 },
    ],
    operations: [
      { operation_name: 'Хэвлэгч -1 өнгө RYOBI -680', qty: 250, unit_cost: 4.15, total_cost: 1037.5, production_stage: 'PRINT' },
      { operation_name: 'Шалгах', qty: 250, unit_cost: 0.92, total_cost: 230, production_stage: 'PRINT' },
      { operation_name: 'Наалт-1 HORIZON BQ-470', qty: 10, unit_cost: 26.17, total_cost: 261.7, production_stage: 'POST_PRESS' },
    ],
  },
];

async function main() {
  console.log('===============================================================');
  console.log('🔄 ЭХЛЭХ: Хуучин туршилтын бүх захиалга, үнийн саналуудыг устгаж байна...');
  console.log('===============================================================');

  const deleteCount = await prisma.order.deleteMany({});
  console.log(`✅ Амжилттай устгагдсан захиалгын тоо: ${deleteCount.count} ш`);

  console.log('\n===============================================================');
  console.log('📥 13 БОДИТ ҮНИЙН САНАЛЫГ СИСТЕМД 1:1 НАРИЙВЧЛАЛТАЙ СУУЛГАЖ БАЙНА...');
  console.log('===============================================================');

  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminId = adminUser ? adminUser.id : 1;

  const comparisonReport: any[] = [];

  for (const q of LEGACY_QUOTES) {
    // 1. Create Customer if not exists
    await prisma.customer.upsert({
      where: { name: q.customer_name },
      update: { phone: q.phone || undefined },
      create: {
        name: q.customer_name,
        phone: q.phone || '99110000',
        customer_type: 'Бизнесийн байгууллага',
      },
    });

    // 2. Calculate Materials Sum & Operations Sum
    const matSum = q.materials.reduce((acc, m) => acc + m.total_cost, 0);
    const opSum = q.operations.reduce((acc, o) => acc + o.total_cost, 0);
    const calculatedSum = matSum + opSum;
    const diff = q.legacy_total_cost - calculatedSum;

    // 3. Create Order
    const createdOrder = await prisma.order.create({
      data: {
        order_number: q.order_number,
        customer_name: q.customer_name,
        phone: q.phone || null,
        product_name: q.product_name,
        category: q.category,
        total_qty: q.total_qty,
        size: q.size,
        notes: q.notes || null,
        profit_margin: q.profit_margin,
        has_vat: q.has_vat,
        final_price: q.final_price,
        current_status: 'Үнийн санал',
        order_type: 'QUOTE',
        sales_person_id: adminId,
        sales_person_name: adminUser?.name || 'Админ',
        specifications: {
          create: {
            cover_color: q.cover_color || null,
            inner_color: q.inner_color || null,
            total_pages: q.total_pages || null,
            print_cost: diff > 0 ? diff : 0,
          },
        },
        materials: {
          create: q.materials.map(m => ({
            material_name: m.material_name,
            size: m.size || null,
            print_size: m.print_size || null,
            press_sheet: m.press_sheet || null,
            base_qty: m.base_qty || null,
            extra_qty: m.extra_qty || null,
            total_qty: m.total_qty,
            divide_by: m.divide_by,
            sheet_qty: m.sheet_qty,
            unit_cost: m.unit_cost,
            total_cost: m.total_cost,
            notes: m.notes || null,
            is_cover: m.is_cover || false,
          })),
        },
        operations: {
          create: q.operations.map(o => ({
            operation_name: o.operation_name,
            qty: o.qty,
            unit_cost: o.unit_cost,
            total_cost: o.total_cost,
            notes: o.notes || null,
            production_stage: o.production_stage || 'POST_PRESS',
            is_pricing: true,
          })),
        },
      },
    });

    comparisonReport.push({
      order_number: q.order_number,
      customer: q.customer_name,
      product: q.product_name,
      category: q.category,
      qty: q.total_qty,
      mat_cost: matSum,
      op_cost: opSum,
      sum_cost: calculatedSum,
      legacy_cost: q.legacy_total_cost,
      diff: diff,
      is_exact_match: Math.abs(diff) < 1,
      final_price: q.final_price,
    });

    console.log(` -> Үүсгэлээ: [${q.order_number}] ${q.customer_name} - ${q.product_name} (${q.total_qty}ш)`);
  }

  console.log('\n===============================================================');
  console.log('📊 ТООЦООЛЛЫН ТУЛГАЛТЫН НЭГДСЭН АУДИТ ТАЙЛАН');
  console.log('===============================================================');
  console.table(comparisonReport.map(r => ({
    'Захиалга': r.order_number,
    'Бүтээгдэхүүн': r.product.substring(0, 18),
    'Тоо': r.qty,
    'Материал (₮)': Math.round(r.mat_cost).toLocaleString(),
    'Ажиллагаа (₮)': Math.round(r.op_cost).toLocaleString(),
    'Нийлбэр (₮)': Math.round(r.sum_cost).toLocaleString(),
    'Хуучин Өртөг (₮)': Math.round(r.legacy_cost).toLocaleString(),
    'Зөрүү (₮)': Math.round(r.diff).toLocaleString(),
    'Нийцэл': r.is_exact_match ? '100% ТЭНЦҮҮ' : 'Үйлдвэрийн нэмэгдэлтэй',
  })));

  console.log('\n✅ 13 Үнийн санал амжилттай бүрэн үүслээ!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
