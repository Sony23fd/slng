import PptxGenJS from 'pptxgenjs';

export interface ManagerStat {
  id?: number;
  name: string;
  target: number;
  actual: number;
  achievementRate: number;
  orderCount: number;
  completedRevenue: number;
  inProductionRevenue: number;
  paidAmount: number;
  receivables: number;
  barterAmount?: number;
  donationAmount?: number;
}

export interface ReportData {
  targetUser: {
    id: number;
    name: string;
    role: string;
  };
  isTeamView?: boolean;
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedRevenue: number;
    completedCount: number;
    inProductionRevenue: number;
    inProductionCount: number;
    cancelledCount: number;
    cancelledRevenue: number;
    totalPaid: number;
    totalReceivables: number;
    target: number;
    achievementRate: number;
  };
  managerStats?: ManagerStat[];
  trend: Array<{ date: string; revenue: number; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number; revenue: number; percent: number }>;
  statusBreakdown: Array<{ status: string; count: number; revenue: number }>;
  topCustomers: Array<{ name: string; count: number; totalAmount: number }>;
  orders?: any[];
  availableSalespersons?: Array<{ id: number; name: string; role: string }>;
}

const formatMNT = (amount: number): string => {
  return (Math.round(amount) || 0).toLocaleString('en-US') + '₮';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const generateSalesReportPptx = async (data: ReportData) => {
  const { targetUser, isTeamView, period, summary, trend = [], categoryBreakdown = [], statusBreakdown = [], topCustomers = [] } = data;

  const isTeam = isTeamView !== undefined ? isTeamView : (!targetUser?.id || targetUser.role === 'TEAM' || targetUser.name?.includes('баг'));

  // 1. Synthesize robust managerStats if missing from server response
  let effectiveManagerStats: ManagerStat[] = (data.managerStats && data.managerStats.length > 0)
    ? [...data.managerStats]
    : [];

  if (effectiveManagerStats.length === 0 && data.availableSalespersons && data.availableSalespersons.length > 0) {
    const map = new Map<string, ManagerStat>();
    data.availableSalespersons.forEach(sp => {
      map.set(sp.name, {
        id: sp.id,
        name: sp.name,
        target: 0,
        actual: 0,
        achievementRate: 0,
        orderCount: 0,
        completedRevenue: 0,
        inProductionRevenue: 0,
        paidAmount: 0,
        receivables: 0
      });
    });

    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach(o => {
        if (o.current_status === 'Цуцлагдсан') return;
        const mgrName = o.sales_person_name || 'Бусад';
        const existing = map.get(mgrName) || {
          name: mgrName,
          target: 0,
          actual: 0,
          achievementRate: 0,
          orderCount: 0,
          completedRevenue: 0,
          inProductionRevenue: 0,
          paidAmount: 0,
          receivables: 0
        };

        const price = Number(o.final_price) || 0;
        const paid = Number(o.paid_amount) || 0;
        const balance = Math.max(0, price - paid);

        existing.orderCount += 1;
        existing.actual += price;
        existing.paidAmount += paid;
        existing.receivables += balance;

        if (['Олгосон', 'Хүлээлгэн өгсөн', 'Бэлэн'].includes(o.current_status || '')) {
          existing.completedRevenue += price;
        } else {
          existing.inProductionRevenue += price;
        }
        map.set(mgrName, existing);
      });
    }

    effectiveManagerStats = Array.from(map.values()).sort((a, b) => b.actual - a.actual);
  }

  const startDateStr = formatDate(period.startDate);
  const endDateStr = formatDate(period.endDate);
  const periodLabel = `${startDateStr} - ${endDateStr}`;

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Selenge Press LLC';
  pptx.company = 'Сэлэнгэ Пресс ХХК';
  pptx.title = `Борлуулалтын багийн тайлан танилцуулга (${periodLabel})`;

  const C = {
    darkBg: '0F172A',      // Slate 900
    cardDark: '1E293B',    // Slate 800
    lightBg: 'F8FAFC',     // Slate 50
    cardLight: 'FFFFFF',   // Pure White
    primary: '2563EB',     // Blue 600
    primaryLight: 'EEF2FF',// Indigo 50
    success: '059669',     // Emerald 600
    warning: 'D97706',     // Amber 600
    danger: 'DC2626',      // Red 600
    textWhite: 'FFFFFF',
    textDark: '0F172A',
    textMuted: '64748B',
    border: 'E2E8F0',
    headerFill: '1E293B',
    altRowFill: 'F1F5F9'
  };

  const addHeader = (slide: any, title: string, subtitle: string) => {
    slide.addText(title, {
      x: 0.6,
      y: 0.4,
      w: 7.8,
      h: 0.5,
      fontSize: 20,
      fontFace: 'Arial',
      bold: true,
      color: C.textDark
    });
    slide.addText(subtitle, {
      x: 0.6,
      y: 0.85,
      w: 7.8,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.textMuted
    });
    slide.addText('СЭЛЭНГЭ ПРЕСС | БОРЛУУЛАЛТЫН АЛБА', {
      x: 8.5,
      y: 0.4,
      w: 4.23,
      h: 0.4,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C.primary,
      align: 'right'
    });
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
  s1.addText('БОРЛУУЛАЛТЫН БАГИЙН ТАЙЛАН ТАНИЛЦУУЛГА', {
    x: 1.2,
    y: 2.4,
    w: 10.8,
    h: 1.1,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: C.textWhite
  });
  s1.addText(`Тайлант хугацаа: ${periodLabel}`, {
    x: 1.2,
    y: 3.6,
    w: 10,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Arial',
    color: '38BDF8'
  });
  s1.addShape(pptx.ShapeType.rect, {
    x: 1.2,
    y: 4.4,
    w: 6.5,
    h: 0.03,
    fill: { color: '334155' }
  });
  s1.addText(`Танилцуулга: ${isTeam ? 'Борлуулалтын баг (Бүгд)' : `Борлуулалтын менежер ${targetUser?.name ? `(${targetUser.name})` : ''}`}`, {
    x: 1.2,
    y: 4.7,
    w: 8,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: 'E2E8F0'
  });
  s1.addText(`Тайлан татсан огноо: ${new Date().toLocaleDateString('mn-MN')}`, {
    x: 1.2,
    y: 5.2,
    w: 8,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    color: '94A3B8'
  });

  // ==========================================
  // SLIDE 2: TEAM KPI & OVERALL SUMMARY
  // ==========================================
  const s2 = pptx.addSlide();
  s2.background = { color: C.lightBg };
  addHeader(s2, 'БАГИЙН НИЙТ ГҮЙЦЭТГЭЛ (KPI)', `${periodLabel} хоорондох борлуулалтын багийн нэгдсэн үзүүлэлт, зорилтын биелэлт`);

  const avgOrderVal = summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;
  const cards = [
    { title: 'Нийт борлуулалт', value: formatMNT(summary.totalRevenue), sub: `Биелэлт: ${summary.achievementRate.toFixed(1)}%`, color: C.primary },
    { title: 'Багийн төлөвлөгөө', value: formatMNT(summary.target), sub: summary.target > 0 ? `Зөрүү: ${formatMNT(summary.totalRevenue - summary.target)}` : 'Төлөвлөгөө тохируулаагүй', color: C.textDark },
    { title: 'Нийт захиалгын тоо', value: `${summary.totalOrders} ш`, sub: `Дундаж захиалга: ${formatMNT(avgOrderVal)}`, color: C.textDark },
    { title: 'Төлбөр цугларалт', value: formatMNT(summary.totalPaid), sub: `Үлдэгдэл авлага: ${formatMNT(summary.totalReceivables)}`, color: C.success }
  ];

  cards.forEach((c, idx) => {
    const cardX = 0.6 + idx * 3.1;
    s2.addShape(pptx.ShapeType.rect, {
      x: cardX,
      y: 1.6,
      w: 2.85,
      h: 2.0,
      fill: { color: 'FFFFFF' },
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
      fontSize: 17,
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
    y: 3.9,
    w: 12.13,
    h: 2.8,
    fill: { color: 'FFFFFF' },
    line: { color: C.border, width: 1 }
  });
  s2.addText('БАГИЙН НИЙТ ТОЙМ ДҮГНЭЛТ', {
    x: 0.9,
    y: 4.15,
    w: 11.5,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: C.primary
  });
  const summaryBullets = summary.totalOrders > 0
    ? [
        `Тайлант хугацаанд борлуулалтын баг нийт ${summary.totalOrders} захиалга гүйцэтгэж, ${formatMNT(summary.totalRevenue)} төгрөгийн борлуулалт хийсэн байна.`,
        summary.target > 0
          ? `Багийн нэгдсэн төлөвлөгөөт зорилт ${formatMNT(summary.target)} байснаас биелэлт ${summary.achievementRate.toFixed(1)}%-тай гарлаа.`
          : `Борлуулалтын нэгдсэн төлөвлөгөө бүртгэгдээгүй бөгөөд захиалга бүрийн дундаж дүн ${formatMNT(avgOrderVal)} байна.`,
        `Үйлдвэрлэлд ${summary.inProductionCount} захиалга (${formatMNT(summary.inProductionRevenue)}) хэвлэгдэж буй бөгөөд ${summary.completedCount} захиалга (${formatMNT(summary.completedRevenue)}) бүрэн бэлэн болсон.`,
        `Нийт борлуулалтаас ${formatMNT(summary.totalPaid)} төгрөг дансанд цугларсан ба харилцагчдаас авах үлдэгдэл авлага ${formatMNT(summary.totalReceivables)} байна.`
      ]
    : [
        `Тайлант хугацаанд (${periodLabel}) захиалга бүртгэгдээгүй байна.`,
        `Өмнөх болон идэвхтэй үеийн захиалгуудыг харахын тулд огнооны шүүлтүүрийг тохируулна уу.`,
        `Борлуулалтын багийн үйл ажиллагаа, захиалгын бэлтгэл ажлууд хуваарийн дагуу явагдаж байна.`,
        `Харилцагчдын авлагын төлбөрийг шуурхай цуглуулах хяналтыг тогтмол хэрэгжүүлж байна.`
      ];
  s2.addText(summaryBullets.map(b => ({ text: `•  ${b}\n\n`, options: { fontSize: 11, color: '334155' } })), {
    x: 0.9,
    y: 4.6,
    w: 11.5,
    h: 1.9
  });

  // ==========================================
  // SLIDE 3: ALL SALES MANAGERS BREAKDOWN (CRITICAL MEETING SLIDE)
  // ==========================================
  const s3 = pptx.addSlide();
  s3.background = { color: C.lightBg };
  addHeader(s3, 'БОРЛУУЛАЛТЫН МЕНЕЖЕРҮҮДИЙН ГҮЙЦЭТГЭЛ БА ЭРЭМБЭ', 'Бүх борлуулагчдын төлөвлөгөө, бодит борлуулалт, биелэлтийн хувь болон авлагын харьцуулалт');

  const mgrRows: PptxGenJS.TableRow[] = [
    [
      { text: '№', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Менежерийн нэр', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'left' } },
      { text: 'Зорилт (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
      { text: 'Бодит гүйцэтгэл (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
      { text: 'Биелэлт %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Захиалга', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Төлөгдсөн (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
      { text: 'Үлдэгдэл авлага (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } }
    ]
  ];

  if (effectiveManagerStats.length > 0) {
    effectiveManagerStats.forEach((m, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      mgrRows.push([
        { text: String(idx + 1), options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: m.name, options: { fill: { color: rf }, bold: true, align: 'left', fontSize: 10 } },
        { text: m.target > 0 ? formatMNT(m.target) : '-', options: { fill: { color: rf }, align: 'right', fontSize: 10 } },
        { text: formatMNT(m.actual), options: { fill: { color: rf }, bold: true, align: 'right', fontSize: 10, color: C.primary } },
        { text: m.target > 0 ? `${m.achievementRate.toFixed(1)}%` : '-', options: { fill: { color: rf }, bold: true, align: 'center', fontSize: 10, color: m.achievementRate >= 100 ? C.success : (m.achievementRate >= 70 ? C.warning : C.danger) } },
        { text: `${m.orderCount} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(m.paidAmount), options: { fill: { color: rf }, align: 'right', fontSize: 10 } },
        { text: formatMNT(m.receivables), options: { fill: { color: rf }, bold: m.receivables > 0, align: 'right', fontSize: 10, color: m.receivables > 0 ? C.danger : C.success } }
      ]);
    });
  } else {
    mgrRows.push([
      {
        text: 'Тайлант хугацаанд борлуулалтын менежерийн мэдээлэл бүртгэгдээгүй байна',
        options: { colspan: 8, fill: { color: C.altRowFill }, align: 'center', fontSize: 10, color: C.textMuted }
      }
    ]);
  }

  s3.addTable(mgrRows, {
    x: 0.6,
    y: 1.6,
    w: 12.13,
    colW: [0.6, 2.3, 1.8, 2.0, 1.2, 1.0, 1.6, 1.63],
    border: { type: 'solid', color: C.border, pt: 0.5 }
  });

  // ==========================================
  // SLIDE 4: DAILY SALES DYNAMICS
  // ==========================================
  const s4 = pptx.addSlide();
  s4.background = { color: C.lightBg };
  addHeader(s4, 'БОРЛУУЛАЛТЫН ӨДӨР ТУТМЫН ЯВЦ', 'Тайлант хугацааны өдөр бүрийн борлуулалтын динамик болон захиалгын тоо');

  const activeTrend = trend.filter(t => t.revenue > 0 || t.count > 0);
  const trendToShow = activeTrend.length > 0 ? activeTrend.slice(0, 12) : [];

  const trendRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Огноо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Захиалгын тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Борлуулалтын дүн (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
      { text: 'Эзлэх хувь %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
    ]
  ];

  if (trendToShow.length > 0) {
    trendToShow.forEach((t, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      const pct = summary.totalRevenue > 0 ? (t.revenue / summary.totalRevenue) * 100 : 0;
      trendRows.push([
        { text: t.date, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: `${t.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(t.revenue), options: { fill: { color: rf }, align: 'right', fontSize: 10, bold: true, color: C.primary } },
        { text: `${pct.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } }
      ]);
    });
  } else {
    trendRows.push([
      {
        text: 'Тайлант хугацаанд өдөр тутмын борлуулалт ороогүй байна',
        options: { colspan: 4, fill: { color: C.altRowFill }, align: 'center', fontSize: 10, color: C.textMuted }
      }
    ]);
  }

  s4.addTable(trendRows, {
    x: 0.6,
    y: 1.6,
    w: 7.5,
    colW: [2.0, 1.8, 2.5, 1.2],
    border: { type: 'solid', color: C.border, pt: 0.5 }
  });

  // Right Info Box
  s4.addShape(pptx.ShapeType.rect, {
    x: 8.4,
    y: 1.6,
    w: 4.3,
    h: 4.8,
    fill: { color: 'FFFFFF' },
    line: { color: C.border, width: 1 }
  });
  s4.addText('ӨДРИЙН ДУНДАЖ БА ИДЭВХЖИЛТ', {
    x: 8.7,
    y: 1.9,
    w: 3.7,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: C.primary
  });

  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);
  const daysCount = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1);
  const dailyAvgRev = summary.totalRevenue / daysCount;
  const activeDays = trend.filter(t => t.revenue > 0).length;

  s4.addText([
    { text: `Нийт хугацаа: `, options: { bold: true, color: C.textDark } },
    { text: `${daysCount} хоног\n\n`, options: { color: C.textMuted } },
    { text: `Идэвхтэй борлуулалтын өдөр: `, options: { bold: true, color: C.textDark } },
    { text: `${activeDays} өдөр\n\n`, options: { color: C.textMuted } },
    { text: `Өдрийн дундаж борлуулалт: `, options: { bold: true, color: C.textDark } },
    { text: `${formatMNT(dailyAvgRev)}\n\n`, options: { color: C.primary, bold: true } },
    { text: `Захиалга орсон өдрүүдийн дундаж: `, options: { bold: true, color: C.textDark } },
    { text: `${formatMNT(activeDays > 0 ? summary.totalRevenue / activeDays : 0)}\n\n`, options: { color: C.textMuted } }
  ], {
    x: 8.7,
    y: 2.5,
    w: 3.7,
    h: 3.6,
    fontSize: 11
  });

  // ==========================================
  // SLIDE 5: PRODUCT CATEGORY BREAKDOWN
  // ==========================================
  const s5 = pptx.addSlide();
  s5.background = { color: C.lightBg };
  addHeader(s5, 'БҮТЭЭГДЭХҮҮНИЙ АНГИЛЛЫН БОРЛУУЛАЛТ', 'Багийн борлуулалтын бүтээгдэхүүний төрөл, эзлэх хувь');

  const catRows: PptxGenJS.TableRow[] = [
    [
      { text: '№', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Бүтээгдэхүүний төрөл', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'left' } },
      { text: 'Захиалга', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Борлуулалтын дүн (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
      { text: 'Эзлэх хувь %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
    ]
  ];

  if (categoryBreakdown.length > 0) {
    categoryBreakdown.slice(0, 10).forEach((c, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      catRows.push([
        { text: String(idx + 1), options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: c.category, options: { fill: { color: rf }, bold: true, align: 'left', fontSize: 10 } },
        { text: `${c.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(c.revenue), options: { fill: { color: rf }, align: 'right', fontSize: 10, bold: true, color: C.primary } },
        { text: `${c.percent.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } }
      ]);
    });
  } else {
    catRows.push([
      {
        text: 'Тайлант хугацаанд бүтээгдэхүүний ангиллын борлуулалт бүртгэгдээгүй байна',
        options: { colspan: 5, fill: { color: C.altRowFill }, align: 'center', fontSize: 10, color: C.textMuted }
      }
    ]);
  }

  s5.addTable(catRows, {
    x: 0.6,
    y: 1.6,
    w: 12.13,
    colW: [0.8, 4.0, 1.8, 3.5, 2.03],
    border: { type: 'solid', color: C.border, pt: 0.5 }
  });

  // ==========================================
  // SLIDE 6: ORDER PIPELINE & STATUSES
  // ==========================================
  const s6 = pptx.addSlide();
  s6.background = { color: C.lightBg };
  addHeader(s6, 'ЗАХИАЛГЫН ЯВЦ БА СТАТУС', 'Үйлдвэрлэлд яваа болон хүлээлгэн өгсөн захиалгуудын төлөв');

  const statusCards = [
    { title: 'Үйлдвэрлэлд яваа', count: `${summary.inProductionCount} ш`, amount: formatMNT(summary.inProductionRevenue), color: C.warning },
    { title: 'Бэлэн / Хүлээлгэн өгсөн', count: `${summary.completedCount} ш`, amount: formatMNT(summary.completedRevenue), color: C.success },
    { title: 'Цуцлагдсан захиалга', count: `${summary.cancelledCount} ш`, amount: formatMNT(summary.cancelledRevenue), color: C.danger }
  ];

  statusCards.forEach((sc, idx) => {
    const cx = 0.6 + idx * 4.15;
    s6.addShape(pptx.ShapeType.rect, {
      x: cx,
      y: 1.6,
      w: 3.85,
      h: 1.8,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s6.addText(sc.title, { x: cx + 0.3, y: 1.8, w: 3.2, h: 0.3, fontSize: 12, bold: true, color: C.textDark });
    s6.addText(sc.count, { x: cx + 0.3, y: 2.15, w: 3.2, h: 0.5, fontSize: 20, bold: true, color: sc.color });
    s6.addText(`Нийт дүн: ${sc.amount}`, { x: cx + 0.3, y: 2.7, w: 3.2, h: 0.3, fontSize: 11, color: C.textMuted });
  });

  // Status Detail Table
  const stRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Төлөв (Статус)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite } },
      { text: 'Захиалгын тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Мөнгөн дүн (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } }
    ]
  ];
  if (statusBreakdown.length > 0) {
    statusBreakdown.forEach((st, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      stRows.push([
        { text: st.status, options: { fill: { color: rf }, fontSize: 10, bold: true } },
        { text: `${st.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(st.revenue), options: { fill: { color: rf }, align: 'right', fontSize: 10 } }
      ]);
    });
  } else {
    stRows.push([
      {
        text: 'Тайлант хугацаанд бүртгэлтэй захиалга олдсонгүй',
        options: { colspan: 3, fill: { color: C.altRowFill }, align: 'center', fontSize: 10, color: C.textMuted }
      }
    ]);
  }

  s6.addTable(stRows, {
    x: 0.6,
    y: 3.7,
    w: 12.13,
    colW: [5.0, 3.0, 4.13],
    border: { type: 'solid', color: C.border, pt: 0.5 }
  });

  // ==========================================
  // SLIDE 7: FINANCIALS & RECEIVABLES
  // ==========================================
  const s7 = pptx.addSlide();
  s7.background = { color: C.lightBg };
  addHeader(s7, 'ТӨЛБӨРИЙН ЦУГЛАРАЛТ БА АВЛАГА', 'Нэхэмжилсэн дүн, бодит орлого, үлдэгдэл авлагын хяналт');

  const colRate = summary.totalRevenue > 0 ? (summary.totalPaid / summary.totalRevenue) * 100 : 0;
  const finCards = [
    { title: 'Нийт борлуулалт', value: formatMNT(summary.totalRevenue), color: C.primary },
    { title: 'Төлөгдсөн бодит дүн', value: formatMNT(summary.totalPaid), color: C.success },
    { title: 'Үлдэгдэл авлага', value: formatMNT(summary.totalReceivables), color: summary.totalReceivables > 0 ? C.danger : C.success },
    { title: 'Төлбөрийн цугларалт %', value: `${colRate.toFixed(1)}%`, color: colRate >= 80 ? C.success : C.warning }
  ];

  finCards.forEach((fc, idx) => {
    const cx = 0.6 + idx * 3.1;
    s7.addShape(pptx.ShapeType.rect, {
      x: cx,
      y: 1.6,
      w: 2.85,
      h: 2.0,
      fill: { color: 'FFFFFF' },
      line: { color: C.border, width: 1 }
    });
    s7.addText(fc.title, { x: cx + 0.2, y: 1.8, w: 2.45, h: 0.3, fontSize: 11, bold: true, color: C.textMuted });
    s7.addText(fc.value, { x: cx + 0.2, y: 2.2, w: 2.45, h: 0.6, fontSize: 18, bold: true, color: fc.color });
  });

  // Callout box on Collection
  s7.addShape(pptx.ShapeType.rect, {
    x: 0.6,
    y: 3.9,
    w: 12.13,
    h: 2.6,
    fill: { color: 'FFFFFF' },
    line: { color: C.border, width: 1 }
  });
  s7.addText('САНХҮҮ, АВЛАГЫН ЧИГЛЭЛ БА ЗӨВЛӨМЖ', {
    x: 0.9,
    y: 4.15,
    w: 11.5,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: C.primary
  });
  const finBullets = summary.totalRevenue > 0
    ? [
        `Тайлант хугацааны нийт борлуулалтаас ${colRate.toFixed(1)}%-ийн төлбөр амжилттай дансанд орсон байна.`,
        summary.totalReceivables > 0
          ? `Багийн нийт үлдэгдэл авлага ${formatMNT(summary.totalReceivables)} байгаа тул олгосон болон үйлдвэрлэлд яваа захиалгуудын төлбөрийг шуурхай барагдуулах шаардлагатай.`
          : `Бүх захиалгын төлбөр бүрэн төлөгдсөн, үлдэгдэл авлагагүй байна.`,
        `Дараагийн төлөвлөгөөт үед авлагын хэмжээг бууруулж, урьдчилгаа төлбөрийн харьцааг 70%+ түвшинд хадгалахыг зөвлөж байна.`
      ]
    : [
        `Сонгосон хугацаанд санхүүгийн төлбөрийн шилжүүлэг бүртгэгдээгүй байна.`,
        `Харилцагчдын авлагын тооцоог санхүүгийн албатай тулган хянаж, төлбөрийн сахилга батыг баримталж байна.`,
        `Захиалга авахдаа урьдчилгаа төлбөрийн хувийг (70%+) чанд мөрдөхийг зөвлөж байна.`
      ];
  s7.addText(finBullets.map(b => ({ text: `•  ${b}\n\n`, options: { fontSize: 11, color: '334155' } })), {
    x: 0.9,
    y: 4.6,
    w: 11.5,
    h: 1.7
  });

  // ==========================================
  // SLIDE 8: TOP 10 CUSTOMERS
  // ==========================================
  const s8 = pptx.addSlide();
  s8.background = { color: C.lightBg };
  addHeader(s8, 'ШИЛДЭГ ХАРИЛЦАГЧИД (TOP 10)', 'Компанийн хэмжээнд хамгийн их дүнгээр захиалга өгсөн гол харилцагч, түншүүд');

  const custRows: PptxGenJS.TableRow[] = [
    [
      { text: '№', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Харилцагчийн нэр', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'left' } },
      { text: 'Захиалгын тоо', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } },
      { text: 'Нийт борлуулалт (₮)', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'right' } },
      { text: 'Эзлэх хувь %', options: { bold: true, fill: { color: C.headerFill }, color: C.textWhite, align: 'center' } }
    ]
  ];

  if (topCustomers.length > 0) {
    topCustomers.forEach((cust, idx) => {
      const rf = idx % 2 === 1 ? C.altRowFill : 'FFFFFF';
      const pct = summary.totalRevenue > 0 ? (cust.totalAmount / summary.totalRevenue) * 100 : 0;
      custRows.push([
        { text: String(idx + 1), options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: cust.name, options: { fill: { color: rf }, bold: true, align: 'left', fontSize: 10 } },
        { text: `${cust.count} ш`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } },
        { text: formatMNT(cust.totalAmount), options: { fill: { color: rf }, align: 'right', fontSize: 10, bold: true, color: C.primary } },
        { text: `${pct.toFixed(1)}%`, options: { fill: { color: rf }, align: 'center', fontSize: 10 } }
      ]);
    });
  } else {
    custRows.push([
      {
        text: 'Тайлант хугацаанд харилцагчийн захиалга бүртгэгдээгүй байна',
        options: { colspan: 5, fill: { color: C.altRowFill }, align: 'center', fontSize: 10, color: C.textMuted }
      }
    ]);
  }

  s8.addTable(custRows, {
    x: 0.6,
    y: 1.6,
    w: 12.13,
    colW: [0.8, 4.5, 1.8, 3.2, 1.83],
    border: { type: 'solid', color: C.border, pt: 0.5 }
  });

  // ==========================================
  // SLIDE 9: MEETING CONCLUSIONS & NEXT GOALS
  // ==========================================
  const s9 = pptx.addSlide();
  s9.background = { color: C.darkBg };

  s9.addText('ДҮГНЭЛТ БА ЦААШДЫН ЗОРИЛТ', {
    x: 0.8,
    y: 0.8,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: C.textWhite
  });
  s9.addText(`${periodLabel} хурлын шийдвэр, анхаарах асуудал ба хамтын зорилт`, {
    x: 0.8,
    y: 1.4,
    w: 11.5,
    h: 0.4,
    fontSize: 12,
    color: '94A3B8'
  });

  // Left Box: Key Achievements
  s9.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 2.1,
    w: 5.6,
    h: 4.6,
    fill: { color: C.cardDark },
    line: { color: '334155', width: 1 }
  });
  s9.addText('ГОЛ АМЖИЛТ & ОЛОЛТУУД', {
    x: 1.1,
    y: 2.4,
    w: 5.0,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: '34D399'
  });
  const achievements = summary.totalOrders > 0
    ? [
        `Нийт ${summary.totalOrders} захиалга дээр ${formatMNT(summary.totalRevenue)} төгрөгийн борлуулалт амжилттай хийгдсэн.`,
        summary.target > 0
          ? `Борлуулалтын багийн зорилтын биелэлт ${summary.achievementRate.toFixed(1)}%-д хүрсэн.`
          : `Нийт гүйцэтгэсэн захиалгуудын дундаж дүн ${formatMNT(avgOrderVal)} байна.`,
        `Бүтээгдэхүүний ангиллууд жигд борлуулалттай явагдаж байна.`,
        effectiveManagerStats.length > 0 && effectiveManagerStats[0]?.actual > 0
          ? `Хамгийн өндөр борлуулалттай менежерээр ${effectiveManagerStats[0]?.name || 'Менежер'} (${formatMNT(effectiveManagerStats[0]?.actual || 0)}) шалгарсан.`
          : `Борлуулалтын менежерүүдийн идэвхжилт сайн байна.`
      ]
    : [
        `Борлуулалтын баг дараагийн үеийн захиалгын бэлтгэл ажлыг бүрэн хангасан.`,
        `Бүх менежерүүдийн төлөвлөгөөт зорилтыг шинэчлэн тодорхойлж байна.`,
        `Хэвлэлийн үйлдвэрийн хүчин чадалд нийцүүлэн шинэ бүтээгдэхүүний борлуулалтыг эхлүүлж байна.`,
        `Харилцагчийн суурийг өргөтгөх, түншлэлийг бэхжүүлэх уулзалтууд явагдаж байна.`
      ];
  s9.addText(achievements.map(a => ({ text: `✓  ${a}\n\n`, options: { fontSize: 11, color: 'E2E8F0' } })), {
    x: 1.1,
    y: 3.0,
    w: 5.0,
    h: 3.4
  });

  // Right Box: Action Items & Goals
  s9.addShape(pptx.ShapeType.rect, {
    x: 6.9,
    y: 2.1,
    w: 5.6,
    h: 4.6,
    fill: { color: C.cardDark },
    line: { color: '334155', width: 1 }
  });
  s9.addText('ЦААШДЫН ЗОРИЛТ & АНХААРАХ ЗҮЙЛС', {
    x: 7.2,
    y: 2.4,
    w: 5.0,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: '60A5FA'
  });
  const goals = [
    `Үлдэгдэл авлагын хэмжээг бууруулж, төлбөрийн цуглуулалтын хувийг 90%+ дээш гаргах.`,
    `Шинэ захиалагч, байгууллагуудыг татах харилцагчийн харилцааг идэвхжүүлэх.`,
    `Үйлдвэрлэлийн хугацаа болон хүргэлтийн сахилга батыг өндөр түвшинд хангах.`,
    `Дараагийн төлөвлөгөөт үеийн борлуулалтын төлөвлөгөөг менежер бүрээр нарийвчлан хуваарилж батлах.`
  ];
  s9.addText(goals.map(g => ({ text: `→  ${g}\n\n`, options: { fontSize: 11, color: 'E2E8F0' } })), {
    x: 7.2,
    y: 3.0,
    w: 5.0,
    h: 3.4
  });

  const fileName = isTeam
    ? `Borluulaltiin_bagin_tailan_${startDateStr}_${endDateStr}.pptx`
    : `Borluulaltiin_tailan_${targetUser?.name || 'sales'}_${startDateStr}_${endDateStr}.pptx`;

  await pptx.writeFile({ fileName });
};
