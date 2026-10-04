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

  // Custom parsing rules based on known item_name formats
  const match = itemName.match(/^(.*?)\s+((?:\d+(?:\.\d+)?(?:гр|кг)|[AB][0-4]o?|\d+(?:\.\d+)?\s+[AB][0-4]|\d+\s*(?:x|\*)\s*\d+|250).*)$/i);
  
  if (match) {
    return { baseName: match[1].trim(), sizeName: match[2].trim() };
  }
  
  // Fallback
  return { baseName: itemName.trim(), sizeName: '' };
}
