export function parseMaterial(itemName: string) {
  // Custom parsing rules based on known item_name formats
  const match = itemName.match(/^(.*?)\s+((?:\d+(?:\.\d+)?(?:гр|кг)|[AB][0-4]o?|\d+(?:\.\d+)?\s+[AB][0-4]|\d+\s*(?:x|\*)\s*\d+|250).*)$/i);
  
  if (match) {
    return { baseName: match[1].trim(), sizeName: match[2].trim() };
  }
  
  // Fallback
  return { baseName: itemName.trim(), sizeName: '' };
}
