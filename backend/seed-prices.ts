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

  // Будаг
  { category: 'Материал', item_name: 'Будаг Dalhan ink Cyan 1кг', unit_cost: 35000 },
  { category: 'Материал', item_name: 'Будаг Dalhan ink Magenta 1кг', unit_cost: 35000 },
  { category: 'Материал', item_name: 'Будаг Dalhan ink Yellow 1кг', unit_cost: 35000 },
  { category: 'Материал', item_name: 'Будаг Dalhan ink Black 1кг', unit_cost: 30000 },

  // Стикер
  { category: 'Цаас', item_name: 'Стикер A2 (594x440)', unit_cost: 380 },
  { category: 'Цаас', item_name: 'Стикер A3 (300x440)', unit_cost: 190 },

  // Картон
  { category: 'Цаас', item_name: 'Картон 2 A0 (889x1194)', unit_cost: 6300 },
  { category: 'Цаас', item_name: 'Картон 2.5 A0 (889x1194)', unit_cost: 6950 },

  // Кай цаас
  { category: 'Цаас', item_name: 'Кай цаас 250 A0 (889x1194)', unit_cost: 1300 },

  // Цавуу
  { category: 'Материал', item_name: 'Цавуу /хажуу болон шил наана/ 20кг', unit_cost: 480000 },
];

const operationsData = [
  { name: 'Нугалаа (Стандарт)', expr: 'total_qty', desc: 'Флаер, брошур нугалах', cost: 10 },
  { name: 'Нугалаа (Хэв. хуудсаар)', expr: 'ceil(total_pages / 16) * total_qty', desc: 'Ном, сэтгүүл нугалах', cost: 15 },
  { name: 'Үдээ (Хавтас үдэх)', expr: 'total_qty', desc: 'Нуруугаар үдэх', cost: 50 },
  { name: 'Цавуун наалт (Perfect Bind)', expr: 'total_qty', desc: 'Халуун цавуугаар наах', cost: 200 },
  { name: 'Утасан оёдол', expr: 'ceil(total_pages / 16) * total_qty', desc: 'Дэвтэрлэн оёх', cost: 100 },
  { name: 'Цаас зүсэлт (Trimming)', expr: 'ceil(total_qty / 500)', desc: 'Цаас огтлох (боодлоор)', cost: 1500 },
  { name: 'Перфораци (Таслах шугам)', expr: 'total_qty', desc: 'Таслах цэгэн шугам', cost: 20 },
  { name: 'Дугаарлалт (Numbering)', expr: 'total_qty', desc: 'Дараалсан дугаар дарах', cost: 15 },
  { name: 'Нэгтгэл (Collating)', expr: 'total_pages * total_qty', desc: 'Хуудас өрөх', cost: 5 },
  { name: 'Булан дугуйлах', expr: 'total_qty', desc: 'Булан огтлох', cost: 25 },
  { name: 'Хэсэгчилсэн УФ лак (Spot UV)', expr: 'total_qty', desc: 'Гялбаатай лак', cost: 150 },
  { name: 'Фольго дардас (Foil Stamp)', expr: 'total_qty', desc: 'Алтлаг мөнгөлөг товгор дардас', cost: 250 },
  { name: 'Бүрэлт', expr: '', desc: 'Хавтасны бүрэлтийн хуулга', cost: 1500 },
  { name: 'Оосор (Торны оосор)', expr: 'total_qty * 2', desc: '1 торонд 2 ш оосор орно', cost: 80 },
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
      const createdOp = await prisma.masterprice.create({
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
            masterPriceId: createdOp.id,
            changed_by: admin.id,
            old_cost: 0,
            new_cost: op.cost
          }
        });
      }
      console.log(`Added operation ${op.name}`);
    }
  }

  console.log('Done seeding prices and operations!');
}
