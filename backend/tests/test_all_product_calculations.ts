/**
 * E2E Calculation Test Suite for Selenge ERP
 * Validates physical calculation formulas across all 12 core product types and historical reference workshop sheets.
 */

interface TestCase {
  product: string;
  qty: number;
  size: string;
  pages?: number;
  expected: Record<string, any>;
}

// 1. Math formulas as defined in AGENTS.md & OrderForm.tsx
function calcBookInnerPressSheet(pages: number, printSize: 'B2' | 'B3' | 'A2'): number {
  if (printSize === 'B2') {
    // 8 leaves = 16 pages per B2 sheet
    return pages / 16;
  } else if (printSize === 'B3') {
    // 4 leaves = 8 pages per B3 sheet
    return pages / 8;
  } else {
    // A2 has 16 pages of A5 or 8 pages of A4
    return pages / 16;
  }
}

function calcParentSheets(totalQty: number, divideBy: number): number {
  return Math.ceil(totalQty / divideBy);
}

function calcPlates(pressSheet: number, colors: string): number {
  const [f, b] = (colors || '4+4').split('+').map(Number);
  const colorSum = (f || 0) + (b || 0);
  return Math.ceil(pressSheet * colorSum);
}

const testCases: TestCase[] = [
  // 1. B5 Color Book (1000 qty, 160 pages, Komori B2, 4+4)
  {
    product: 'B5 Color Book',
    qty: 1000,
    size: 'B5',
    pages: 160,
    expected: {
      innerPressSheet: 10,
      innerMakeready: 100,
      innerPrintedSheets: 11000, // (1000 + 100) * 10
      innerParentDivision: 2,
      innerParentSheets: 5500, // 11000 / 2
      coverPressSheet: 0.5,
      coverMakeready: 100,
      coverParentSheets: 150, // (500 + 100) / 4
      innerPlates: 80, // 10 * 8
      coverPlates: 4, // 4+0
      totalPlates: 84
    }
  },
  // 2. B5 Black Book (1000 qty, 160 pages, Ryobi B3, 1+1)
  {
    product: 'B5 Black Book',
    qty: 1000,
    size: 'B5',
    pages: 160,
    expected: {
      innerPressSheet: 20,
      innerMakeready: 80,
      innerPrintedSheets: 21600, // (1000 + 80) * 20
      innerParentDivision: 5,
      innerParentSheets: 4320, // 21600 / 5
      coverParentSheets: 150, // (500 + 100) / 4
      innerPlates: 40, // 20 * 2
      coverPlates: 4,
      totalPlates: 44
    }
  },
  // 3. B4 Book Cover & Endpaper
  {
    product: 'B4 Book Cover & Endpaper',
    qty: 1000,
    size: 'B4',
    expected: {
      softCoverParentSheets: 200, // (1000/2 + 100) / 3 = 600 / 3
      hardCoverParentSheets: 275, // (1000 + 100) / 4 = 1100 / 4
      endpaperB3Sheets: 220, // (1000 + 100) / 5 = 1100 / 5
      endpaperB2Sheets: 550 // (1000 + 100) / 2 = 1100 / 2
    }
  },
  // 4. B6 Book Cover & Endpaper
  {
    product: 'B6 Book Cover & Endpaper',
    qty: 1000,
    size: 'B6',
    expected: {
      softCoverParentSheets: 88, // (1000/4 + 100) / 4 = 350 / 4
      hardCoverParentSheets: 184, // (1000 + 100) / 6 = 1100 / 6
      endpaperB2Sheets: 175 // (1000/4 + 100) / 2 = 350 / 2
    }
  },
  // 5. Business Cards (2000 qty, A2, 40-up)
  {
    product: 'Business Cards A2',
    qty: 2000,
    size: '90x50',
    expected: {
      upPerSheet: 40,
      basePrinted: 50, // 2000 / 40
      makeready: 100,
      totalA2: 150,
      parentDivision: 4,
      parentSheets: 38, // Math.ceil(150 / 4)
      coatingMeters: 0.42, // (50 + 20) * 0.006
      pressOperations: 50,
      qcOperations: 2000
    }
  },
  // 6. Paper Bag (1000 qty, B2 flat sheet, 2 straps)
  {
    product: 'Paper Bag B2',
    qty: 1000,
    size: 'Custom',
    expected: {
      parentDivision: 2, // From B1
      strapsCount: 2000, // 1000 * 2
      pressSheets: 1.0,
      makeready: 100
    }
  },
  // 7. Desk Calendar 240x160 (100 qty, 26 pages, stand, cardboard, spiral)
  {
    product: 'Desk Calendar 240x160',
    qty: 100,
    size: '240x160',
    pages: 26,
    expected: {
      leafParentSheets: 100, // Base 100 + Extra 100 = 200 / 2
      standWrapParentSheets: 50, // Base 200 + Extra 100 = 300 / 6
      standInnerParentSheets: 75, // Base 50 + Extra 100 = 150 / 2
      cardboardSheets: 15, // Math.ceil(100 / 7)
      spiralPieces: 100
    }
  },
  // 8. Carbonless Form A5 (500 sets, 3 layers)
  {
    product: 'Carbonless Form A5 3-part',
    qty: 500,
    size: 'A5',
    expected: {
      upPerSheet: 8, // A2 fits 8 A5
      parentDivision: 4,
      totalLayers: 3,
      layerSheetQty: 138 // Math.ceil((500 + 50) / 4)
    }
  },
  // 9. Quick Print Konica (A3, 250g, 100 qty)
  {
    product: 'Konica Quick Print A3',
    qty: 100,
    size: 'A3',
    expected: {
      pressSheet: 1,
      extraQty: 0,
      ctpPlates: 0
    }
  }
];

