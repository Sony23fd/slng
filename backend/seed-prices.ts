import { PrismaClient } from '@prisma/client';

const prices = [
  // Номын шар
  { category: 'Цаас', item_name: 'Номын шар Гөлгөр 68гр B1 (789x1092)', unit_cost: 300 },
  { category: 'Цаас', item_name: 'Номын шар Гөлгөр 68гр A0 (889x1194)', unit_cost: 420 },
  { category: 'Цаас', item_name: 'Номын шар Гөлгөр 78гр B1 (789x1092)', unit_cost: 370 },
  { category: 'Цаас', item_name: 'Номын шар Гөлгөр 78гр A0 (889x1194)', unit_cost: 460 },
  { category: 'Цаас', item_name: 'Номын шар Хөнгөн 70гр B1 (789x1092)', unit_cost: 300 },
  { category: 'Цаас', item_name: 'Номын шар Хөнгөн 70гр A0 (889x1194)', unit_cost: 420 },
  { category: 'Цаас', item_name: 'Номын шар Хөнгөн 80гр B1 (789x1092)', unit_cost: 408 },
  { category: 'Цаас', item_name: 'Номын шар Хөнгөн 80гр A0 (889x1194)', unit_cost: 510 },

  // Офсет цаас
  { category: 'Цаас', item_name: 'Офсет цаас 70гр A0 (889x1194)', unit_cost: 440 },
  { category: 'Цаас', item_name: 'Офсет цаас 80гр A0 (889x1194)', unit_cost: 510 },
  { category: 'Цаас', item_name: 'Офсет цаас 100гр A0 (889x1194)', unit_cost: 675 },
  { category: 'Цаас', item_name: 'Офсет цаас 120гр A0 (889x1194)', unit_cost: 850 },

  // Шохойтой цаас
  { category: 'Цаас', item_name: 'Шохойтой цаас 80гр A0 (889x1194)', unit_cost: 500 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 105гр A0 (889x1194)', unit_cost: 600 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 128гр A0 (889x1194)', unit_cost: 720 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 157гр A0 (889x1194)', unit_cost: 890 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 157гр B1 (787x1092)', unit_cost: 752 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 200гр A0 (889x1194)', unit_cost: 1150 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 200гр B1 (787x1092)', unit_cost: 920 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 250гр A0 (889x1194)', unit_cost: 1400 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 250гр B1 (787x1092)', unit_cost: 1150 },
  { category: 'Цаас', item_name: 'Шохойтой цаас 300гр A0 (889x1194)', unit_cost: 1800 },

  // Мат цаас
  { category: 'Цаас', item_name: 'Мат цаас 80гр A0 (889x1194)', unit_cost: 500 },
  { category: 'Цаас', item_name: 'Мат цаас 105гр A0 (889x1194)', unit_cost: 620 },
  { category: 'Цаас', item_name: 'Мат цаас 128гр A0 (889x1194)', unit_cost: 760 },
  { category: 'Цаас', item_name: 'Мат цаас 157гр A0 (889x1194)', unit_cost: 940 },
  { category: 'Цаас', item_name: 'Мат цаас 157гр B1 (889x1194)', unit_cost: 710 },
  { category: 'Цаас', item_name: 'Мат цаас 200гр A0 (889x1194)', unit_cost: 1150 },
  { category: 'Цаас', item_name: 'Мат цаас 250гр A0 (889x1194)', unit_cost: 1400 },
  { category: 'Цаас', item_name: 'Мат цаас 250гр B1 (787x1092)', unit_cost: 1150 },
  { category: 'Цаас', item_name: 'Мат цаас 300гр A0 (889x1194)', unit_cost: 1800 },

  // Хортой цаас
  { category: 'Цаас', item_name: 'Хортой цаас I өнгө 48гр Ao (889x1194)', unit_cost: 510 },
  { category: 'Цаас', item_name: 'Хортой цаас II өнгө/шар 50гр Ao (889x1194)', unit_cost: 540 },
  { category: 'Цаас', item_name: 'Хортой цаас III өнгө Цэнхэр 55гр Ao (890x1194)', unit_cost: 510 },
  { category: 'Цаас', item_name: 'Хортой цаас III өнгө шар 48гр Ao (889x1194)', unit_cost: 510 },
  { category: 'Цаас', item_name: 'Хортой цаас III өнгө Ягаан 48гр Ao (889x1194)', unit_cost: 510 },

  // Стикер
  { category: 'Цаас', item_name: 'Стикер A2 (594x440)', unit_cost: 380 },
  { category: 'Цаас', item_name: 'Стикер A3 (300x440)', unit_cost: 190 },

  // Картон
  { category: 'Цаас', item_name: 'Картон 2 A0 (889x1194)', unit_cost: 6300 },
  { category: 'Цаас', item_name: 'Картон 2.5 A0 (889x1194)', unit_cost: 6950 },
  { category: 'Цаас', item_name: 'Картон 3.0 A0 (889x1194)', unit_cost: 7600 },

  // Кай цаас
  { category: 'Цаас', item_name: 'Кай цаас 250 A0 (889x1194)', unit_cost: 1300 },

  // Нэмэлт материалууд
  { category: 'Материал', item_name: 'Бүрэлт (Гялгар)', unit_cost: 1500 },
  { category: 'Материал', item_name: 'Бүрэлт (Матт)', unit_cost: 1500 },
  { category: 'Материал', item_name: 'Оосор (Торны оосор)', unit_cost: 80 },
];

