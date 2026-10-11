export function parseMaterial(itemName: string) {
  if (!itemName) return { baseName: '', sizeName: '' };

  // Legacy coating names fallback
  const cleanItem = itemName.trim().replace(/\s+/g, ' ');
  if (cleanItem === 'Бүрэлт (Гялгар)') {
    return { baseName: 'Бүрэлт гялгар Хятад', sizeName: '' };
  }
  if (cleanItem === 'Бүрэлт (Матт)') {
    return { baseName: 'Бүрэлт матт Хятад', sizeName: '' };
  }

  // Coating materials breakdown (e.g., "Бүрэлт матт Хятад 44 см", "Бүрэлт Илгэн Со 44 см", "Бүрэлт матт/эмбосстой Со 36см")
  const coatingMatch = cleanItem.match(/^(Бүрэлт.*?)\s*(\d{2})\s*(?:см|cm)?$/i);
  if (coatingMatch) {
    let base = coatingMatch[1].trim().replace(/\s+/g, ' ');
    const lower = base.toLowerCase();
    if (lower.includes('илгэн')) {
      base = 'Бүрэлт Илгэн Со';
    } else if (lower.includes('гялгар') && lower.includes('хятад')) {
      base = 'Бүрэлт гялгар Хятад';
    } else if (lower.includes('матт') && lower.includes('хятад')) {
      base = 'Бүрэлт матт Хятад';
    } else if (lower.includes('гялгар') && lower.includes('эмбосс')) {
      base = 'Бүрэлт гялгар/эмбосстой Со';
    } else if (lower.includes('матт') && lower.includes('эмбосс')) {
      base = 'Бүрэлт матт/эмбосстой Со';
    }
    return {
      baseName: base,
      sizeName: `${coatingMatch[2]} см`
    };
  }

  if (cleanItem.toLowerCase().includes('бүрэлт') && cleanItem.toLowerCase().includes('илгэн')) {
    return { baseName: 'Бүрэлт Илгэн Со', sizeName: '' };
  }

  if (cleanItem.toLowerCase().includes('лидерин')) {
    return { baseName: cleanItem, sizeName: '' };
  }

  // Custom parsing rules based on known item_name formats
  const match = itemName.match(/^(.*?)\s+((?:\d+(?:\.\d+)?(?:гр|кг)|[AB][0-4]o?|\d+(?:\.\d+)?\s+[AB][0-4]|\d+\s*(?:x|\*)\s*\d+|250).*)$/i);
  
  if (match) {
    return { baseName: match[1].trim(), sizeName: match[2].trim() };
  }
  
  // Fallback
  return { baseName: itemName.trim(), sizeName: '' };
}

export function extractSheetSize(name: string): string {
  if (!name) return '';
  const clean = name.trim().replace(/\u0410/g, 'A').replace(/\u0430/g, 'a').replace(/\u0412/g, 'B').replace(/\u0432/g, 'b').replace(/\u041E/g, 'O').replace(/\u043E/g, 'o');

  // 1. Coating widths e.g. 36 см, 44 см, 54 см
  const matchCm = clean.match(/(\d+\s*см)/i);
  if (matchCm) return matchCm[1];

  // 2. Standard B-series sheet e.g. B1, B2, B3, B4
  const matchB = clean.match(/\b(B[0-4])\b/i);
  if (matchB) return matchB[1].toUpperCase();

  // 3. Standard A-series sheet e.g. A0, Ao, A1, A2, A3, A4
  const matchA = clean.match(/\b(A[0-4oO])\b/i);
  if (matchA) return matchA[1].toUpperCase().replace('AO', 'A0');

  // 4. CTP plate or explicit dimensions format e.g. 76x60.5, 65x55, 74.5x60.5, 720*1020
  const matchDim = clean.match(/(\d+(?:\.\d+)?\s*[x*х]\s*\d+(?:\.\d+)?)/i);
  if (matchDim) return matchDim[1].replace('*', 'x').replace('х', 'x');

  return '';
}