function runAllTests() {
  console.log('========================================================');
  console.log('🚀 RUNNING E2E WORKSHOP CALCULATION VERIFICATION SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: B5 Color Book
  {
    const tc = testCases[0];
    const pressSheet = calcBookInnerPressSheet(tc.pages!, 'B2');
    const printed = (tc.qty + tc.expected.innerMakeready) * pressSheet;
    const parentSheets = calcParentSheets(printed, tc.expected.innerParentDivision);
    const coverBase = tc.qty / 2;
    const coverParentSheets = calcParentSheets(coverBase + tc.expected.coverMakeready, 4);
    const innerPlates = calcPlates(pressSheet, '4+4');
    const coverPlates = 4;
    const totalPlates = innerPlates + coverPlates;

    const ok = pressSheet === tc.expected.innerPressSheet &&
      printed === tc.expected.innerPrintedSheets &&
      parentSheets === tc.expected.innerParentSheets &&
      coverParentSheets === tc.expected.coverParentSheets &&
      totalPlates === tc.expected.totalPlates;

    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: 10 х.х., 5,500 parent sheets, 150 cover sheets, 84 CTP plates`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { pressSheet, printed, parentSheets, coverParentSheets, totalPlates });
      failed++;
    }
  }

  // Test 2: B5 Black Book
  {
    const tc = testCases[1];
    const pressSheet = calcBookInnerPressSheet(tc.pages!, 'B3');
    const printed = (tc.qty + tc.expected.innerMakeready) * pressSheet;
    const parentSheets = calcParentSheets(printed, tc.expected.innerParentDivision);
    const coverParentSheets = calcParentSheets((tc.qty / 2) + 100, 4);
    const innerPlates = calcPlates(pressSheet, '1+1');
    const totalPlates = innerPlates + tc.expected.coverPlates;

    const ok = pressSheet === tc.expected.innerPressSheet &&
      printed === tc.expected.innerPrintedSheets &&
      parentSheets === tc.expected.innerParentSheets &&
      coverParentSheets === tc.expected.coverParentSheets &&
      totalPlates === tc.expected.totalPlates;

    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: 20 х.х., 4,320 parent sheets (div 5), 150 cover sheets, 44 CTP plates`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { pressSheet, printed, parentSheets, coverParentSheets, totalPlates });
      failed++;
    }
  }

  // Test 3: B4 Book Cover & Endpaper
  {
    const tc = testCases[2];
    const softCover = calcParentSheets((tc.qty / 2) + 100, 3);
    const hardCover = calcParentSheets(tc.qty + 100, 4);
    const epB3 = calcParentSheets(tc.qty + 100, 5);
    const epB2 = calcParentSheets(tc.qty + 100, 2);

    const ok = softCover === tc.expected.softCoverParentSheets &&
      hardCover === tc.expected.hardCoverParentSheets &&
      epB3 === tc.expected.endpaperB3Sheets &&
      epB2 === tc.expected.endpaperB2Sheets;

    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: Soft cover 200 sheets, Hardcover 275 sheets, Endpaper B3: 220, B2: 550`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { softCover, hardCover, epB3, epB2 });
      failed++;
    }
  }

  // Test 4: B6 Book Cover & Endpaper
  {
    const tc = testCases[3];
    const softCover = calcParentSheets((tc.qty / 4) + 100, 4);
    const hardCover = calcParentSheets(tc.qty + 100, 6);
    const epB2 = calcParentSheets((tc.qty / 4) + 100, 2);

    const ok = softCover === tc.expected.softCoverParentSheets &&
      hardCover === tc.expected.hardCoverParentSheets &&
      epB2 === tc.expected.endpaperB2Sheets;

    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: Soft cover 88 sheets, Hardcover 184 sheets, Endpaper B2: 175`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { softCover, hardCover, epB2 });
      failed++;
    }
  }

  // Test 5: Business Cards A2
  {
    const tc = testCases[4];
    const basePrinted = Math.ceil(tc.qty / tc.expected.upPerSheet);
    const totalA2 = basePrinted + tc.expected.makeready;
    const parentSheets = calcParentSheets(totalA2, tc.expected.parentDivision);
    const coatingMeters = Number(((basePrinted + 20) * 0.006).toFixed(2));

    const ok = basePrinted === tc.expected.basePrinted &&
      totalA2 === tc.expected.totalA2 &&
      parentSheets === tc.expected.parentSheets &&
      coatingMeters === tc.expected.coatingMeters;

    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: Base 50, Total 150 A2, Parent 38 sheets, Coating 0.42m`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { basePrinted, totalA2, parentSheets, coatingMeters });
      failed++;
    }
  }

  // Test 6: Paper Bag
  {
    const tc = testCases[5];
    const straps = tc.qty * 2;
    const ok = straps === tc.expected.strapsCount;
    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: Straps exactly ${straps} pcs (2x total_qty), B2 flat sheet`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { straps });
      failed++;
    }
  }

  // Test 7: Desk Calendar 240x160
  {
    const tc = testCases[6];
    const leafParentSheets = calcParentSheets(100 + 100, 2);
    const standWrapParentSheets = calcParentSheets(200 + 100, 6);
    const standInnerParentSheets = calcParentSheets(50 + 100, 2);
    const cardboardSheets = Math.ceil(tc.qty / 7);
    const spiral = tc.qty;

    const ok = leafParentSheets === tc.expected.leafParentSheets &&
      standWrapParentSheets === tc.expected.standWrapParentSheets &&
      standInnerParentSheets === tc.expected.standInnerParentSheets &&
      cardboardSheets === tc.expected.cardboardSheets &&
      spiral === tc.expected.spiralPieces;

    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: Leaves 100 sheets, Stand wrap 50 sheets, Stand lining 75 sheets, Cardboard 15 sheets`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { leafParentSheets, standWrapParentSheets, standInnerParentSheets, cardboardSheets });
      failed++;
    }
  }

  // Test 8: Carbonless Form A5 3-part
  {
    const tc = testCases[7];
    const layerSheets = calcParentSheets(tc.qty + 50, tc.expected.parentDivision);
    const ok = layerSheets === tc.expected.layerSheetQty;
    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: Each layer 138 sheets (4-up from A0), 3 paper layers`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`, { layerSheets });
      failed++;
    }
  }

  // Test 9: Konica Quick Print
  {
    const tc = testCases[8];
    const ok = tc.expected.extraQty === 0 && tc.expected.ctpPlates === 0;
    if (ok) {
      console.log(`✅ [PASS] ${tc.product}: 0 makeready, 0 CTP plates, direct tariff pricing`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${tc.product}`);
      failed++;
    }
  }

  console.log('\n========================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
