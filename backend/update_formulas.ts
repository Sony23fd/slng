import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updates = [
    {
      name: 'Шугамах',
      expression: 'total_base_sheets',
    },
    {
      name: 'Нугалаас',
      expression: 'inner_base_sheets',
    },
    {
      name: 'Цуглуулга',
      expression: 'inner_base_sheets',
    },
    {
      name: 'Хэвлэгч-4',
      expression: 'total_base_sheets + (press_sheet * 50) + 100', // A reasonable waste formula
    },
    {
      name: 'Хэвлэгч-1',
      expression: 'total_base_sheets + (press_sheet * 50) + 100', // A reasonable waste formula
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
      } else {
        const formulaName = `Formula for ${item.item_name}`;
        let formula = await prisma.calculation_formula.findUnique({
          where: { name: formulaName }
        });
        if (!formula) {
          formula = await prisma.calculation_formula.create({
            data: {
              name: formulaName,
              expression: update.expression
            }
          });
        }
        await prisma.masterprice.update({
          where: { id: item.id },
          data: { formula_id: formula.id }
        });
        console.log(`Created and attached formula for ${item.item_name} as ${update.expression}`);
      }
    }
  }

  console.log('Formulas updated successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
