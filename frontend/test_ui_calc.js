function popcount(n) {
  let count = 0;
  let val = Math.floor(n);
  while (val > 0) {
    count += val & 1;
    val >>= 1;
  }
  return count;
}

function calculateSetups(pressSheet, divisions) {
  const fullSheets = Math.floor(pressSheet);
  const fraction = pressSheet - fullSheets;
  if (fraction === 0) return fullSheets;
  const fractionLeaves = Math.round(fraction * divisions);
  const fractionalSetups = popcount(fractionLeaves);
  return fullSheets + fractionalSetups;
}

// Mock function based on exact paperSizes.ts
function calculatePaperDivision(sourceStr, targetStr) {
  return 8; // For A2 to A5
}

function onChange(totalPages, print_size, size, base_qty, extra_qty, divide_by) {
  const a7 = size || 'A5';
  const targetPages = totalPages;
  const pagesPerSheet = calculatePaperDivision(print_size || 'A2', a7) * 2;
  const m4 = targetPages / pagesPerSheet;
  
  const base = base_qty || 0;
  const extra = extra_qty || 0;
  const divs = calculatePaperDivision(print_size || 'A2', a7);
  const setups = calculateSetups(m4, divs);
  const total = (base * m4) + (extra * setups);
  const sheet_qty = Math.ceil(total / (divide_by || 1));
  
  return { m4, setups, total, sheet_qty };
}

console.log("196 pages:", onChange(196, 'A2', 'A5', 300, 100, 4));
console.log("204 pages:", onChange(204, 'A2', 'A5', 300, 100, 4));
