import { PrismaClient } from '@prisma/client';

const initialConstants = [
  { type: 'CATEGORY', value: 'Ном' },
  { type: 'CATEGORY', value: 'Сэтгүүл' },
  { type: 'CATEGORY', value: 'Брошур' },
  { type: 'CATEGORY', value: 'Календарь' },
  { type: 'CATEGORY', value: 'Тор' },
  { type: 'CATEGORY', value: 'Хайрцаг' },
  { type: 'CATEGORY', value: 'Түргэн хэвлэл' },
  { type: 'CATEGORY', value: 'Флаер' },
  { type: 'CATEGORY', value: 'Нэрийн хуудас' },
  { type: 'CATEGORY', value: 'Урилга' },
  { type: 'CATEGORY', value: 'Меню' },
  { type: 'CATEGORY', value: 'Билет' },
  { type: 'CATEGORY', value: 'Албан бланк' },
  { type: 'CATEGORY', value: 'Дугтуй' },
  { type: 'CATEGORY', value: 'Хавтас' },
  { type: 'CATEGORY', value: 'Стикер' },
  { type: 'CATEGORY', value: 'Дэвтэр' },
  { type: 'CATEGORY', value: 'Сертификат' },
  { type: 'CATEGORY', value: 'Постер' },
  { type: 'CATEGORY', value: 'Шошго' },
  { type: 'SIZE', value: 'A2' },
  { type: 'SIZE', value: 'A3' },
  { type: 'SIZE', value: 'A4' },
  { type: 'SIZE', value: 'A5' },
  { type: 'SIZE', value: 'A6' },
  { type: 'SIZE', value: 'B2' },
  { type: 'SIZE', value: 'B4' },
  { type: 'SIZE', value: 'B5' },
  { type: 'SIZE', value: 'B6' },
  { type: 'SIZE', value: 'Custom' },
  { type: 'COVER_COLOR', value: '4+0', description: 'Нэг тал өнгөт' },
  { type: 'COVER_COLOR', value: '4+4', description: 'Хоёр тал өнгөт' },
  { type: 'COVER_COLOR', value: '2+0', description: 'Нэг тал 2 өнгөт (Өнгөтэй өнгөгүй)' },
  { type: 'COVER_COLOR', value: '2+2', description: 'Хоёр тал 2 өнгөт' },
  { type: 'COVER_COLOR', value: '1+0', description: 'Нэг тал 1 өнгөт' },
  { type: 'COVER_COLOR', value: '1+1', description: 'Хоёр тал 1 өнгөт' },
  { type: 'INNER_COLOR', value: '1+1', description: 'Хоёр тал 1 өнгөт (Хар цагаан)' },
  { type: 'INNER_COLOR', value: '1+0', description: 'Нэг тал 1 өнгөт' },
  { type: 'INNER_COLOR', value: '2+2', description: 'Хоёр тал 2 өнгөт' },
  { type: 'INNER_COLOR', value: '2+0', description: 'Нэг тал 2 өнгөт (Өнгөтэй өнгөгүй)' },
  { type: 'INNER_COLOR', value: '4+4', description: 'Хоёр тал өнгөт' },
  { type: 'INNER_COLOR', value: '4+0', description: 'Нэг тал өнгөт' },
  { type: 'PAYMENT_METHOD', value: 'Бэлэн' },
  { type: 'PAYMENT_METHOD', value: 'Данс' },
  { type: 'PAYMENT_METHOD', value: 'Карт' },
  { type: 'NEXT_PROCESS', value: 'Эх бэлтгэл' },
  { type: 'NEXT_PROCESS', value: 'Түүхий эд бэлтгэх' },
  { type: 'CTP_PLATE_PRICE', value: '8800', description: 'Том CTP хавтан 76*60.5 / 74.5*60.5 (Komori, 4 өнгөт, B2/A2)' },
  { type: 'CTP_PLATE_PRICE_SMALL', value: '6800', description: 'Жижиг CTP хавтан 65*55 (Ryobi, 1 өнгөт, B3/A3)' },
  { type: 'ORDER_STATUS', value: 'Үнийн санал' },
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
          value: c.value,
          description: (c as any).description || null
        }
      });
      console.log(`Added ${c.type}: ${c.value}`);
    } else if ((c as any).description && existing.description !== (c as any).description) {
      await prisma.constant.update({
        where: { id: existing.id },
        data: { description: (c as any).description }
      });
      console.log(`Updated ${c.type}: ${c.value} description`);
    }
  }
  console.log('Done constants!');
}
