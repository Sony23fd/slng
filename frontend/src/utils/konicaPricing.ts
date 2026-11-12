/**
 * SelengePress ERP - Quick Print (Түргэн хэвлэл) Pricing Tariff
 *
 * Энэхүү тарифын сан нь SelengePress-ийн Konica Minolta дижитал түргэн хэвлэлийн
 * батлагдсан албан ёсны үнийн хүснэгтийн ("ТҮРГЭН ХЭВЛЭЛ ҮНИЙН САНАЛ") дагуу бодогдоно:
 * 1. Хэвлэлийн үнэ (1-200 ш): Өнгөт /A4/, Өнгөт /A3/ (105гр - 300гр, 1 ба 2 тал)
 * 2. Хуудастай хэвлэлийн үнэ (1-100 ш): Өнгөт /A4/ (105гр - 300гр, 1 ба 2 тал)
 * 3. Албан бланк (100 гр): A5 (330₮), A4 (440₮)
 * 4. Нэрийн хуудас: 300 гр матт цаас (330₮/440₮), Арт цаас (550₮/660₮), Лактай (880₮), Булан дугуйлах (+50₮)
 * 5. Хар ном (Номын гөлгөр шар 80 гр): A5, A4, A3 (1 тал ба 2 тал)
 */

export type KonicaSubtype = 
  | 'PRINT_SHEET'       // Хэвлэлийн үнэ (1-200 ш)
  | 'PRINT_MULTI_PAGE'  // Хуудастай хэвлэлийн үнэ (1-100 ш)
  | 'OFFICIAL_BLANK'    // Албан бланк (100 гр)
  | 'BUSINESS_CARD'     // Нэрийн хуудас
  | 'BLACK_BOOK';       // Хар ном (Номын гөлгөр шар 80 гр)

export interface KonicaTariffQuery {
  subtype: KonicaSubtype;
  size?: string;              // 'A4', 'A3', 'A5' эсвэл 'А3 (8 гарах)' гэх мэт
  grammage?: number;          // 105, 128, 157, 200, 250, 300 (эсвэл 80, 100)
  sides?: 1 | 2;              // 1 тал эсвэл 2 тал
  totalPages?: number;        // Ном, хуудастай хэвлэлийн нийт нүүр
  paperType?: string;         // '300гр матт', 'Арт цаас', 'Лактай'
  roundedCorners?: boolean;   // Булан дугуйлах (+50₮)
  materialName?: string;      // Цаасны нэрнээс автоматаар грамм таних
}

export interface KonicaTariffResult {
  unitPrice: number;          // 1 бүтээгдэхүүний тарифт нэгж үнэ (₮)
  pricePerSheet: number;      // 1 хуудасны тарифт үнэ (₮)
  sheetCountPerCopy: number;  // 1 ширхэг бүтээгдэхүүнд орох хуудасны тоо
  description: string;        // Тооцооллын тайлбар (жишээ: "Konica A4 250гр 2 тал (2,300 ₮)")
  matchedGrammage: number;    // Таарсан грамм
  matchedSize: string;        // Таарсан хэмжээ
  matchedSides: 1 | 2;        // Таарсан тал
}

// 1. Хэвлэлийн үнэ (1-200 ш) - Хэмжээ ба Грамм тус бүрээр
export const KONICA_SHEET_RATES: Record<'A4' | 'A3', Record<number, { side1: number; side2: number }>> = {
  A4: {
    105: { side1: 750,  side2: 1500 },
    128: { side1: 800,  side2: 1600 },
    157: { side1: 1000, side2: 2000 },
    200: { side1: 1100, side2: 2200 },
    250: { side1: 1150, side2: 2300 },
    300: { side1: 1250, side2: 2500 }
  },
  A3: {
    105: { side1: 1500, side2: 3000 },
    128: { side1: 1600, side2: 3200 },
    157: { side1: 2000, side2: 4000 },
    200: { side1: 2200, side2: 4400 },
    250: { side1: 2350, side2: 4700 },
    300: { side1: 2500, side2: 5000 }
  }
};

// 2. Хуудастай хэвлэлийн үнэ (1-100 ш, A4 нэг хуудсаар)
export const KONICA_MULTI_PAGE_A4_RATES: Record<number, { side1: number; side2: number }> = {
  105: { side1: 420, side2: 600 },
  128: { side1: 430, side2: 620 },
  157: { side1: 450, side2: 630 },
  200: { side1: 480, side2: 650 },
  250: { side1: 520, side2: 680 },
  300: { side1: 550, side2: 720 }
};