const operationsData = [
  { name: 'Нугалаа', expr: 'total_qty', desc: 'Нугалаа', cost: 10 },
  { name: 'Шалгах', expr: 'total_qty', desc: 'Шалгах', cost: 10 },
  { name: 'Цуглуулга', expr: 'total_qty', desc: 'Цуглуулга', cost: 10 },
  
  { name: 'Хэвлэгч (1 өнгө)', expr: 'total_qty', desc: 'Хэвлэгч 1 өнгө', cost: 10 },
  { name: 'Хэвлэгч (2 өнгө)', expr: 'total_qty', desc: 'Хэвлэгч 2 өнгө', cost: 20 },
  { name: 'Хэвлэгч (4 өнгө)', expr: 'total_qty', desc: 'Хэвлэгч 4 өнгө', cost: 40 },
  { name: 'Хэвлэгч (5 өнгө)', expr: 'total_qty', desc: 'Хэвлэгч 5 өнгө', cost: 50 },

  { name: 'Үдээ (Унаа үдээ)', expr: 'total_qty', desc: 'Унаа үдээ', cost: 50 },
  { name: 'Үдээ (Шугамын үдээ)', expr: 'total_qty', desc: 'Шугамын үдээ', cost: 50 },

  { name: 'Лак (Хэсэгчилсэн)', expr: 'total_qty', desc: 'Хэсэгчилсэн лак', cost: 150 },
  { name: 'Лак (Бүтэн)', expr: 'total_qty', desc: 'Бүтэн лак', cost: 200 },
  { name: 'Лак (Барзгар)', expr: 'total_qty', desc: 'Барзгар лак', cost: 250 },

  { name: 'Блокон оёо', expr: 'ceil(total_pages / 16) * total_qty', desc: 'Блокон оёо', cost: 100 },
  { name: 'Наалт', expr: 'total_qty', desc: 'Наалт', cost: 150 },

  { name: 'Огтлоо (Жижиг)', expr: 'ceil(total_qty / 500)', desc: 'Огтлоо Жижиг', cost: 1000 },
  { name: 'Огтлоо (Дунд)', expr: 'ceil(total_qty / 500)', desc: 'Огтлоо Дунд', cost: 1500 },
  { name: 'Огтлоо (Том)', expr: 'ceil(total_qty / 500)', desc: 'Огтлоо Том', cost: 2000 },

  { name: 'Хатуу хавтас (A5)', expr: 'total_qty', desc: 'Хатуу хавтас A5', cost: 2000 },
  { name: 'Хатуу хавтас (A4)', expr: 'total_qty', desc: 'Хатуу хавтас A4', cost: 3000 },
  { name: 'Хатуу хавтас (B5)', expr: 'total_qty', desc: 'Хатуу хавтас B5', cost: 2500 },
  { name: 'Хатуу хавтас (B4)', expr: 'total_qty', desc: 'Хатуу хавтас B4', cost: 3500 },

  { name: 'Бөгж цоологч', expr: 'total_qty', desc: 'Бөгж цоологч', cost: 20 },
  { name: 'Гараар хийх ажил', expr: 'total_qty', desc: 'Гараар хийх ажил', cost: 100 },
  { name: 'Нууцлал наах', expr: 'total_qty', desc: 'Нууцлал наах', cost: 50 },

  { name: 'Хэв дарах (A5)', expr: 'total_qty', desc: 'Хэв дарах A5', cost: 150 },
  { name: 'Хэв дарах (A4)', expr: 'total_qty', desc: 'Хэв дарах A4', cost: 250 },
  { name: 'Хэв дарах (A3)', expr: 'total_qty', desc: 'Хэв дарах A3', cost: 350 },

  { name: 'Спираль дарагч', expr: 'total_qty', desc: 'Спираль дарагч', cost: 50 },
];

