import prisma from '../src/db';

async function auditAdminSync() {
  console.log('=== ADMIN SYSTEM AUDIT START ===\n');

  // 1. Cover Rules
  const coverRules = await (prisma as any).coverrule.findMany({ orderBy: { id: 'asc' } });
  console.log(`[1] Cover Rules: ${coverRules.length} rules found.`);
  const bRules = coverRules.filter((r: any) => ['B4', 'B5', 'B6'].includes(r.size));
  console.log('B-Series Cover Rules:', JSON.stringify(bRules, null, 2));

  // 2. Product Categories
  const categories = await (prisma as any).product_category.findMany({ orderBy: { sort_order: 'asc' } });
  console.log(`\n[2] Product Categories: ${categories.length} categories found.`);
  const groups = Array.from(new Set(categories.map((c: any) => c.group_name)));
  console.log('Category Groups:', groups);

  // 3. Product Templates
  const templates = await (prisma as any).producttemplate.findMany({ orderBy: { id: 'asc' } });
  console.log(`\n[3] Product Templates: ${templates.length} templates found.`);
  templates.forEach((t: any) => {
    console.log(` - ID ${t.id}: ${t.template_name} | Cat: ${t.category} | Size: ${t.size} | Has order_data: ${!!t.order_data}`);
  });

  // 4. Formulas
  const formulas = await (prisma as any).calculation_formula.findMany({ orderBy: { id: 'asc' } });
  console.log(`\n[4] Formulas: ${formulas.length} formulas found.`);
  formulas.forEach((f: any) => {
    console.log(` - ID ${f.id}: "${f.name}" => "${f.expression}"`);
  });

  // 5. Master Prices
  const totalPrices = await (prisma as any).masterprice.count();
  const pricesByCategory = await (prisma as any).masterprice.groupBy({
    by: ['category'],
    _count: { id: true }
  });
  console.log(`\n[5] Master Prices: ${totalPrices} items.`);
  console.log('Prices by Category:', pricesByCategory);

  // Check CTP prices
  const ctpPrices = await (prisma as any).masterprice.findMany({
    where: { item_name: { contains: 'CTP' } }
  });
  console.log('CTP Plate Items:', ctpPrices.map((p: any) => ({ name: p.item_name, unit_cost: p.unit_cost, price: p.price })));

  // Check Coating materials
  const coatingPrices = await (prisma as any).masterprice.findMany({
    where: { item_name: { contains: 'Бүрэлт' } }
  });
  console.log('Coating Items:', coatingPrices.map((p: any) => ({ name: p.item_name, unit_cost: p.unit_cost, price: p.price })));

  // Check Cardboard
  const cardboard = await (prisma as any).masterprice.findMany({
    where: { item_name: { contains: 'Картон' } }
  });
  console.log('Cardboard Items:', cardboard.map((p: any) => ({ name: p.item_name, unit_cost: p.unit_cost, price: p.price })));

  // 6. Order Statuses
  const statuses = await (prisma as any).order_status.findMany({ orderBy: { sequence: 'asc' } });
  console.log(`\n[6] Order Statuses: ${statuses.length} statuses found.`);
  statuses.forEach((s: any) => {
    console.log(` - #${s.sequence} ${s.name} (${s.type}) [color: ${s.color}]`);
  });

  // 7. System Constants
  const constants = await (prisma as any).constant.findMany();
  const constantTypes = Array.from(new Set(constants.map((c: any) => c.type)));
  console.log(`\n[7] Constants: ${constants.length} total across types:`, constantTypes);

  // 8. Users
  const users = await (prisma as any).user.findMany({ select: { id: true, name: true, role: true, full_name: true, phone: true } });
  console.log(`\n[8] Users: ${users.length} users found.`);
  users.forEach((u: any) => console.log(` - ${u.id}: ${u.name} (${u.role}) - ${u.full_name || ''} ${u.phone || ''}`));

  // 9. Customers
  const customerCount = await (prisma as any).customer.count();
  console.log(`\n[9] Customers: ${customerCount} total.`);

  console.log('\n=== AUDIT COMPLETE ===');
  process.exit(0);
}

auditAdminSync().catch(err => {
  console.error(err);
  process.exit(1);
});