// 3. Албан бланк (100 гр)
export const KONICA_BLANK_RATES: Record<'A5' | 'A4', number> = {
  A5: 330,
  A4: 440
};

// 4. Нэрийн хуудас
export const KONICA_BUSINESS_CARD_RATES = {
  matt300: { side1: 330, side2: 440, name: '300 гр матт цаас' },
  art:     { side1: 550, side2: 660, name: 'Арт цаас' },
  uv:      { side1: 880, side2: 880, name: 'Лактай' },
  roundedCornerAddon: 50
};

// 5. Хар ном (Номын гөлгөр шар 80 гр)
export const KONICA_BLACK_BOOK_RATES: Record<'A5' | 'A4' | 'A3', { side1: number; side2: number }> = {
  A5: { side1: 150, side2: 300 },
  A4: { side1: 200, side2: 400 },
  A3: { side1: 300, side2: 600 }
};

/**
 * Материалын нэр болон параметрээс цаасны граммыг автоматаар ялган авах
 */
export function parseGrammage(text?: string, fallback: number = 250): number {
  if (!text) return fallback;
  const match = text.match(/(\d{2,3})\s*(?:гр|г|g|gsm)/i);
  if (match) {
    const g = parseInt(match[1], 10);
    // Боломжит хамгийн ойр тарифын граммд тохируулах: 105, 128, 157, 200, 250, 300
    const available = [105, 128, 157, 200, 250, 300];
    const closest = available.reduce((prev, curr) => 
      Math.abs(curr - g) < Math.abs(prev - g) ? curr : prev
    );
    return closest;
  }
  return fallback;
}

/**
 * Хэмжээний нэрнээс A3 / A4 / A5 стандартыг таних
 */
export function normalizeKonicaSize(sizeStr?: string): 'A3' | 'A4' | 'A5' {
  if (!sizeStr) return 'A3';
  const s = sizeStr.toUpperCase();
  if (s.includes('A5') || s.includes('А5')) return 'A5';
  if (s.includes('A4') || s.includes('А4')) return 'A4';
  if (s.includes('A3') || s.includes('А3') || s.includes('480') || s.includes('320')) return 'A3';
  return 'A4';
}

/**
 * Өнгөний бичиглэлээс 1 тал уу эсвэл 2 тал уу гэдгийг тодорхойлох
 * E.g., '4+0' -> 1 тал, '4+4' -> 2 тал, '1+0' -> 1 тал, '1+1' -> 2 тал
 */
export function parseSidesFromColor(colorStr?: string): 1 | 2 {
  if (!colorStr) return 1;
  const match = colorStr.match(/(\d+)\s*\+\s*(\d+)/);
  if (match) {
    const back = parseInt(match[2], 10);
    return back > 0 ? 2 : 1;
  }
  const s = colorStr.toLowerCase();
  if (s.includes('2 тал') || s.includes('хоёр тал')) return 2;
  return 1;
}

/**
 * Konica Minolta үнийн тариф бодох үндсэн функц
 */
