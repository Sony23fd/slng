export function parseMaterial(itemName: string) {
  if (!itemName) return { baseName: '', sizeName: '' };

  // Coating materials breakdown (e.g., "Бүрэлт матт Хятад 44 см", "Бүрэлт Илгэн  Со 44", "Бүрэлт матт/эмбосстой Со 36см")
  const coatingMatch = itemName.match(/^(Бүрэлт.*?)\s*(\d{2})\s*(?:см|cm)?$/i);
  if (coatingMatch) {
    return {
      baseName: coatingMatch[1].trim(),
      sizeName: `${coatingMatch[2]} см`
    };
  }

  // Custom parsing rules based on known item_name formats
  const match = itemName.match(/^(.*?)\s+((?:\d+(?:\.\d+)?(?:гр|кг)|[AB][0-4]o?|\d+(?:\.\d+)?\s+[AB][0-4]|\d+\s*(?:x|\*)\s*\d+|250).*)$/i);
  
  if (match) {
    return { baseName: match[1].trim(), sizeName: match[2].trim() };
  }
  
  // Fallback
  return { baseName: itemName.trim(), sizeName: '' };
}
