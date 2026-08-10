import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateRandomString = (length: number) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (startDaysAgo: number, endDaysAhead: number) => {
  const date = new Date();
  const offset = getRandomInt(startDaysAgo * -1, endDaysAhead);
  date.setDate(date.getDate() + offset);
  return date;
};

// Хэвийн явцыг симуляци хийх
const generateProductionStages = (progressType: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MIXED') => {
  const stages = ['prep', 'material', 'plate', 'print', 'check', 'fold', 'bind'];
  const data: any = {};
  
  if (progressType === 'NOT_STARTED') {
    stages.forEach(s => data[s] = { status: 0 });
  } else if (progressType === 'COMPLETED') {
    stages.forEach(s => data[s] = { status: 100, operator: 'Автомат систем', date: new Date().toISOString() });
  } else if (progressType === 'IN_PROGRESS') {
    data['prep'] = { status: 100, operator: 'Баттөр', date: new Date().toISOString() };
    data['material'] = { status: 100, operator: 'Энхээ', date: new Date().toISOString() };
    data['plate'] = { status: 100, operator: 'Ганаа', date: new Date().toISOString() };
    data['print'] = { status: 50, operator: 'Хэвлэгч 1', machine: 'Хэвлэлийн машин' };
    data['check'] = { status: 0 };
    data['fold'] = { status: 0 };
    data['bind'] = { status: 0 };
  } else {
    // MIXED
    stages.forEach(s => {
      const statuses = [0, 50, 100];
      data[s] = { status: getRandomElement(statuses) };
      if (data[s].status === 100) data[s].operator = 'Оператор ' + getRandomInt(1, 5);
      else if (data[s].status === 50) data[s].machine = 'Машин ' + getRandomInt(1, 3);
    });
  }
  return data;
};

const DEMO_CUSTOMERS = [
  "Голомт банк", "Хаан банк", "АПУ ХК", "М-Си-Эс", "Юнител",
  "СКАЙтел", "Мобиком", "Номин Холдинг", "Тэсо", "Говь ХК",
  "Жүр Үр", "Мах Импэкс", "Моннис", "Улаанбаатар Групп", "Скайтек"
];

const SALES_PERSONS = [
  { id: 1, name: 'Админ (Тест)' }, // Fallback to admin if no sales exists
];

