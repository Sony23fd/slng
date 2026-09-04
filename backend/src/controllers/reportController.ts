import { Request, Response } from 'express';
import PptxGenJS from 'pptxgenjs';
import prisma from '../db';

// Helper to format currency
const formatMNT = (amount: number): string => {
  return (Math.round(amount) || 0).toLocaleString('en-US') + '₮';
};

// Helper to calculate full month metrics
export const aggregateMonthlyReport = async (year: number, month: number) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Previous month for MoM comparison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStartDate = new Date(Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0));
  const prevEndDate = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));

  // 1. Sales Target
  const targetRecord = await prisma.sales_target.findUnique({
    where: { year_month: { year, month } }
  });
  const totalTarget = targetRecord?.target_amount || 0;
  const managerTargets: Array<{ manager_id?: number; manager_name: string; target: number }> = 
    (targetRecord?.manager_targets as any) || [];

  // 2. Orders in the period (exclude Cancelled)
  const currentOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      current_status: { not: 'Цуцлагдсан' }
    },
    include: {
      user: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // All orders including cancelled for pipeline count
  const allOrdersInMonth = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    select: { id: true, current_status: true, deadline: true, createdAt: true, updatedAt: true }
  });

  // Previous Month Orders
  const prevOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: prevStartDate, lte: prevEndDate },
      current_status: { not: 'Цуцлагдсан' }
    },
    select: { final_price: true }
  });

  // 3. Customer Gifts
  const customerGifts = await prisma.customer_gift.findMany({
    where: { year, month },
    orderBy: { createdAt: 'desc' }
  });

  // --- Executive Summary ---
  const totalRevenue = currentOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);
  const totalOrdersCount = currentOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const achievementRate = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;

  const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);
  const momGrowthRate = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // --- Manager Performance ---
  const managerMap = new Map<string, {
    name: string;
    target: number;
    actual: number;
    orderCount: number;
    barterAmount: number;
    donationAmount: number;
  }>();

  // Initialize with pre-set manager targets if any
  managerTargets.forEach(mt => {
    managerMap.set(mt.manager_name, {
      name: mt.manager_name,
      target: Number(mt.target) || 0,
      actual: 0,
      orderCount: 0,
      barterAmount: 0,
      donationAmount: 0
    });
  });

  currentOrders.forEach(o => {
    const mgrName = o.sales_person_name || (o.user ? o.user.name : 'Бусад / Оноогоогүй');
    const existing = managerMap.get(mgrName) || {
      name: mgrName,
      target: 0,
      actual: 0,
      orderCount: 0,
      barterAmount: 0,
      donationAmount: 0
    };

    const price = o.final_price || 0;
    existing.orderCount += 1;
    existing.actual += price;

    if (o.order_type === 'BARTER') {
      existing.barterAmount += price;
    } else if (o.order_type === 'DONATION') {
      existing.donationAmount += price;
    }

    managerMap.set(mgrName, existing);
  });

  const managerStats = Array.from(managerMap.values()).map(m => ({
    ...m,
    achievementRate: m.target > 0 ? (m.actual / m.target) * 100 : 0
  })).sort((a, b) => b.actual - a.actual);

  // --- Lead Sources ---
  const leadSourceMap = new Map<string, { count: number; revenue: number }>();
  currentOrders.forEach(o => {
    const src = o.lead_source || 'Бусад / Шууд';
    const entry = leadSourceMap.get(src) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += (o.final_price || 0);
    leadSourceMap.set(src, entry);
  });
  const leadSources = Array.from(leadSourceMap.entries()).map(([source, data]) => ({
    source,
    count: data.count,
    revenue: data.revenue,
    percent: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
  })).sort((a, b) => b.revenue - a.revenue);

  // --- Order Types (Standard, Barter, Donation) ---
  const orderTypeMap = {
    STANDARD: { name: 'Энгийн борлуулалт', count: 0, revenue: 0 },
    BARTER: { name: 'Бартер захиалга', count: 0, revenue: 0 },
    DONATION: { name: 'Хандив / Дэмжлэг', count: 0, revenue: 0 }
  };
  currentOrders.forEach(o => {
    const type = (o.order_type || 'STANDARD') as 'STANDARD' | 'BARTER' | 'DONATION';
    if (orderTypeMap[type]) {
      orderTypeMap[type].count += 1;
      orderTypeMap[type].revenue += (o.final_price || 0);
    } else {
      orderTypeMap.STANDARD.count += 1;
      orderTypeMap.STANDARD.revenue += (o.final_price || 0);
    }
  });
  const orderTypes = Object.entries(orderTypeMap).map(([key, item]) => ({
    key,
    name: item.name,
    count: item.count,
    revenue: item.revenue,
    percent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
  }));

  // --- Customer Segments (B2B vs B2C vs State) ---
  let b2bCount = 0;
  let b2bRevenue = 0;
  let b2cCount = 0;
  let b2cRevenue = 0;

  currentOrders.forEach(o => {
    const isB2B = Boolean(o.company_name || o.company_registry);
    if (isB2B) {
      b2bCount += 1;
      b2bRevenue += (o.final_price || 0);
    } else {
      b2cCount += 1;
      b2cRevenue += (o.final_price || 0);
    }
  });

  const customerSegments = [
    { name: 'Байгууллага (B2B)', count: b2bCount, revenue: b2bRevenue, percent: totalRevenue > 0 ? (b2bRevenue / totalRevenue) * 100 : 0 },
    { name: 'Хувь хүн (B2C)', count: b2cCount, revenue: b2cRevenue, percent: totalRevenue > 0 ? (b2cRevenue / totalRevenue) * 100 : 0 }
  ];

  // --- Top 10 Customers ---
  const customerMap = new Map<string, {
    customer_name: string;
    company_name: string;
    orderCount: number;
    totalAmount: number;
  }>();

  currentOrders.forEach(o => {
    const key = (o.customer_name || 'Нэргүй').trim();
    const existing = customerMap.get(key) || {
      customer_name: key,
      company_name: o.company_name || '',
      orderCount: 0,
      totalAmount: 0
    };
    existing.orderCount += 1;
    existing.totalAmount += (o.final_price || 0);
    if (!existing.company_name && o.company_name) {
      existing.company_name = o.company_name;
    }
    customerMap.set(key, existing);
  });

  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((c, index) => ({
      rank: index + 1,
      ...c,
      percentOfTotal: totalRevenue > 0 ? (c.totalAmount / totalRevenue) * 100 : 0
    }));

  // --- Product Categories ---
  const categoryMap = new Map<string, { count: number; revenue: number }>();
  currentOrders.forEach(o => {
    const cat = o.category || 'Бусад бүтээгдэхүүн';
    const entry = categoryMap.get(cat) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += (o.final_price || 0);
    categoryMap.set(cat, entry);
  });
  const productCategories = Array.from(categoryMap.entries()).map(([category, item]) => ({
    category,
    count: item.count,
    revenue: item.revenue,
    percent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
  })).sort((a, b) => b.revenue - a.revenue);

  // --- Barter & Donation Order List ---
  const barterAndDonationOrders = currentOrders
    .filter(o => o.order_type === 'BARTER' || o.order_type === 'DONATION')
    .map(o => ({
      id: o.id,
      order_number: o.order_number || `#${o.id}`,
      customer_name: o.customer_name,
      company_name: o.company_name,
      product_name: o.product_name,
      final_price: o.final_price,
      order_type: o.order_type === 'BARTER' ? 'Бартер' : 'Хандив',
      createdAt: o.createdAt,
      notes: o.notes || o.finance_notes || '-'
    }));

  // --- Pipeline & Order Status ---
  const statusMap = new Map<string, number>();
  allOrdersInMonth.forEach(o => {
    const st = o.current_status || 'Хүлээгдэж буй';
    statusMap.set(st, (statusMap.get(st) || 0) + 1);
  });
  const orderStatuses = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percent: allOrdersInMonth.length > 0 ? (count / allOrdersInMonth.length) * 100 : 0
  }));

  // On-time vs delayed delivery calculation
  const completedOrders = allOrdersInMonth.filter(o => ['Бэлэн', 'Бэлэн болсон', 'Олгосон', 'Хүлээлгэн өгсөн'].includes(o.current_status));
  let onTimeCount = 0;
  let delayedCount = 0;
  completedOrders.forEach(o => {
    if (o.deadline) {
      if (new Date(o.updatedAt) <= new Date(o.deadline)) {
        onTimeCount += 1;
      } else {
        delayedCount += 1;
      }
    } else {
      onTimeCount += 1; // On-time if no strict deadline
    }
  });

  // --- Payments & Receivables ---
  let totalPaymentsReceived = 0;
  let ebarimtCount = 0;
  let ebarimtAmount = 0;

  currentOrders.forEach(o => {
    const paidForOrder = (o.payments || []).reduce((pSum, p) => pSum + (p.amount || 0), 0);
    totalPaymentsReceived += paidForOrder;
    if (o.needs_ebarimt) {
      ebarimtCount += 1;
      ebarimtAmount += (o.final_price || 0);
    }
  });

  const totalReceivables = Math.max(0, totalRevenue - totalPaymentsReceived);

  return {
    period: { year, month, startDate, endDate },
    summary: {
      totalTarget,
      totalRevenue,
      achievementRate,
      totalOrdersCount,
      avgOrderValue,
      prevRevenue,
      momGrowthRate
    },
    managerStats,
    leadSources,
    orderTypes,
    customerSegments,
    topCustomers,
    productCategories,
    barterAndDonationOrders,
    orderPipeline: {
      statuses: orderStatuses,
      totalOrders: allOrdersInMonth.length,
      completedOrdersCount: completedOrders.length,
      onTimeCount,
      delayedCount,
      onTimeRate: completedOrders.length > 0 ? (onTimeCount / completedOrders.length) * 100 : 100
    },
    financials: {
      totalInvoiced: totalRevenue,
      totalPaid: totalPaymentsReceived,
      totalReceivables,
      collectionRate: totalRevenue > 0 ? (totalPaymentsReceived / totalRevenue) * 100 : 0,
      ebarimtCount,
      ebarimtAmount
    },
    customerGifts
  };
};

