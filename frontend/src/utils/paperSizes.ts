// Standard sizes in mm (portrait)
const STANDARD_SIZES: Record<string, { w: number, h: number }> = {
  'A0': { w: 841, h: 1189 },
  'A1': { w: 594, h: 841 },
  'A2': { w: 420, h: 594 },
  'A3': { w: 297, h: 420 },
  'A4': { w: 210, h: 297 },
  'A5': { w: 148, h: 210 },
  'A6': { w: 105, h: 148 },
  
  'B0': { w: 1000, h: 1414 },
  'B1': { w: 707, h: 1000 },
  'B2': { w: 500, h: 707 },
  'B3': { w: 353, h: 500 },
  'B4': { w: 250, h: 353 },
  'B5': { w: 176, h: 250 },
  'B6': { w: 125, h: 176 },
};

function parseDimensions(str: string): { w: number, h: number } | null {
  if (!str) return null;
  
  // Try to find explicit WxH e.g. 789x1092 or 789*1092
  const dimMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:x|\*|х)\s*(\d+(?:\.\d+)?)/i);
  if (dimMatch) {
    return {
      w: parseFloat(dimMatch[1]),
      h: parseFloat(dimMatch[2])
    };
  }
  
  // Try to find standard name e.g. A0, B1
  const nameMatch = str.match(/\b([AB][0-6]o?)\b/i);
  if (nameMatch) {
    let name = nameMatch[1].toUpperCase();
    if (name === 'AO') name = 'A0'; // Fix common typo "Ao" -> "A0"
    if (name === 'BO') name = 'B0';
    if (STANDARD_SIZES[name]) {
      // In the database, sometimes A0 is an oversized sheet (e.g. 889x1194).
      // If we don't have explicit dimensions, we fall back to standard ISO
      return STANDARD_SIZES[name];
    }
  }
  
  return null;
}

export function calculatePaperDivision(sourceStr: string, targetStr: string): number {
  if (!sourceStr || !targetStr) return 1;
  
  // If the user selects the same size class A->A or B->B, we can use the 2^(diff) rule for perfect exact division
  // because physical cutting sometimes relies on equal halves rather than raw area fit.
  const sourceNameMatch = sourceStr.match(/\b([AB])([0-6]o?)\b/i);
  const targetNameMatch = targetStr.match(/\b([AB])([0-6]o?)\b/i);
  
  if (sourceNameMatch && targetNameMatch) {
    let sLetter = sourceNameMatch[1].toUpperCase();
    let sDigit = sourceNameMatch[2].toUpperCase() === 'O' ? 0 : parseInt(sourceNameMatch[2], 10);
    
    let tLetter = targetNameMatch[1].toUpperCase();
    let tDigit = targetNameMatch[2].toUpperCase() === 'O' ? 0 : parseInt(targetNameMatch[2], 10);
    
    if (sLetter === tLetter && tDigit >= sDigit) {
      return Math.pow(2, tDigit - sDigit);
    }
  }

  // Fallback to geometric fit
  const sourceDim = parseDimensions(sourceStr);
  const targetDim = parseDimensions(targetStr);
  
  if (sourceDim && targetDim) {
    // How many target pieces fit in source piece?
    // Try both orientations
    const fit1 = Math.floor(sourceDim.w / targetDim.w) * Math.floor(sourceDim.h / targetDim.h);
    const fit2 = Math.floor(sourceDim.w / targetDim.h) * Math.floor(sourceDim.h / targetDim.w);
    
    const maxFit = Math.max(fit1, fit2);
    return maxFit > 0 ? maxFit : 1;
  }
  
  return 1;
}
