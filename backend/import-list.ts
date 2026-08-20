import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading parsed_list.json...');
  const filePath = path.join(__dirname, '../parsed_list.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  console.log('Wiping existing masterprice items...');
  await prisma.masterprice.deleteMany({});
  // This will cascade delete masterpricelog entries automatically because of onDelete: Cascade

  // Fetch all existing formulas
  const formulas = await prisma.calculation_formula.findMany();
  
  // Try to find a default formula (total_qty)
  let defaultFormulaId = formulas.find(f => f.expression === 'total_qty')?.id;
  if (!defaultFormulaId) {
    const f = await prisma.calculation_formula.create({
      data: { name: 'Ерөнхий тоо хэмжээ', expression: 'total_qty', description: 'Захиалгын нийт тоо хэмжээ' }
    });
    defaultFormulaId = f.id;
  }

  // Helper to match formula
  const findFormula = (opName: string) => {
    const lower = opName.toLowerCase();
    if (lower.includes('нугалаа')) {
      const f = formulas.find(f => f.name.includes('Хэв. хуудсаар') || f.expression.includes('total_pages'));
      return f ? f.id : defaultFormulaId;
    }
    if (lower.includes('үдээ') || lower.includes('оёдол') || lower.includes('оёо')) {
      const f = formulas.find(f => f.expression.includes('total_pages'));
      return f ? f.id : defaultFormulaId;
    }
    if (lower.includes('наалт')) {
      const f = formulas.find(f => f.name.includes('Цавуун') || f.expression === 'total_qty');
      return f ? f.id : defaultFormulaId;
    }
    if (lower.includes('оосор') || lower.includes('тор')) {
      const f = formulas.find(f => f.expression.includes('total_qty * 2'));
      return f ? f.id : defaultFormulaId;
    }
    if (lower.includes('хэвлэгч') || lower.includes('хэвлэх')) {
      // Create or get a printed sheets formula
      let printFormula = formulas.find(f => f.expression === 'total_printed_sheets');
      if (printFormula) return printFormula.id;
      return defaultFormulaId; // fallback
    }
    return defaultFormulaId;
  };

  console.log('Seeding materials...');
  for (const m of data.material) {
    if (!m.label) continue;
    
    // Guess category
    let cat = 'Материал';
    if (m.label.toLowerCase().includes('цаас') || m.label.toLowerCase().includes('картон') || m.label.toLowerCase().includes('матт') || m.label.toLowerCase().includes('шохойтой') || m.label.toLowerCase().includes('кальк') || m.label.toLowerCase().includes('шар')) {
        cat = 'Цаас';
    }

    const cost = m.unit_cost ? parseFloat(m.unit_cost.replace(',', '.')) : 0;
    
    await prisma.masterprice.create({
      data: {
        category: cat,
        item_name: m.label,
        unit_cost: isNaN(cost) ? 0 : cost,
      }
    });
  }

  console.log('Seeding operations...');
  for (const op of data.ajillagaa) {
    if (!op.label) continue;

    const cost = op.unit_cost ? parseFloat(op.unit_cost.replace(',', '.')) : 0;
    const fId = findFormula(op.label);

    await prisma.masterprice.create({
      data: {
        category: 'Ажиллагаа',
        item_name: op.label,
        unit_cost: isNaN(cost) ? 0 : cost,
        formula_id: fId
      }
    });
  }

  // Ensure total_printed_sheets formula exists for Printers
  let printFormula = await prisma.calculation_formula.findFirst({ where: { expression: 'total_printed_sheets' } });
  if (!printFormula) {
      printFormula = await prisma.calculation_formula.create({
          data: { name: 'Хэвлэх хуудасны тоо', expression: 'total_printed_sheets', description: 'Нийт хэвлэх хуудас (Хадаас орсон)' }
      });
  }
  
  // Re-assign printFormula to things with Хэвлэгч
  await prisma.masterprice.updateMany({
      where: { item_name: { contains: 'Хэвлэгч' } },
      data: { formula_id: printFormula.id }
  });

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