export async function seedPrices(prisma: PrismaClient) {
  console.log('Seeding MasterPrice...');
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  // 1. Seed standard materials
  for (const p of prices) {
    const existing = await prisma.masterprice.findFirst({
      where: { item_name: p.item_name, category: p.category }
    });

    if (!existing) {
      const price = await prisma.masterprice.create({
        data: {
          category: p.category,
          item_name: p.item_name,
          unit_cost: p.unit_cost
        }
      });

      if (admin) {
        await prisma.masterpricelog.create({
          data: {
            masterPriceId: price.id,
            changed_by: admin.id,
            old_cost: 0,
            new_cost: p.unit_cost
          }
        });
      }
      console.log(`Added material ${p.item_name}`);
    }
  }

  // 2. Seed formulas & operations
  console.log('Seeding Operations & Formulas...');
  for (const op of operationsData) {
    let formulaId: number | null = null;

    if (op.expr) {
      const existingFormula = await prisma.calculation_formula.findFirst({
        where: { name: op.name }
      });
      if (existingFormula) {
        formulaId = existingFormula.id;
        if (existingFormula.expression !== op.expr) {
          await prisma.calculation_formula.update({
            where: { id: existingFormula.id },
            data: { expression: op.expr, description: op.desc }
          });
        }
      } else {
        const newFormula = await prisma.calculation_formula.create({
          data: {
            name: op.name,
            expression: op.expr,
            description: op.desc
          }
        });
        formulaId = newFormula.id;
      }
    }

    const existingOp = await prisma.masterprice.findFirst({
      where: { item_name: op.name, category: 'Ажиллагаа' }
    });

    if (existingOp) {
      await prisma.masterprice.update({
        where: { id: existingOp.id },
        data: {
          unit_cost: op.cost,
          formula_id: formulaId
        }
      });
    } else {
      const newOp = await prisma.masterprice.create({
        data: {
          category: 'Ажиллагаа',
          item_name: op.name,
          unit_cost: op.cost,
          formula_id: formulaId
        }
      });
      if (admin) {
        await prisma.masterpricelog.create({
          data: {
            masterPriceId: newOp.id,
            changed_by: admin.id,
            old_cost: 0,
            new_cost: op.cost
          }
        });
      }
      console.log(`Added operation ${op.name}`);
    }
  }

  // Cleanup old operations that are no longer in the list
  const opNames = operationsData.map(o => o.name);
  const oldOps = await prisma.masterprice.findMany({
    where: {
      category: 'Ажиллагаа',
      item_name: { notIn: opNames }
    }
  });

  for (const oldOp of oldOps) {
    await prisma.masterpricelog.deleteMany({ where: { masterPriceId: oldOp.id } });
    await prisma.masterprice.delete({ where: { id: oldOp.id } });
    console.log(`Deleted obsolete operation: ${oldOp.item_name}`);
  }

  console.log('Seed completed.');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedPrices(prisma)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
