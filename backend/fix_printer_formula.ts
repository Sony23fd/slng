import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updates = [
    {
      name: 'Хэвлэгч',
      expression: 'total_base_sheets',
    }
  ];

  for (const update of updates) {
    const items = await prisma.masterprice.findMany({
      where: {
        category: 'Ажиллагаа',
        item_name: {
          contains: update.name
        }
      },
      include: {
        formula: true
      }
    });

    for (const item of items) {
      if (item.formula) {
        await prisma.calculation_formula.update({
          where: { id: item.formula.id },
          data: { expression: update.expression }
        });
        console.log(`Updated formula for ${item.item_name} to ${update.expression}`);
      }
    }
  }

  console.log('Printer formulas fixed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
