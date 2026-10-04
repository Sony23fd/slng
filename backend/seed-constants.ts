import { PrismaClient } from '@prisma/client';

const initialConstants = [
  { type: 'CATEGORY', value: 'Танилцуулга' },
  { type: 'CATEGORY', value: 'Бланк' },
  { type: 'CATEGORY', value: 'Даралт' },
  { type: 'CATEGORY', value: 'Зурагт хуудас' },
  { type: 'CATEGORY', value: 'Календар' },
  { type: 'CATEGORY', value: 'Ном хар' },
  { type: 'CATEGORY', value: 'Ном өнгөт' },
  { type: 'CATEGORY', value: 'Сонин' },
  { type: 'CATEGORY', value: 'Сэтгүүл' },
  { type: 'CATEGORY', value: 'Түргэн хэвлэл Konica' },
  { type: 'CATEGORY', value: 'Тор' },
  { type: 'CATEGORY', value: 'Хортой маягт' },
  { type: 'CATEGORY', value: 'Шошго' },
  { type: 'CATEGORY', value: 'Дэвтэр' },
  { type: 'CATEGORY', value: 'EPSON' },
  { type: 'CATEGORY', value: 'Маягт' },
  { type: 'CATEGORY', value: 'Хавтас' },
  { type: 'CATEGORY', value: 'Дугтуй' },
  { type: 'CATEGORY', value: 'Урилга' },
  { type: 'CATEGORY', value: 'Меню' },
  { type: 'CATEGORY', value: 'Нэрийн хуудас' },
  { type: 'CATEGORY', value: 'Дахин хэвлэлт' },
  { type: 'CATEGORY', value: 'Промо' },
  { type: 'CATEGORY', value: 'Билет' },
  { type: 'CATEGORY', value: 'Бал' },
  { type: 'CATEGORY', value: 'Шуурхай принт' },
  { type: 'CATEGORY', value: 'Бусад' },
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
  { type: 'BAG_SIZE', value: '24x32x8', description: 'А4 Дунд тор (24х32х8 см)' },
  { type: 'BAG_SIZE', value: '30x40x10', description: 'А3 Том тор (30х40х10 см)' },
  { type: 'BAG_SIZE', value: '18x25x7', description: 'А5 Жижиг тор (18х25х7 см)' },
  { type: 'BAG_SIZE', value: '32x24x10', description: 'Хэвтээ тор (32х24х10 см)' },
  { type: 'BAG_SIZE', value: '12x36x10', description: 'Дарсны тор (12х36х10 см)' },
  { type: 'COVER_COLOR', value: '4+0', description: 'Нэг тал өнгөт' },
  { type: 'COVER_COLOR', value: '4+1', description: 'Нэг тал өнгөт + 1 өнгө' },
  { type: 'COVER_COLOR', value: '4+2', description: 'Нэг тал өнгөт + 2 өнгө' },
  { type: 'COVER_COLOR', value: '4+4', description: 'Хоёр тал өнгөт' },
  { type: 'COVER_COLOR', value: '2+0', description: 'Нэг тал 2 өнгөт (Өнгөтэй өнгөгүй)' },
  { type: 'COVER_COLOR', value: '2+1', description: 'Нэг тал 2 өнгөт + 1 өнгө' },
  { type: 'COVER_COLOR', value: '2+2', description: 'Хоёр тал 2 өнгөт' },
  { type: 'COVER_COLOR', value: '1+0', description: 'Нэг тал 1 өнгөт' },
  { type: 'COVER_COLOR', value: '1+1', description: 'Хоёр тал 1 өнгөт' },
  { type: 'INNER_COLOR', value: '1+1', description: 'Хоёр тал 1 өнгөт (Хар цагаан)' },
  { type: 'INNER_COLOR', value: '1+0', description: 'Нэг тал 1 өнгөт' },
  { type: 'INNER_COLOR', value: '2+2', description: 'Хоёр тал 2 өнгөт' },
  { type: 'INNER_COLOR', value: '2+1', description: 'Нэг тал 2 өнгөт + 1 өнгө' },
  { type: 'INNER_COLOR', value: '2+0', description: 'Нэг тал 2 өнгөт (Өнгөтэй өнгөгүй)' },
  { type: 'INNER_COLOR', value: '4+4', description: 'Хоёр тал өнгөт' },
  { type: 'INNER_COLOR', value: '4+2', description: 'Нэг тал өнгөт + 2 өнгө' },
  { type: 'INNER_COLOR', value: '4+1', description: 'Нэг тал өнгөт + 1 өнгө' },
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