// 1. GET JSON API
export const getMonthlyReportData = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;

    const data = await aggregateMonthlyReport(year, month);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching monthly report data:', error);
    res.status(500).json({ error: 'Failed to aggregate monthly report data', details: error.message });
  }
};

// 2. DOWNLOAD PPTX API
export const downloadMonthlyReportPptx = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;

    const data = await aggregateMonthlyReport(year, month);

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Selenge Press LLC';
    pptx.company = 'Сэлэнгэ Пресс ХХК';
    pptx.title = `${year} оны ${month}-р сарын Борлуулалтын тайлан`;

    const C = {
      darkBg: '0F172A',      // Slate 900
      cardDark: '1E293B',    // Slate 800
      lightBg: 'F8FAFC',     // Slate 50
      cardLight: 'FFFFFF',   // Pure White
      primary: '4F46E5',     // Indigo 600
      primaryLight: 'EEF2FF',// Indigo 50
      success: '059669',     // Emerald 600
      successLight: 'ECFDF5',// Emerald 50
      warning: 'D97706',     // Amber 600
      danger: 'DC2626',      // Red 600
      textWhite: 'FFFFFF',
      textDark: '0F172A',
      textMuted: '64748B',
      border: 'E2E8F0',
      headerFill: '1E293B',
      altRowFill: 'F1F5F9'
    };

    // Helper: Add Standard Header
    const addHeader = (slide: any, title: string, subtitle: string) => {
      slide.addText(title, {
        x: 0.6,
        y: 0.4,
        w: 9.5,
        h: 0.5,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: C.textDark
      });
      slide.addText(subtitle, {
        x: 0.6,
        y: 0.85,
        w: 9.5,
        h: 0.35,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.textMuted
      });
      // Right branding badge
      slide.addText(`СЭЛЭНГЭ ПРЕСС | ${year}.${String(month).padStart(2, '0')}`, {
        x: 9.8,
        y: 0.4,
        w: 2.9,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: C.primary,
        align: 'right'
      });
      // Subtle top divider
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.6,
        y: 1.25,
        w: 12.13,
        h: 0.02,
        fill: { color: C.border }
      });
    };

    // ==========================================
    // SLIDE 1: COVER SLIDE
    // ==========================================
    const s1 = pptx.addSlide();
    s1.background = { color: C.darkBg };

    // Decorative gradient-like accent box
    s1.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.4,
      h: 7.5,
      fill: { color: C.primary }
    });

    s1.addText('СЭЛЭНГЭ ПРЕСС ХХК', {
      x: 1.2,
      y: 1.8,
      w: 10,
      h: 0.5,
      fontSize: 16,
      fontFace: 'Arial',
      bold: true,
      color: '94A3B8',
      charSpacing: 3
    });

    s1.addText('БОРЛУУЛАЛТЫН САРЫН ТАЙЛАН', {
      x: 1.2,
      y: 2.3,
      w: 11,
      h: 1.2,
      fontSize: 34,
      fontFace: 'Arial',
      bold: true,
      color: C.textWhite
    });

    s1.addText(`${year} ОНЫ ${month}-Р САР`, {
      x: 1.2,
      y: 3.5,
      w: 10,
      h: 0.6,
      fontSize: 22,
      fontFace: 'Arial',
      bold: true,
      color: '60A5FA'
    });

    s1.addShape(pptx.ShapeType.rect, {
      x: 1.2,
      y: 4.4,
      w: 4.0,
      h: 0.04,
      fill: { color: C.primary }
    });

    s1.addText(`Үүсгэсэн огноо: ${now.toISOString().split('T')[0]}\nТайлангийн хамрах хүрээ: ${year}.${month}.01 - ${year}.${month}.${new Date(year, month, 0).getDate()}`, {
      x: 1.2,
      y: 4.8,
      w: 9,
      h: 0.8,
      fontSize: 12,
      fontFace: 'Arial',
      color: '94A3B8'
    });

    // ==========================================
    // SLIDE 2: KPI & EXECUTIVE SUMMARY
    // ==========================================
    const s2 = pptx.addSlide();
    s2.background = { color: C.lightBg };
    addHeader(s2, 'НИЙТ ГҮЙЦЭТГЭЛ БА ГОЛ ҮЗҮҮЛЭЛТҮҮД (KPI)', `${year} оны ${month}-р сарын ерөнхий борлуулалт, зорилтын биелэлт`);

    // 4 Top Cards
    const cards = [
      { title: 'Нийт борлуулалт', value: formatMNT(data.summary.totalRevenue), sub: `Биелэлт: ${data.summary.achievementRate.toFixed(1)}%`, bg: 'FFFFFF', color: C.primary },
      { title: 'Төлөвлөгөө / Зорилт', value: formatMNT(data.summary.totalTarget), sub: `Зөрүү: ${formatMNT(data.summary.totalRevenue - data.summary.totalTarget)}`, bg: 'FFFFFF', color: C.textDark },
      { title: 'Нийт захиалгын тоо', value: `${data.summary.totalOrdersCount} ш`, sub: `Дундаж захиалга: ${formatMNT(data.summary.avgOrderValue)}`, bg: 'FFFFFF', color: C.textDark },
      { title: 'Өмнөх сараас өсөлт', value: `${data.summary.momGrowthRate >= 0 ? '+' : ''}${data.summary.momGrowthRate.toFixed(1)}%`, sub: `Өмнөх сар: ${formatMNT(data.summary.prevRevenue)}`, bg: 'FFFFFF', color: data.summary.momGrowthRate >= 0 ? C.success : C.danger }
    ];

    cards.forEach((c, idx) => {
      const cardX = 0.6 + idx * 3.1;
      s2.addShape(pptx.ShapeType.rect, {
        x: cardX,
        y: 1.6,
        w: 2.85,
        h: 2.0,
        fill: { color: c.bg },
        line: { color: C.border, width: 1 }
      });
      s2.addText(c.title, {
        x: cardX + 0.2,
        y: 1.8,
        w: 2.45,
        h: 0.3,
        fontSize: 11,
        color: C.textMuted,
        bold: true
      });
      s2.addText(c.value, {
        x: cardX + 0.2,
        y: 2.2,
        w: 2.45,
        h: 0.6,
        fontSize: 18,
        color: c.color,
        bold: true
      });
      s2.addText(c.sub, {
        x: cardX + 0.2,
        y: 2.9,
        w: 2.45,
        h: 0.4,
        fontSize: 10,
        color: C.textMuted
      });
    });

    // Summary Box
    s2.addShape(pptx.ShapeType.rect, {
      x: 0.6,
      y: 4.0,
      w: 12.13,
      h: 2.8,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s2.addText('САРЫН ТОЙМ БА ГҮЙЦЭТГЭЛИЙН ДҮГНЭЛТ', {
      x: 0.9,
      y: 4.2,
      w: 11.5,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: C.primary
    });

    const summaryBullets = [
      `Тайлант хугацаанд нийт ${data.summary.totalOrdersCount} амжилттай захиалга бүртгэгдэж, ${formatMNT(data.summary.totalRevenue)} борлуулалт хийгдэв.`,
      `Борлуулалтын сарын төлөвлөгөө ${formatMNT(data.summary.totalTarget)} байснаас биелэлт ${data.summary.achievementRate.toFixed(1)}%-тай гарлаа.`,
      `Өмнөх сартай харьцуулахад борлуулалтын дүн ${data.summary.momGrowthRate >= 0 ? '+' : ''}${data.summary.momGrowthRate.toFixed(1)}%-ийн ${data.summary.momGrowthRate >= 0 ? 'өсөлттэй' : 'бууралттай'} байна.`,
      `Захиалга бүрийн дундаж үнийн дүн ${formatMNT(data.summary.avgOrderValue)} төгрөг байна.`
    ];

    s2.addText(summaryBullets.map(b => ({ text: `•  ${b}\n\n`, options: { fontSize: 11, color: '334155' } })), {
      x: 0.9,
      y: 4.7,
      w: 11.5,
      h: 1.9
    });

    // ==========================================
    // SLIDE 3: MANAGER PERFORMANCE
    // ==========================================
    const s3 = pptx.addSlide();
    s3.background = { color: C.lightBg };
    addHeader(s3, 'БОРЛУУЛАЛТЫН МЕНЕЖЕРҮҮДИЙН ГҮЙЦЭТГЭЛ', 'Хувь хүний төлөвлөгөө, бодит гүйцэтгэл, биелэлтийн хувь болон бартер/хандивын дүн');

    const mgrRows: PptxGenJS.TableRow[] = [
      [
        { text: '№', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Менежерийн нэр', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'left' } },
        { text: 'Зорилт', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Гүйцэтгэл', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Биелэлт %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Захиалга', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Бартер', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Хандив', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } }
      ]
    ];

    data.managerStats.forEach((m, idx) => {
      const rowFill = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      mgrRows.push([
        { text: String(idx + 1), options: { fill: { color: rowFill }, align: 'center', fontSize: 10 } },
        { text: m.name, options: { fill: { color: rowFill }, bold: true, align: 'left', fontSize: 10 } },
        { text: formatMNT(m.target), options: { fill: { color: rowFill }, align: 'right', fontSize: 10 } },
        { text: formatMNT(m.actual), options: { fill: { color: rowFill }, bold: true, align: 'right', fontSize: 10, color: C.primary } },
        { text: `${m.achievementRate.toFixed(1)}%`, options: { fill: { color: rowFill }, bold: true, align: 'center', fontSize: 10, color: m.achievementRate >= 100 ? C.success : C.warning } },
        { text: `${m.orderCount} ш`, options: { fill: { color: rowFill }, align: 'center', fontSize: 10 } },
        { text: formatMNT(m.barterAmount), options: { fill: { color: rowFill }, align: 'right', fontSize: 10 } },
        { text: formatMNT(m.donationAmount), options: { fill: { color: rowFill }, align: 'right', fontSize: 10 } }
      ]);
    });

    s3.addTable(mgrRows, {
      x: 0.6,
      y: 1.6,
      w: 12.13,
      colW: [0.6, 2.5, 1.8, 2.0, 1.3, 1.1, 1.4, 1.43],
      border: { type: 'solid', color: C.border, pt: 0.5 }
    });

    // ==========================================
    // SLIDE 4: LEAD SOURCES & ORDER TYPES
    // ==========================================
    const s4 = pptx.addSlide();
    s4.background = { color: C.lightBg };
    addHeader(s4, 'БОРЛУУЛАЛТЫН СУВГУУД БА ЗАХИАЛГЫН ТӨРӨЛ', 'Хүсэлт ирсэн суваг, хандалтын эх үүсвэр болон гэрээний төрлүүд');

    // Left: Lead Sources
    s4.addText('ХАНДАЛТЫН ЭХ ҮҮСВЭР / СУВГУУД', { x: 0.6, y: 1.5, w: 5.8, h: 0.35, bold: true, fontSize: 12, color: C.primary });
    const leadRows: PptxGenJS.TableRow[] = [
      [
        { text: 'Суваг', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
        { text: 'Захиалга', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Борлуулалт', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Хувь %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
      ]
    ];
    data.leadSources.forEach((ls, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      leadRows.push([
        { text: ls.source, options: { fill: { color: rf }, fontSize: 10 } },
        { text: `${ls.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(ls.revenue), options: { fill: { color: rf }, align: 'right', fontSize: 10 } },
        { text: `${ls.percent.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true } }
      ]);
    });
    s4.addTable(leadRows, { x: 0.6, y: 1.9, w: 5.8, colW: [2.2, 1.0, 1.6, 1.0], border: { type: 'solid', color: C.border, pt: 0.5 } });

    // Right: Order Types
    s4.addText('ЗАХИАЛГЫН ТӨРӨЛ БҮТЦЭЭР', { x: 6.9, y: 1.5, w: 5.8, h: 0.35, bold: true, fontSize: 12, color: C.primary });
    const typeRows: PptxGenJS.TableRow[] = [
      [
        { text: 'Төрөл', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
        { text: 'Тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Дүн', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Эзлэх %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
      ]
    ];
    data.orderTypes.forEach((ot, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      typeRows.push([
        { text: ot.name, options: { fill: { color: rf }, fontSize: 10, bold: true } },
        { text: `${ot.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(ot.revenue), options: { fill: { color: rf }, align: 'right', fontSize: 10 } },
        { text: `${ot.percent.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true } }
      ]);
    });
    s4.addTable(typeRows, { x: 6.9, y: 1.9, w: 5.8, colW: [2.4, 0.9, 1.5, 1.0], border: { type: 'solid', color: C.border, pt: 0.5 } });

    // ==========================================
    // SLIDE 5: CUSTOMER SEGMENTS (B2B vs B2C)
    // ==========================================
    const s5 = pptx.addSlide();
    s5.background = { color: C.lightBg };
    addHeader(s5, 'ХАРИЛЦАГЧИЙН АНГИЛАЛ БА БҮТЦИЙН ШИНЖИЛГЭЭ', 'Байгууллагын (B2B) болон хувь хүний (B2C) захиалгын бүтэц, төвлөрөл');

    data.customerSegments.forEach((cs, idx) => {
      const boxX = 0.6 + idx * 6.2;
      s5.addShape(pptx.ShapeType.rect, {
        x: boxX,
        y: 1.6,
        w: 5.9,
        h: 2.2,
        fill: { color: 'FFFFFF' },
        line: { color: C.border, width: 1 }
      });
      s5.addText(cs.name, { x: boxX + 0.3, y: 1.8, w: 5.3, h: 0.4, fontSize: 14, bold: true, color: C.primary });
      s5.addText(`Нийт дүн: ${formatMNT(cs.revenue)} (${cs.percent.toFixed(1)}%)`, { x: boxX + 0.3, y: 2.3, w: 5.3, h: 0.5, fontSize: 16, bold: true, color: C.textDark });
      s5.addText(`Захиалгын тоо: ${cs.count} ширхэг | Нэг захиалгын дундаж: ${formatMNT(cs.count > 0 ? cs.revenue / cs.count : 0)}`, { x: boxX + 0.3, y: 3.0, w: 5.3, h: 0.4, fontSize: 10, color: C.textMuted });
    });

    s5.addShape(pptx.ShapeType.rect, {
      x: 0.6,
      y: 4.2,
      w: 12.13,
      h: 2.6,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s5.addText('ХАРИЛЦАГЧИЙН БҮТЦИЙН ОНЦЛОХ ДҮГНЭЛТ', { x: 0.9, y: 4.4, w: 11.5, h: 0.35, bold: true, fontSize: 12, color: C.primary });
    const custInsights = [
      `Нийт орлогын дийлэнх буюу ${data.customerSegments[0]?.percent.toFixed(1)}%-ийг Байгууллагын (B2B) харилцагчид бүрдүүлсэн байна.`,
      `B2B захиалгууд нь том дүнтэй байнгын тогтвортой орлогыг бий болгож, хэвлэлийн хүчин чадлыг үр дүнтэй ашигладаг.`,
      `Хувь хүний (B2C) захиалга нь хурдан эргэлттэй, нийт ${data.customerSegments[1]?.count || 0} захиалгыг эзэлж байна.`
    ];
    s5.addText(custInsights.map(i => ({ text: `•  ${i}\n\n`, options: { fontSize: 11, color: '334155' } })), {
      x: 0.9,
      y: 4.9,
      w: 11.5,
      h: 1.7
    });

    // ==========================================
    // SLIDE 6: TOP 10 CUSTOMERS
    // ==========================================
    const s6 = pptx.addSlide();
    s6.background = { color: C.lightBg };
    addHeader(s6, 'ТОП 10 ШИЛДЭГ ХАРИЛЦАГЧИД', 'Сарын хугацаанд хамгийн өндөр борлуулалт бий болгосон тэргүүлэгч харилцагчид');

    const topRows: PptxGenJS.TableRow[] = [
      [
        { text: 'Эрэмбэ', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Харилцагчийн нэр / Байгууллага', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
        { text: 'Захиалгын тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Борлуулалтын дүн', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Нийтэд эзлэх %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
      ]
    ];

    data.topCustomers.forEach((c, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      topRows.push([
        { text: `#${c.rank}`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true, color: c.rank <= 3 ? C.primary : C.textDark } },
        { text: `${c.customer_name}${c.company_name ? ` (${c.company_name})` : ''}`, options: { fill: { color: rf }, fontSize: 10, bold: true } },
        { text: `${c.orderCount} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(c.totalAmount), options: { fill: { color: rf }, align: 'right', fontSize: 10, bold: true } },
        { text: `${c.percentOfTotal.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true, color: C.primary } }
      ]);
    });

    s6.addTable(topRows, {
      x: 0.6,
      y: 1.6,
      w: 12.13,
      colW: [1.2, 5.5, 1.8, 2.3, 1.33],
      border: { type: 'solid', color: C.border, pt: 0.5 }
    });

    // ==========================================
    // SLIDE 7: PRODUCT CATEGORIES
    // ==========================================
    const s7 = pptx.addSlide();
    s7.background = { color: C.lightBg };
    addHeader(s7, 'БҮТЭЭГДЭХҮҮНИЙ АНГИЛЛЫН ШИНЖИЛГЭЭ', 'Хэвлэмэл бүтээгдэхүүний төрлөөрх борлуулалтын бүтэц, орлогын хувь');

    const catRows: PptxGenJS.TableRow[] = [
      [
        { text: '№', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Бүтээгдэхүүний ангилал', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
        { text: 'Захиалгын тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Нийт борлуулалт', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
        { text: 'Орлогод эзлэх %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
      ]
    ];

    data.productCategories.forEach((cat, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      catRows.push([
        { text: String(idx + 1), options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: cat.category, options: { fill: { color: rf }, fontSize: 10, bold: true } },
        { text: `${cat.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(cat.revenue), options: { fill: { color: rf }, align: 'right', fontSize: 10, bold: true } },
        { text: `${cat.percent.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true, color: C.primary } }
      ]);
    });

    s7.addTable(catRows, {
      x: 0.6,
      y: 1.6,
      w: 12.13,
      colW: [0.8, 5.0, 2.0, 2.5, 1.83],
      border: { type: 'solid', color: C.border, pt: 0.5 }
    });

    // ==========================================
    // SLIDE 8: BARTER & DONATION ORDERS
    // ==========================================
    const s8 = pptx.addSlide();
    s8.background = { color: C.lightBg };
    addHeader(s8, 'БАРТЕР БОЛОН ХАНДИВЫН ЗАХИАЛГУУД', 'Хэвлэлийн үйлдвэрлэлээр дэмжлэг үзүүлсэн болон бартерын гэрээт ажлууд');

    if (data.barterAndDonationOrders.length === 0) {
      s8.addShape(pptx.ShapeType.rect, {
        x: 0.6,
        y: 2.0,
        w: 12.13,
        h: 2.0,
        fill: { color: 'FFFFFF' },
        line: { color: C.border, width: 1 }
      });
      s8.addText('Энэ сард бартер болон хандивын тусгай захиалга бүртгэгдээгүй байна.', {
        x: 0.6,
        y: 2.8,
        w: 12.13,
        h: 0.5,
        fontSize: 14,
        align: 'center',
        color: C.textMuted
      });
    } else {
      const bRows: PptxGenJS.TableRow[] = [
        [
          { text: 'Дугаар', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
          { text: 'Харилцагч', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
          { text: 'Бүтээгдэхүүн', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
          { text: 'Үнийн дүн', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
          { text: 'Төрөл', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
          { text: 'Тайлбар / Гэрээ', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } }
        ]
      ];

      data.barterAndDonationOrders.forEach((bo, idx) => {
        const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
        bRows.push([
          { text: bo.order_number, options: { fill: { color: rf }, fontSize: 10, bold: true } },
          { text: `${bo.customer_name}${bo.company_name ? ` (${bo.company_name})` : ''}`, options: { fill: { color: rf }, fontSize: 10 } },
          { text: bo.product_name, options: { fill: { color: rf }, fontSize: 10 } },
          { text: formatMNT(bo.final_price), options: { fill: { color: rf }, align: 'right', fontSize: 10, bold: true } },
          { text: bo.order_type, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true, color: bo.order_type === 'Бартер' ? C.warning : C.primary } },
          { text: bo.notes, options: { fill: { color: rf }, fontSize: 9, color: C.textMuted } }
        ]);
      });

      s8.addTable(bRows, {
        x: 0.6,
        y: 1.6,
        w: 12.13,
        colW: [1.6, 2.8, 2.5, 1.8, 1.2, 2.23],
        border: { type: 'solid', color: C.border, pt: 0.5 }
      });
    }

    // ==========================================
    // SLIDE 9: ORDER PIPELINE & COMPLETION
    // ==========================================
    const s9 = pptx.addSlide();
    s9.background = { color: C.lightBg };
    addHeader(s9, 'ЗАХИАЛГЫН ТӨЛӨВ БА ҮЙЛДВЭРЛЭЛИЙН ЯВЦ', 'Захиалгын статусын хуваарилалт, хугацаандаа гарсан гүйцэтгэлийн үзүүлэлт');

    // Left: Status Breakdown Table
    s9.addText('ЗАХИАЛГЫН СТАТУС БҮТЦЭЭР', { x: 0.6, y: 1.5, w: 6.0, h: 0.35, bold: true, fontSize: 12, color: C.primary });
    const statusRows: PptxGenJS.TableRow[] = [
      [
        { text: 'Төлөв / Статус', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
        { text: 'Захиалгын тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
        { text: 'Хувь %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
      ]
    ];
    data.orderPipeline.statuses.forEach((st, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      statusRows.push([
        { text: st.status, options: { fill: { color: rf }, fontSize: 10, bold: true } },
        { text: `${st.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: `${st.percent.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true } }
      ]);
    });
    s9.addTable(statusRows, { x: 0.6, y: 1.9, w: 6.0, colW: [3.2, 1.4, 1.4], border: { type: 'solid', color: C.border, pt: 0.5 } });

    // Right: Delivery Metric Cards
    s9.addText('ХУГАЦААНЫ БИЕЛЭЛТ БА ГҮЙЦЭТГЭЛ', { x: 7.0, y: 1.5, w: 5.7, h: 0.35, bold: true, fontSize: 12, color: C.primary });
    
    s9.addShape(pptx.ShapeType.rect, {
      x: 7.0,
      y: 1.9,
      w: 5.7,
      h: 2.0,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s9.addText('Хугацаандаа гарсан гүйцэтгэл', { x: 7.3, y: 2.1, w: 5.1, h: 0.35, fontSize: 12, bold: true, color: C.textMuted });
    s9.addText(`${data.orderPipeline.onTimeRate.toFixed(1)}%`, { x: 7.3, y: 2.5, w: 5.1, h: 0.7, fontSize: 28, bold: true, color: C.success });
    s9.addText(`Цагтаа: ${data.orderPipeline.onTimeCount} ш | Хугацаа хэтэрсэн: ${data.orderPipeline.delayedCount} ш`, { x: 7.3, y: 3.3, w: 5.1, h: 0.4, fontSize: 11, color: C.textMuted });

    s9.addShape(pptx.ShapeType.rect, {
      x: 7.0,
      y: 4.1,
      w: 5.7,
      h: 2.0,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s9.addText('Нийт дууссан захиалга', { x: 7.3, y: 4.3, w: 5.1, h: 0.35, fontSize: 12, bold: true, color: C.textMuted });
    s9.addText(`${data.orderPipeline.completedOrdersCount} ш`, { x: 7.3, y: 4.7, w: 5.1, h: 0.7, fontSize: 28, bold: true, color: C.primary });
    s9.addText(`Сарын нийт захиалгын ${((data.orderPipeline.completedOrdersCount / (data.orderPipeline.totalOrders || 1)) * 100).toFixed(1)}%-ийг эзэлж байна`, { x: 7.3, y: 5.5, w: 5.1, h: 0.4, fontSize: 11, color: C.textMuted });

    // ==========================================
    // SLIDE 10: PAYMENTS & RECEIVABLES
    // ==========================================
    const s10 = pptx.addSlide();
    s10.background = { color: C.lightBg };
    addHeader(s10, 'ТӨЛБӨР ТООЦОО БА АВЛАГЫН ТАЙЛАН', 'Нэхэмжилсэн борлуулалт, бодит төлөгдсөн орлого болон үлдэгдэл авлага');

    const finCards = [
      { title: 'Нийт нэхэмжилсэн', value: formatMNT(data.financials.totalInvoiced), sub: 'Сарын нийт борлуулалт', color: C.primary },
      { title: 'Хүлээн авсан төлбөр', value: formatMNT(data.financials.totalPaid), sub: `Цуглуулалтын хувь: ${data.financials.collectionRate.toFixed(1)}%`, color: C.success },
      { title: 'Үлдэгдэл авлага', value: formatMNT(data.financials.totalReceivables), sub: 'Төлөгдөөгүй дүн', color: data.financials.totalReceivables > 0 ? C.danger : C.success },
      { title: 'И-Баримт олголт', value: `${data.financials.ebarimtCount} ш`, sub: `Нийт: ${formatMNT(data.financials.ebarimtAmount)}`, color: C.textDark }
    ];

    finCards.forEach((c, idx) => {
      const cx = 0.6 + idx * 3.1;
      s10.addShape(pptx.ShapeType.rect, {
        x: cx,
        y: 1.6,
        w: 2.85,
        h: 2.2,
        fill: { color: 'FFFFFF' },
        line: { color: C.border, width: 1 }
      });
      s10.addText(c.title, { x: cx + 0.2, y: 1.8, w: 2.45, h: 0.3, fontSize: 11, color: C.textMuted, bold: true });
      s10.addText(c.value, { x: cx + 0.2, y: 2.2, w: 2.45, h: 0.6, fontSize: 18, color: c.color, bold: true });
      s10.addText(c.sub, { x: cx + 0.2, y: 3.1, w: 2.45, h: 0.4, fontSize: 10, color: C.textMuted });
    });

    s10.addShape(pptx.ShapeType.rect, {
      x: 0.6,
      y: 4.2,
      w: 12.13,
      h: 2.6,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s10.addText('САНХҮҮ, АВЛАГЫН МЕНЕЖМЕНТИЙН САНАМЖ', { x: 0.9, y: 4.4, w: 11.5, h: 0.35, bold: true, fontSize: 12, color: C.primary });
    const finNotes = [
      `Сарын хугацаанд төлбөр цуглуулалтын хувь ${data.financials.collectionRate.toFixed(1)}% байна.`,
      `Үлдэгдэл ${formatMNT(data.financials.totalReceivables)} төгрөгийн авлагыг барагдуулах тал дээр харилцагчийн менежерүүд тусгайлан ажиллах шаардлагатай.`,
      `Нийт ${data.financials.ebarimtCount} захиалгад ${formatMNT(data.financials.ebarimtAmount)} төгрөгийн НӨАТ-ын И-Баримт баталгаажиж системд олгогдсон байна.`
    ];
    s10.addText(finNotes.map(n => ({ text: `•  ${n}\n\n`, options: { fontSize: 11, color: '334155' } })), {
      x: 0.9,
      y: 4.9,
      w: 11.5,
      h: 1.7
    });

    // ==========================================
    // SLIDE 11: CUSTOMER GIFTS REGISTRY
    // ==========================================
    const s11 = pptx.addSlide();
    s11.background = { color: C.lightBg };
    addHeader(s11, 'ХАРИЛЦАГЧДАД ОЛГОСОН БЭЛЭГ, УРАМШУУЛАЛ', 'Байгууллага, түншүүдэд өгсөн шинэ жилийн болон улирлын дурсгалын бэлгийн бүртгэл');

    if (data.customerGifts.length === 0) {
      s11.addShape(pptx.ShapeType.rect, {
        x: 0.6,
        y: 2.0,
        w: 12.13,
        h: 2.0,
        fill: { color: 'FFFFFF' },
        line: { color: C.border, width: 1 }
      });
      s11.addText('Энэ сард харилцагчдад олгосон бэлгийн бүртгэл хийгдээгүй байна.', {
        x: 0.6,
        y: 2.8,
        w: 12.13,
        h: 0.5,
        fontSize: 14,
        align: 'center',
        color: C.textMuted
      });
    } else {
      const giftRows: PptxGenJS.TableRow[] = [
        [
          { text: '№', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
          { text: 'Харилцагчийн нэр', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
          { text: 'Бэлгийн зүйлс / Нэр төрөл', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
          { text: 'Тоо ширхэг', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
          { text: 'Тэмдэглэл', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } }
        ]
      ];

      data.customerGifts.forEach((g, idx) => {
        const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
        giftRows.push([
          { text: String(idx + 1), options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
          { text: g.customer_name, options: { fill: { color: rf }, fontSize: 10, bold: true } },
          { text: g.gift_items, options: { fill: { color: rf }, fontSize: 10 } },
          { text: `${g.qty} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10, bold: true } },
          { text: g.notes || '-', options: { fill: { color: rf }, fontSize: 10, color: C.textMuted } }
        ]);
      });

      s11.addTable(giftRows, {
        x: 0.6,
        y: 1.6,
        w: 12.13,
        colW: [0.8, 3.2, 4.2, 1.5, 2.43],
        border: { type: 'solid', color: C.border, pt: 0.5 }
      });
    }

    // ==========================================
    // SLIDE 12: CONCLUSION & NEXT GOALS
    // ==========================================
    const s12 = pptx.addSlide();
    s12.background = { color: C.darkBg };

    s12.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.4,
      h: 7.5,
      fill: { color: C.primary }
    });

    s12.addText('ДҮГНЭЛТ БА ДАРАА САРЫН ЗОРИЛТ', {
      x: 1.0,
      y: 0.8,
      w: 11,
      h: 0.6,
      fontSize: 26,
      bold: true,
      color: C.textWhite
    });

    // Left Box: Key Strengths & Achievements
    s12.addShape(pptx.ShapeType.rect, {
      x: 1.0,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: C.cardDark },
      line: { color: '334155', width: 1 }
    });
    s12.addText('ОЛСТОЙ ТАЛУУД & АМЖИЛТ', {
      x: 1.3,
      y: 2.1,
      w: 4.8,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: '34D399'
    });
    const achievements = [
      `Сарын нийт борлуулалт: ${formatMNT(data.summary.totalRevenue)} амжилттай хүрлээ.`,
      `Хугацаандаа хүлээлгэн өгсөн байдал: ${data.orderPipeline.onTimeRate.toFixed(1)}% өндөр түвшинд хадгалагдав.`,
      `Байнгын B2B харилцагчдын давталт тогтвортой үргэлжилж байна.`,
      `Үйлдвэрлэлийн бүтээмж болон чанарын шалгалтын явц жигдэрсэн.`
    ];
    s12.addText(achievements.map(a => ({ text: `✓  ${a}\n\n`, options: { fontSize: 11, color: 'E2E8F0' } })), {
      x: 1.3,
      y: 2.7,
      w: 4.8,
      h: 3.6
    });

    // Right Box: Goals for next month
    s12.addShape(pptx.ShapeType.rect, {
      x: 6.8,
      y: 1.8,
      w: 5.5,
      h: 4.8,
      fill: { color: C.cardDark },
      line: { color: '334155', width: 1 }
    });
    s12.addText('ЦААШДЫН ЗОРИЛТ & АНХААРАХ ЗҮЙЛС', {
      x: 7.1,
      y: 2.1,
      w: 4.9,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: '60A5FA'
    });
    const nextGoals = [
      `Үлдэгдэл авлагын хэмжээг бууруулж, төлбөрийн цуглуулалтыг 90%+ дээш гаргах.`,
      `Шинэ захиалагчдыг татах дижитал сувгийн идэвхжүүлэлтийг нэмэгдүүлэх.`,
      `Бүтээгдэхүүний өндөр ашиг шимтэй төрлүүдийн (Сав баглаа, ном) борлуулалтыг дэмжих.`,
      `Ирэх сарын борлуулалтын төлөвлөгөөг баталж, менежер бүрээр нарийвчлан хуваарилах.`
    ];
    s12.addText(nextGoals.map(g => ({ text: `→  ${g}\n\n`, options: { fontSize: 11, color: 'E2E8F0' } })), {
      x: 7.1,
      y: 2.7,
      w: 4.9,
      h: 3.6
    });

    // Generate buffer & send
    const buffer = await pptx.write({ outputType: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="Selenge_Sales_Report_${year}_${String(month).padStart(2, '0')}.pptx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Error generating monthly report PPTX:', error);
    res.status(500).json({ error: 'Failed to generate PowerPoint presentation', details: error.message });
  }
};

// 3. GET / SET TARGETS
export const getSalesTarget = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const target = await prisma.sales_target.findUnique({
      where: { year_month: { year, month } }
    });

    // Also get managers list for assigning targets
    const managers = await prisma.user.findMany({
      where: { role: 'SALES' },
      select: { id: true, name: true }
    });

    res.json({
      target: target || { year, month, target_amount: 0, manager_targets: [] },
      managers
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sales target', details: error.message });
  }
};

export const upsertSalesTarget = async (req: Request, res: Response) => {
  try {
    const { year, month, target_amount, manager_targets, notes } = req.body;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const target = await prisma.sales_target.upsert({
      where: { year_month: { year, month } },
      create: {
        year,
        month,
        target_amount: Number(target_amount) || 0,
        manager_targets: manager_targets || [],
        notes: notes || null
      },
      update: {
        target_amount: Number(target_amount) || 0,
        manager_targets: manager_targets || [],
        notes: notes || null
      }
    });

    res.json(target);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save sales target', details: error.message });
  }
};

// 4. CUSTOMER GIFTS CRUD
export const getCustomerGifts = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    const where: any = {};
    if (year) where.year = year;
    if (month) where.month = month;

    const gifts = await prisma.customer_gift.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    });
    res.json(gifts);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customer gifts', details: error.message });
  }
};

export const createCustomerGift = async (req: Request, res: Response) => {
  try {
    const { customer_id, customer_name, gift_items, qty, year, month, notes } = req.body;
    if (!customer_name || !gift_items || !year || !month) {
      return res.status(400).json({ error: 'Customer name, gift items, year, and month are required' });
    }

    const gift = await prisma.customer_gift.create({
      data: {
        customer_id: customer_id ? Number(customer_id) : null,
        customer_name,
        gift_items,
        qty: Number(qty) || 1,
        year: Number(year),
        month: Number(month),
        notes: notes || null
      }
    });
    res.status(201).json(gift);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create customer gift', details: error.message });
  }
};

export const deleteCustomerGift = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    await prisma.customer_gift.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete customer gift', details: error.message });
  }
};

// 5. SALESPERSON DEDICATED REPORT DATA
export const getSalespersonReportData = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

    const { period, startDate, endDate, salesPersonId } = req.query;

    // Determine target salesperson
    let targetUser = currentUser;
    const canSwitchManager = ['ADMIN', 'FINANCE', 'MANAGER'].includes(currentUser.role);
    if (canSwitchManager && salesPersonId) {
      const found = await prisma.user.findUnique({
        where: { id: parseInt(salesPersonId as string, 10) }
      });
      if (found) {
        targetUser = found;
      }
    }

    // Determine Date Range
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'this_week') {
      const day = now.getDay(); // 0 is Sunday, 1 is Monday...
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === 'custom' && startDate && endDate) {
      start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default: 'this_month'
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Filter by salesperson
    const userOrConditions: any[] = [];
    if (targetUser.id) {
      userOrConditions.push({ sales_person_id: targetUser.id });
    }
    if (targetUser.name) {
      userOrConditions.push({ sales_person_name: targetUser.name });
    }

    const where: any = {
      createdAt: { gte: start, lte: end }
    };

    if (userOrConditions.length > 0) {
      where.OR = userOrConditions;
    }

    // Query orders with payments
    const orders = await prisma.order.findMany({
      where,
      include: {
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const nonCancelled = orders.filter(o => o.current_status !== 'Цуцлагдсан');
    const totalRevenue = nonCancelled.reduce((sum, o) => sum + (o.final_price || 0), 0);
    const totalOrders = nonCancelled.length;
    const cancelledOrders = orders.filter(o => o.current_status === 'Цуцлагдсан');
    const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);

    const completedOrders = nonCancelled.filter(o => ['Олгосон', 'Хүлээлгэн өгсөн', 'Бэлэн'].includes(o.current_status || ''));
    const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);

    const inProductionOrders = nonCancelled.filter(o => !['Үнийн санал', 'Хүлээлгэн өгсөн', 'Олгосон', 'Бэлэн'].includes(o.current_status || ''));
    const inProductionRevenue = inProductionOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);

    // Payments & Receivables
    let totalPaid = 0;
    let totalReceivables = 0;

    nonCancelled.forEach(o => {
      const paid = (o.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      totalPaid += paid;
      const balance = Math.max(0, (o.final_price || 0) - paid);
      totalReceivables += balance;
    });

    // Monthly Target & Achievement
    const targetYear = start.getFullYear();
    const targetMonth = start.getMonth() + 1;
    const targetRecord = await prisma.sales_target.findUnique({
      where: { year_month: { year: targetYear, month: targetMonth } }
    });

    let myTarget = 0;
    if (targetRecord && targetRecord.manager_targets) {
      const mgrList = targetRecord.manager_targets as Array<{ manager_name: string; target: number }>;
      const matched = mgrList.find(m => m.manager_name === targetUser.name);
      if (matched) {
        myTarget = Number(matched.target) || 0;
      }
    }
    const achievementRate = myTarget > 0 ? (totalRevenue / myTarget) * 100 : 0;

    // Daily Trend
    const trendMap = new Map<string, { date: string; revenue: number; count: number }>();
    const dIter = new Date(start);
    while (dIter <= end) {
      const dateKey = dIter.toISOString().split('T')[0];
      trendMap.set(dateKey, { date: dateKey, revenue: 0, count: 0 });
      dIter.setDate(dIter.getDate() + 1);
    }

    nonCancelled.forEach(o => {
      const dateKey = o.createdAt.toISOString().split('T')[0];
      const entry = trendMap.get(dateKey);
      if (entry) {
        entry.revenue += (o.final_price || 0);
        entry.count += 1;
      }
    });

    const trend = Array.from(trendMap.values());

    // Category Breakdown
    const catMap = new Map<string, { category: string; count: number; revenue: number }>();
    nonCancelled.forEach(o => {
      const cat = o.category || 'Бусад';
      const existing = catMap.get(cat) || { category: cat, count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += (o.final_price || 0);
      catMap.set(cat, existing);
    });

    const categoryBreakdown = Array.from(catMap.values()).map(c => ({
      ...c,
      percent: totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Status Breakdown
    const statusMap = new Map<string, { status: string; count: number; revenue: number }>();
    orders.forEach(o => {
      const st = o.current_status || 'Тодорхойгүй';
      const existing = statusMap.get(st) || { status: st, count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += (o.final_price || 0);
      statusMap.set(st, existing);
    });
    const statusBreakdown = Array.from(statusMap.values()).sort((a, b) => b.count - a.count);

    // Top Customers
    const custMap = new Map<string, { name: string; count: number; totalAmount: number }>();
    nonCancelled.forEach(o => {
      const name = o.customer_name || 'Нэргүй харилцагч';
      const existing = custMap.get(name) || { name, count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += (o.final_price || 0);
      custMap.set(name, existing);
    });
    const topCustomers = Array.from(custMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    // Formatted Order Items
    const orderItems = orders.map(o => {
      const paid = (o.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const balance = Math.max(0, (o.final_price || 0) - paid);
      return {
        id: o.id,
        order_number: o.order_number || `ORD-${o.id}`,
        customer_name: o.customer_name,
        company_name: o.company_name,
        product_name: o.product_name,
        category: o.category || 'Бусад',
        total_qty: o.total_qty,
        final_price: o.final_price || 0,
        paid_amount: paid,
        balance: balance,
        current_status: o.current_status,
        createdAt: o.createdAt,
        deadline: o.deadline,
        is_urgent: o.is_urgent,
        order_type: o.order_type || 'STANDARD'
      };
    });

    // Available Salespersons for dropdown (for Admin/Manager)
    let availableSalespersons: Array<{ id: number; name: string; role: string }> = [];
    if (canSwitchManager) {
      availableSalespersons = await prisma.user.findMany({
        where: { role: { in: ['SALES', 'ADMIN'] } },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' }
      });
    }

    res.json({
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        role: targetUser.role
      },
      period: {
        type: period || 'this_month',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      summary: {
        totalRevenue,
        totalOrders,
        completedRevenue,
        completedCount: completedOrders.length,
        inProductionRevenue,
        inProductionCount: inProductionOrders.length,
        cancelledCount: cancelledOrders.length,
        cancelledRevenue,
        totalPaid,
        totalReceivables,
        target: myTarget,
        achievementRate
      },
      trend,
      categoryBreakdown,
      statusBreakdown,
      topCustomers,
      orders: orderItems,
      availableSalespersons
    });

  } catch (error: any) {
    console.error('Salesperson Report Error:', error);
    res.status(500).json({ error: 'Failed to fetch sales report', details: error.message });
  }
};

