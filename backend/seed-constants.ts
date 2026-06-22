import { PrismaClient } from '@prisma/client';

const initialConstants = [
  { type: 'CATEGORY', value: 'Ном' },
  { type: 'CATEGORY', value: 'Сэтгүүл' },
  { type: 'CATEGORY', value: 'Брошур' },
  { type: 'CATEGORY', value: 'Календарь' },
  { type: 'SIZE', value: 'A4' },
  { type: 'SIZE', value: 'A5' },
  { type: 'SIZE', value: 'B5' },
  { type: 'SIZE', value: 'Custom' },
  { type: 'COVER_COLOR', value: '4+0' },
  { type: 'COVER_COLOR', value: '4+4' },
  { type: 'INNER_COLOR', value: '1+0' },
  { type: 'INNER_COLOR', value: '1+1' },
  { type: 'INNER_COLOR', value: '4+4' },
  { type: 'PAYMENT_METHOD', value: 'Бэлэн' },
  { type: 'PAYMENT_METHOD', value: 'Данс' },
  { type: 'PAYMENT_METHOD', value: 'Карт' },
  { type: 'NEXT_PROCESS', value: 'Эх бэлтгэл' },
  { type: 'NEXT_PROCESS', value: 'Түүхий эд бэлтгэх' },
  { type: 'CTP_PLATE_PRICE', value: '8800' },
  { type: 'ORDER_STATUS', value: 'Шинэ захиалга' },
  { type: 'ORDER_STATUS', value: 'Эх бэлтгэл' },
  { type: 'ORDER_STATUS', value: 'Хэвлэл' },
  { type: 'ORDER_STATUS', value: 'Дардас' },
  { type: 'ORDER_STATUS', value: 'Бэлэн' },
  { type: 'ORDER_STATUS', value: 'Олгосон' },

];

export async function seedConstants(prisma: PrismaClient) {
  console.log('Seeding constants...');
  for (const c of initialConstants) {
    const existing = await prisma.constant.findFirst({
      where: { type: c.type, value: c.value }
    });
    if (!existing) {
      await prisma.constant.create({
        data: {
          type: c.type,
          value: c.value
        }
      });
      console.log(`Added ${c.type}: ${c.value}`);
    }
  }
  console.log('Done constants!');
}
