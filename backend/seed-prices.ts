import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Seeding MasterPrice...');
  // Find the first admin user to assign logs
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  for (const p of prices) {
    const existing = await prisma.masterprice.findFirst({
      where: { item_name: p.item_name }
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

      console.log(`Added ${p.item_name}: ${p.unit_cost}₮`);
    }
  }
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