export function getKonicaTariff(query: KonicaTariffQuery): KonicaTariffResult {
  const { subtype, size, totalPages = 1, roundedCorners = false } = query;

  // 1. Тал тодорхойлох (1 тал эсвэл 2 тал)
  const sides: 1 | 2 = query.sides || 1;

  // 2. Хэмжээг нормалчлах
  const normSize = normalizeKonicaSize(size);

  // 3. Грамм тодорхойлох
  const grammage = query.grammage || parseGrammage(query.materialName, subtype === 'OFFICIAL_BLANK' ? 100 : (subtype === 'BLACK_BOOK' ? 80 : 250));

  // --- Дэд төрөл 1: Албан бланк (100 гр) ---
  if (subtype === 'OFFICIAL_BLANK') {
    const blankSize: 'A5' | 'A4' = normSize === 'A5' ? 'A5' : 'A4';
    const unitPrice = KONICA_BLANK_RATES[blankSize];
    return {
      unitPrice,
      pricePerSheet: unitPrice,
      sheetCountPerCopy: 1,
      description: `Албан бланк (100 гр, ${blankSize}) - ${unitPrice.toLocaleString()} ₮`,
      matchedGrammage: 100,
      matchedSize: blankSize,
      matchedSides: 1
    };
  }

  // --- Дэд төрөл 2: Нэрийн хуудас ---
  if (subtype === 'BUSINESS_CARD') {
    const matName = (query.paperType || query.materialName || '').toLowerCase();
    let cardType: 'matt300' | 'art' | 'uv' = 'matt300';
    if (matName.includes('лак') || matName.includes('uv')) {
      cardType = 'uv';
    } else if (matName.includes('арт') || matName.includes('art') || matName.includes('шаргал') || matName.includes('мөнгөлөг')) {
      cardType = 'art';
    }

    const rates = KONICA_BUSINESS_CARD_RATES[cardType];
    const baseCardPrice = sides === 2 ? rates.side2 : rates.side1;
    const cornerAddon = roundedCorners ? KONICA_BUSINESS_CARD_RATES.roundedCornerAddon : 0;
    const unitPrice = baseCardPrice + cornerAddon;

    const cornerDesc = roundedCorners ? ' + Булан дугуйлах (50₮)' : '';
    return {
      unitPrice,
      pricePerSheet: unitPrice,
      sheetCountPerCopy: 1,
      description: `Нэрийн хуудас [${rates.name}, ${sides} тал${cornerDesc}] - ${unitPrice.toLocaleString()} ₮`,
      matchedGrammage: 300,
      matchedSize: 'Нэрийн хуудас (90х50)',
      matchedSides: sides
    };
  }

  // --- Дэд төрөл 3: Хар ном (Номын гөлгөр шар 80 гр) ---
  if (subtype === 'BLACK_BOOK') {
    const bookSize: 'A5' | 'A4' | 'A3' = normSize === 'A3' ? 'A3' : (normSize === 'A5' ? 'A5' : 'A4');
    const bookRates = KONICA_BLACK_BOOK_RATES[bookSize];
    const pricePerSheet = sides === 2 ? bookRates.side2 : bookRates.side1;

    // Хэрэв хуудастай ном бол: 2 тал үед 1 хуудсанд 2 нүүр багтана
    const pages = Math.max(1, totalPages);
    const sheetCount = sides === 2 ? Math.ceil(pages / 2) : pages;
    const unitPrice = sheetCount * pricePerSheet;

    return {
      unitPrice,
      pricePerSheet,
      sheetCountPerCopy: sheetCount,
      description: `Хар ном [Номын гөлгөр шар 80 гр, ${bookSize}, ${sides} тал, ${sheetCount} хуудас × ${pricePerSheet}₮] - ${unitPrice.toLocaleString()} ₮`,
      matchedGrammage: 80,
      matchedSize: bookSize,
      matchedSides: sides
    };
  }

  // --- Дэд төрөл 4: Хуудастай хэвлэлийн үнэ (1-100 ш) ---
  if (subtype === 'PRINT_MULTI_PAGE') {
    const available = [105, 128, 157, 200, 250, 300];
    const closestGram = available.reduce((prev, curr) => 
      Math.abs(curr - grammage) < Math.abs(prev - grammage) ? curr : prev
    );
    const multiRates = KONICA_MULTI_PAGE_A4_RATES[closestGram] || KONICA_MULTI_PAGE_A4_RATES[250];
    const pricePerSheet = sides === 2 ? multiRates.side2 : multiRates.side1;

    const pages = Math.max(1, totalPages);
    const sheetCount = sides === 2 ? Math.ceil(pages / 2) : pages;
    const unitPrice = sheetCount * pricePerSheet;

    return {
      unitPrice,
      pricePerSheet,
      sheetCountPerCopy: sheetCount,
      description: `Хуудастай хэвлэлийн үнэ /Өнгөт A4/ (${closestGram} гр, ${sides} тал, ${sheetCount} хуудас × ${pricePerSheet}₮) - ${unitPrice.toLocaleString()} ₮`,
      matchedGrammage: closestGram,
      matchedSize: 'A4',
      matchedSides: sides
    };
  }

  // --- Дэд төрөл 5: Хэвлэлийн үнэ (1-200 ш) ---
  const sheetSize: 'A4' | 'A3' = normSize === 'A3' ? 'A3' : 'A4';
  const sizeMap = KONICA_SHEET_RATES[sheetSize];
  const availableGrams = [105, 128, 157, 200, 250, 300];
  const matchedGram = availableGrams.reduce((prev, curr) => 
    Math.abs(curr - grammage) < Math.abs(prev - grammage) ? curr : prev
  );
  const rateItem = sizeMap[matchedGram] || sizeMap[250];
  const unitPrice = sides === 2 ? rateItem.side2 : rateItem.side1;

  return {
    unitPrice,
    pricePerSheet: unitPrice,
    sheetCountPerCopy: 1,
    description: `Хэвлэлийн үнэ /Өнгөт ${sheetSize}/ (${matchedGram} гр, ${sides} тал) - ${unitPrice.toLocaleString()} ₮`,
    matchedGrammage: matchedGram,
    matchedSize: sheetSize,
    matchedSides: sides
  };
}