async function main() {
  console.log("Seeding demo orders...");

  // Get some users for sales person
  const users = await prisma.user.findMany({ where: { role: 'SALES' } });
  const adminUsers = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  const allUsers = [...users, ...adminUsers];
  
  if (allUsers.length > 0) {
    SALES_PERSONS.length = 0;
    allUsers.forEach(u => SALES_PERSONS.push({ id: u.id, name: u.name }));
  }

  // Delete old demo orders
  await prisma.order.deleteMany({
    where: { order_number: { startsWith: 'DEMO-' } }
  });
  console.log("Old demo orders deleted.");

  // Create 30 orders
  for (let i = 0; i < 30; i++) {
    const customer = getRandomElement(DEMO_CUSTOMERS);
    const salesPerson = getRandomElement(SALES_PERSONS);
    
    // We now have 9 types
    const type = getRandomInt(1, 9);
    const isUrgent = Math.random() > 0.8;
    const qty = getRandomElement([50, 100, 200, 500, 1000, 2000, 5000]);
    const progressType = getRandomElement(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MIXED'] as const);
    
    const createdAt = getRandomDate(10, 0); // up to 10 days ago
    const deadline = getRandomDate(-2, 14); // deadline from 2 days ago to 14 days ahead

    let orderData: any = {
      customer_name: customer,
      phone: `99${getRandomInt(100000, 999999)}`,
      deadline: deadline,
      total_qty: qty,
      needs_design: Math.random() > 0.5,
      design_status: Math.random() > 0.5 ? "Эх бэлтгэл хийх" : "Эх бэлэн",
      design_cost: Math.random() > 0.5 ? 50000 : 0,
      is_urgent: isUrgent,
      sales_person_name: salesPerson.name,
      sales_person_id: salesPerson.id,
      has_vat: Math.random() > 0.5,
      current_status: progressType === 'COMPLETED' ? "Бэлэн болсон" : (progressType === 'NOT_STARTED' ? "Хүлээгдэж буй" : "Үйлдвэрлэлд"),
      production_stages: generateProductionStages(progressType),
      createdAt: createdAt,
      order_number: `DEMO-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${generateRandomString(4)}`
    };

    let materials = [];
    let operations = [];
    let specifications: any = null;
    let notes = isUrgent ? "Маш яаралтай гаргах шаардлагатай! Хугацааг анхаарна уу." : (Math.random() > 0.8 ? "Хүргэлт хийлгэх" : null);

    // 1. Цаасан тор
    if (type === 1) {
      orderData.product_name = "Цаасан тор";
      orderData.category = "Тор";
      orderData.size = "Custom";
      orderData.sub_size = "250x350x100";
      
      const matNotes = Math.random() > 0.7 ? "Цаасаа зөв харж хэвлэнэ үү!" : null;
      materials.push({
        material_name: "Шохойтой цаас 250гр",
        size: "B2",
        print_size: "B2",
        press_sheet: "1",
        base_qty: qty,
        extra_qty: 30, // хадаас
        is_cover: false,
        total_qty: qty + 30,
        divide_by: 2,
        unit_cost: 350,
        total_cost: ((qty + 30) / 2) * 350,
        notes: matNotes
      });
      
      const opNotes = Math.random() > 0.8 ? "Оосор сайн уях" : null;
      operations.push({
        operation_name: "Оосор (Хос)",
        qty: qty * 2,
        unit_cost: 200,
        total_cost: qty * 2 * 200,
        notes: opNotes
      });
      
      orderData.final_price = materials[0].total_cost + operations[0].total_cost + orderData.design_cost + 50000;
    }
    // 2. Брошур
    else if (type === 2) {
      orderData.product_name = "Брошур / Танилцуулга";
      orderData.category = "Брошур";
      orderData.size = "A4";
      orderData.binding_type = "Үдээстэй";
      
      specifications = {
        cover_color: "4+0 (Өнгөт)",
        inner_color: "4+4 (Хоёр тал өнгөт)",
        total_pages: 16
      };
      
      materials.push({
        material_name: "Шохойтой цаас 250гр (Хавтас)",
        size: "A3",
        print_size: "A3",
        press_sheet: "1",
        base_qty: qty,
        extra_qty: 20,
        is_cover: true,
        total_qty: qty + 20,
        divide_by: 2,
        unit_cost: 250,
        total_cost: ((qty + 20) / 2) * 250
      });
      
      materials.push({
        material_name: "Шохойтой цаас 150гр (Дотор)",
        size: "A3",
        print_size: "A3",
        press_sheet: "4",
        base_qty: qty * 4,
        extra_qty: 50,
        is_cover: false,
        total_qty: qty * 4 + 50,
        divide_by: 4,
        unit_cost: 150,
        total_cost: ((qty * 4 + 50) / 4) * 150
      });
      
      operations.push({
        operation_name: "Үдээс",
        qty: qty,
        unit_cost: 50,
        total_cost: qty * 50
      });
      
      orderData.final_price = materials.reduce((a, b) => a + b.total_cost, 0) + operations[0].total_cost + orderData.design_cost + 100000;
    }
    // 3. Нэрийн хуудас
    else if (type === 3) {
      orderData.product_name = "Нэрийн хуудас";
      orderData.category = "Бичиг хэрэг";
      orderData.size = "Custom";
      orderData.sub_size = "90x50";
      
      materials.push({
        material_name: "Матт цаас 300гр",
        size: "A3",
        print_size: "A3",
        press_sheet: "1",
        base_qty: Math.ceil(qty / 24),
        extra_qty: 2,
        is_cover: false,
        total_qty: Math.ceil(qty / 24) + 2,
        divide_by: 1,
        unit_cost: 500,
        total_cost: (Math.ceil(qty / 24) + 2) * 500
      });
      
      operations.push({
        operation_name: "Зүсэлт",
        qty: qty,
        unit_cost: 10,
        total_cost: qty * 10
      });
      
      orderData.final_price = materials[0].total_cost + operations[0].total_cost + orderData.design_cost + 20000;
    }
    // 4. Түргэн хэвлэл
    else if (type === 4) {
      orderData.product_name = "Түргэн хэвлэл";
      orderData.category = "Түргэн хэвлэл";
      orderData.size = "A3";
      orderData.is_urgent = true;
      notes = "Түргэн хэвлэл - Үйлчлүүлэгч хүлээж байна!";
      
      materials.push({
        material_name: "Энгийн цаас 80гр",
        size: "A3",
        print_size: "A3",
        press_sheet: "1",
        base_qty: qty,
        extra_qty: 0,
        is_cover: false,
        total_qty: qty,
        divide_by: 1,
        unit_cost: 100,
        total_cost: qty * 100
      });
      
      orderData.final_price = materials[0].total_cost + orderData.design_cost + 10000;
    }
    // 5. Ажлын үнэмлэх
    else if (type === 5) {
      orderData.product_name = "Ажлын үнэмлэх";
      orderData.category = "Бичиг хэрэг";
      orderData.size = "Custom";
      orderData.sub_size = "54x86";
      
      materials.push({
        material_name: "PVC хуванцар (А4)",
        size: "A4",
        print_size: "A4",
        press_sheet: "1",
        base_qty: Math.ceil(qty / 10),
        extra_qty: 1,
        is_cover: false,
        total_qty: Math.ceil(qty / 10) + 1,
        divide_by: 1,
        unit_cost: 1500,
        total_cost: (Math.ceil(qty / 10) + 1) * 1500
      });
      
      operations.push({
        operation_name: "Зүсэлт + Цоолбор",
        qty: qty,
        unit_cost: 150,
        total_cost: qty * 150
      });
      
      orderData.final_price = materials[0].total_cost + operations[0].total_cost + orderData.design_cost + 30000;
    }
    // 6. Ном
    else if (type === 6) {
      orderData.product_name = "Ном";
      orderData.category = "Ном";
      orderData.size = "A5";
      orderData.binding_type = "Наалттай";
      
      specifications = {
        cover_color: "4+0 (Өнгөт)",
        inner_color: "1+1 (Хар цагаан)",
        total_pages: 120
      };
      
      materials.push({
        material_name: "Шохойтой цаас 300гр (Хавтас)",
        size: "A3",
        print_size: "A3",
        press_sheet: "1",
        base_qty: qty,
        extra_qty: 15,
        is_cover: true,
        total_qty: qty + 15,
        divide_by: 2,
        unit_cost: 250,
        total_cost: Math.ceil((qty + 15) / 2) * 250
      });
      
      materials.push({
        material_name: "Энгийн цаас 80гр (Дотор)",
        size: "A3",
        print_size: "A3",
        press_sheet: "30", // 120 pages / 4 = 30 A3s per book
        base_qty: qty * 30,
        extra_qty: 200,
        is_cover: false,
        total_qty: qty * 30 + 200,
        divide_by: 4,
        unit_cost: 80,
        total_cost: Math.ceil((qty * 30 + 200) / 4) * 80
      });
      
      operations.push({
        operation_name: "Цавуут наалт (Хавтаслалт)",
        qty: qty,
        unit_cost: 300,
        total_cost: qty * 300
      });
      
      operations.push({
        operation_name: "Гялгар бүрэлт",
        qty: qty,
        unit_cost: 250,
        total_cost: qty * 250
      });
      
      orderData.final_price = materials.reduce((a, b) => a + b.total_cost, 0) + operations.reduce((a, b) => a + b.total_cost, 0) + orderData.design_cost + 200000;
    }
    // 7. Ханын календарь
    else if (type === 7) {
      orderData.product_name = "Ханын календарь";
      orderData.category = "Календарь";
      orderData.size = "A3";
      orderData.binding_type = "Пүрштэй";
      
      specifications = {
        cover_color: "4+0",
        inner_color: "4+0",
        total_pages: 7 // 1 нүүр хавтас + 6 нүүр (хоёр сар нэг нүүрт)
      };
      
      materials.push({
        material_name: "Матт цаас 250гр",
        size: "A2",
        print_size: "A2",
        press_sheet: "4", // (7 pages fits in 4 A3s, so 2 A2s, wait, let's say 4 A3s = 2 A2s)
        base_qty: qty * 2, // 2 A2 per calendar
        extra_qty: 25,
        is_cover: false,
        total_qty: qty * 2 + 25,
        divide_by: 2,
        unit_cost: 500,
        total_cost: Math.ceil((qty * 2 + 25) / 2) * 500
      });
      
      operations.push({
        operation_name: "Пүрштэй үдээс",
        qty: qty,
        unit_cost: 450,
        total_cost: qty * 450
      });
      
      operations.push({
        operation_name: "Өлгүүр",
        qty: qty,
        unit_cost: 150,
        total_cost: qty * 150
      });
      
      orderData.final_price = materials[0].total_cost + operations.reduce((a, b) => a + b.total_cost, 0) + orderData.design_cost + 80000;
    }
    // 8. А5 Календарь (Ширээний)
    else if (type === 8) {
      orderData.product_name = "А5 Ширээний календарь";
      orderData.category = "Календарь";
      orderData.size = "A5";
      orderData.binding_type = "Пүрштэй";
      
      specifications = {
        cover_color: "4+4",
        inner_color: "4+4",
        total_pages: 14 // 14 leaves
      };
      
      materials.push({
        material_name: "Суурь картон 2мм",
        size: "B2",
        print_size: "B2",
        press_sheet: "1",
        base_qty: Math.ceil(qty / 4), // 4 bases from B2
        extra_qty: 5,
        is_cover: true,
        total_qty: Math.ceil(qty / 4) + 5,
        divide_by: 1,
        unit_cost: 1200,
        total_cost: (Math.ceil(qty / 4) + 5) * 1200
      });
      
      materials.push({
        material_name: "Шохойтой цаас 200гр",
        size: "A3",
        print_size: "A3",
        press_sheet: "4", // 14 A5s = 3.5 A3s
        base_qty: qty * 4,
        extra_qty: 40,
        is_cover: false,
        total_qty: qty * 4 + 40,
        divide_by: 4,
        unit_cost: 200,
        total_cost: Math.ceil((qty * 4 + 40) / 4) * 200
      });
      
      operations.push({
        operation_name: "Пүрштэй үдээс (Богино)",
        qty: qty,
        unit_cost: 350,
        total_cost: qty * 350
      });
      
      orderData.final_price = materials.reduce((a, b) => a + b.total_cost, 0) + operations[0].total_cost + orderData.design_cost + 150000;
    }
    // 9. В5 Календарь (Ширээний)
    else {
      orderData.product_name = "В5 Ширээний календарь";
      orderData.category = "Календарь";
      orderData.size = "B5";
      orderData.binding_type = "Пүрштэй";
      
      specifications = {
        cover_color: "4+4",
        inner_color: "4+4",
        total_pages: 14 // 14 leaves
      };
      
      materials.push({
        material_name: "Суурь картон 2мм",
        size: "B2",
        print_size: "B2",
        press_sheet: "1",
        base_qty: Math.ceil(qty / 3), // 3 bases from B2
        extra_qty: 5,
        is_cover: true,
        total_qty: Math.ceil(qty / 3) + 5,
        divide_by: 1,
        unit_cost: 1200,
        total_cost: (Math.ceil(qty / 3) + 5) * 1200
      });
      
      materials.push({
        material_name: "Шохойтой цаас 200гр",
        size: "B3",
        print_size: "B3",
        press_sheet: "4", // 14 B5s = 3.5 B3s
        base_qty: qty * 4,
        extra_qty: 40,
        is_cover: false,
        total_qty: qty * 4 + 40,
        divide_by: 4,
        unit_cost: 250,
        total_cost: Math.ceil((qty * 4 + 40) / 4) * 250
      });
      
      operations.push({
        operation_name: "Пүрштэй үдээс",
        qty: qty,
        unit_cost: 400,
        total_cost: qty * 400
      });
      
      orderData.final_price = materials.reduce((a, b) => a + b.total_cost, 0) + operations[0].total_cost + orderData.design_cost + 180000;
    }

    orderData.notes = notes;
    orderData.profit_margin = 30; // 30% profit margin mock

    // Insert order
    await prisma.order.create({
      data: {
        ...orderData,
        materials: {
          create: materials
        },
        operations: {
          create: operations
        },
        specifications: specifications ? {
          create: specifications
        } : undefined
      }
    });

    console.log(`Created order ${i+1}/30: ${orderData.product_name}`);
  }

  console.log("Demo orders seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
