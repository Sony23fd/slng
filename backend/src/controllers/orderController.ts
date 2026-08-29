import { Request, Response } from 'express';
import prisma from '../db';

const generateOrderNumber = async (): Promise<string> => {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const prefix = `SP${yy}`;

  const startSeqConstant = await prisma.constant.findFirst({
    where: { type: 'ORDER_START_SEQ' }
  });
  const defaultStartSeq = startSeqConstant && !isNaN(parseInt(startSeqConstant.value)) 
    ? parseInt(startSeqConstant.value) 
    : 1;

  const lastOrder = await prisma.order.findFirst({
    where: { order_number: { startsWith: prefix } },
    orderBy: { id: 'desc' }
  });

  let sequence = defaultStartSeq;
  if (lastOrder && lastOrder.order_number) {
    const lastSeqStr = lastOrder.order_number.slice(prefix.length);
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      sequence = Math.max(lastSeq + 1, defaultStartSeq);
    }
  }
  return `${prefix}${String(sequence).padStart(5, '0')}`;
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userId = (req as any).user?.id;

    let order_number = null;
    let current_status = data.current_status || undefined;
    if (current_status && current_status !== 'Үнийн санал') {
      order_number = await generateOrderNumber();
      if (data.design_status === 'Эх бэлэн' && (current_status === 'Хүлээгдэж буй' || !current_status)) {
        const firstActive = await prisma.order_status.findFirst({ where: { type: 'ACTIVE' }, orderBy: { sequence: 'asc' } });
        if (firstActive) {
          current_status = firstActive.name;
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        order_number,
        customer_name: data.customer_name || '',
        phone: data.phone || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        product_name: data.product_name || '',
        category: data.category || null,
        binding_type: data.binding_type || null,
        total_qty: data.total_qty ? Number(data.total_qty) : 0,
        size: data.size || null,
        sub_size: data.sub_size || null,
        company_registry: data.company_registry || null,
        company_name: data.company_name || null,
        needs_ebarimt: data.needs_ebarimt === true || data.needs_ebarimt === 'true',
        needs_design: Boolean(data.needs_design),
        design_status: data.design_status || 'Эх бэлэн',
        design_cost: data.design_cost ? Number(data.design_cost) : 0,
        is_urgent: Boolean(data.is_urgent),
        sales_person_name: data.sales_person_name || null,
        sales_person_id: userId || null,
        notes: data.notes || null,
        profit_margin: data.profit_margin ? Number(data.profit_margin) : 0,
        has_vat: Boolean(data.has_vat),
        final_price: (data.final_price ?? data.finalPrice) ? Number(data.final_price ?? data.finalPrice) : 0,
        payment_method_1: data.payment_method_1 || null,
        payment_percent_1: data.payment_percent_1 ? Number(data.payment_percent_1) : null,
        payment_method_2: data.payment_method_2 || null,
        payment_percent_2: data.payment_percent_2 ? Number(data.payment_percent_2) : null,
        finance_notes: data.finance_notes || null,
        current_status: current_status,
        
        specifications: {
          create: {
            cover_color: data.cover_color || null,
            inner_color: data.inner_color || null,
            has_bookmark: data.has_bookmark || null,
            total_pages: data.total_pages ? Number(data.total_pages) : null,
            print_cost: data.print_cost ? Number(data.print_cost) : 0
          }
        },
        materials: {
          create: (data.materials || []).map((m: any) => ({
            material_name: m.material_name || '',
            size: m.size || null,
            print_size: m.print_size || null,
            press_sheet: m.press_sheet != null ? String(m.press_sheet) : null,
            base_qty: m.base_qty ? Number(m.base_qty) : null,
            extra_qty: m.extra_qty ? Number(m.extra_qty) : null,
            is_cover: Boolean(m.is_cover),
            total_qty: m.total_qty ? Number(m.total_qty) : 0,
            divide_by: m.divide_by ? Number(m.divide_by) : 1,
            unit_cost: m.unit_cost ? Number(m.unit_cost) : 0,
            sheet_qty: m.sheet_qty ? Number(m.sheet_qty) : null,
            total_cost: (m.sheet_qty ? Number(m.sheet_qty) : 0) * (m.unit_cost ? Number(m.unit_cost) : 0),
            notes: m.notes || null
          }))
        },
        operations: {
          create: (data.operations || []).map((o: any) => ({
            operation_name: o.operation_name || '',
            qty: o.qty ? Number(o.qty) : 0,
            unit_cost: o.unit_cost ? Number(o.unit_cost) : 0,
            total_cost: (o.qty ? Number(o.qty) : 0) * (o.unit_cost ? Number(o.unit_cost) : 0),
            notes: o.notes || null,
            is_manual: Boolean(o.is_manual)
          }))
        },
        outsourcedJobs: {
          create: (data.outsourcedJobs || data.outsourced || []).map((o: any) => ({
            job_name: o.job_name || o.contractor_name || '',
            qty: o.qty ? Number(o.qty) : 0,
            unit_cost: o.unit_cost ? Number(o.unit_cost) : 0,
            total_cost: (o.qty ? Number(o.qty) : 0) * (o.unit_cost ? Number(o.unit_cost) : 0),
            notes: [o.contractor_name ? `Гүйцэтгэгч: ${o.contractor_name}` : null, o.notes].filter(Boolean).join(' - ') || null
          }))
        }
      }
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order', details: error.message || String(error) });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { new_status, status, changed_by, notes } = req.body;

  try {
    const orderId = parseInt(id as string);
    const targetStatus = new_status || status;
    if (!targetStatus) {
      return res.status(400).json({ error: 'New status is required' });
    }

    // Resolve userId to Int
    let userId = (req as any).user?.id;
    if (!userId && changed_by !== undefined && !isNaN(Number(changed_by))) {
      userId = Number(changed_by);
    }
    if (!userId && typeof changed_by === 'string') {
      const foundUser = await prisma.user.findFirst({ where: { name: changed_by } });
      if (foundUser) userId = foundUser.id;
    }
    if (!userId) {
      userId = 1; // Fallback to ID 1
    }

    // Fetch the current order to get the old status
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const userRole = (req as any).user?.role;
    if (order.sales_person_id !== userId && !['ADMIN', 'PRODUCTION'].includes(userRole)) {
      return res.status(403).json({ error: 'Та энэ захиалгын төлөвийг өөрчлөх эрхгүй байна.' });
    }

    const old_status = order.current_status;

    if ((old_status === 'Бэлэн болсон' || old_status === 'Бэлэн') && targetStatus !== 'Хүлээлгэн өгсөн' && targetStatus !== 'Олгосон' && targetStatus !== 'Цуцлагдсан') {
      return res.status(400).json({ error: 'Бэлэн болсон захиалгыг буцааж үйлдвэрлэл рүү шилжүүлэх боломжгүй.' });
    }

    let order_number = order.order_number;
    if (targetStatus && targetStatus !== 'Үнийн санал' && !order_number) {
      order_number = await generateOrderNumber();
    }

    // Use Prisma Transaction
    const result = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { current_status: targetStatus, order_number }
      }),
      prisma.orderstatuslog.create({
        data: {
          order_id: orderId,
          changed_by: userId,
          old_status,
          new_status: targetStatus,
          notes: notes || null
        }
      })
    ]);

    res.status(200).json({ message: 'Order status updated successfully', order: result[0], log: result[1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const statusType = req.query.statusType as string; // e.g. 'ALL', 'QUOTE', 'PENDING', 'IN_PRODUCTION', 'READY', 'DELIVERED'
    const isMine = req.query.isMine === 'true';
    const kanbanLimit = req.query.kanbanLimit === 'true';
    const userId = (req as any).user?.id;
    
    let where: any = {};
    
    if (search) {
      where.OR = [
        { customer_name: { contains: search } },
        { product_name: { contains: search } },
        { order_number: { contains: search } }
      ];
    }
    
    if (isMine && userId) {
      where.userId = userId;
    }
    
    if (statusType && statusType !== 'ALL') {
      const statuses = await prisma.order_status.findMany({
        where: { type: statusType }
      }).catch(() => []); // Fallback if table doesn't exist
      const statusNames = statuses.map((s: any) => s.name);
      if (statusNames.length > 0) {
        where.current_status = { in: statusNames };
      } else {
        // Hardcoded fallbacks
        if (statusType === 'DELIVERED') where.current_status = { in: ['Хүлээлгэн өгсөн', 'Олгосон'] };
        else if (statusType === 'READY') where.current_status = { in: ['Бэлэн болсон', 'Бэлэн'] };
        else if (statusType === 'PENDING') where.current_status = 'Хүлээгдэж буй';
        else if (statusType === 'QUOTE') where.current_status = 'Үнийн санал';
      }
    }

    if (kanbanLimit) {
      // Kanban mode: return only active orders without pagination, limited to 200
      const activeStatuses = await prisma.order_status.findMany({
        where: { type: { notIn: ['QUOTE', 'DELIVERED'] } }
      });
      
      const activeStatusNames = activeStatuses.map(s => s.name);
      
      // If a specific statusType was requested along with kanbanLimit, respect it 
      // but only if it is within active statuses (handled naturally by AND logic)
      if (where.current_status) {
         // keep it as is
      } else {
         where.current_status = { in: activeStatusNames };
      }
      
      const orders = await prisma.order.findMany({
        where,
        take: 200,
        orderBy: { createdAt: 'desc' },
        include: { user: true, materials: true, operations: true, outsourcedJobs: true }
      });
      
      return res.json({ data: orders, meta: { total: orders.length, page: 1, limit: 200, totalPages: 1 } });
    }

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        materials: true,
        operations: true,
        outsourcedJobs: true,
      }
    });
    
    res.json({
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
};

export const updateOrderStages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { production_stages, current_status } = req.body;
  const userId = (req as any).user?.id || 1;
  try {
    const orderId = parseInt(id as string);
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData: any = {};
    if (production_stages !== undefined) updateData.production_stages = production_stages;
    if (current_status !== undefined) updateData.current_status = current_status;

    let targetStatus = current_status !== undefined ? current_status : existingOrder.current_status;
    let autoCompleted = false;

    if (targetStatus && targetStatus !== 'Үнийн санал' && !existingOrder.order_number) {
      updateData.order_number = await generateOrderNumber();
    }

    if (production_stages !== undefined) {
      const standardKeys = ['design', 'raw_material', 'ctp', 'print', 'inspect', 'fold', 'bind'];
      let stagesToCheck = production_stages;
      if (typeof stagesToCheck === 'string') {
        try { stagesToCheck = JSON.parse(stagesToCheck); } catch (e) {}
      }
      if (stagesToCheck && typeof stagesToCheck === 'object') {
        const allCompleted = standardKeys.every(k => Number(stagesToCheck[k]?.status) === 100);
        if (allCompleted && targetStatus !== 'Бэлэн болсон' && targetStatus !== 'Бэлэн' && targetStatus !== 'Хүлээлгэн өгсөн' && targetStatus !== 'Олгосон') {
          targetStatus = 'Бэлэн болсон';
          updateData.current_status = 'Бэлэн болсон';
          autoCompleted = true;
        }
      }
    }

    const oldStatus = existingOrder.current_status;
    const statusChanged = targetStatus !== oldStatus && targetStatus !== undefined;

    if (statusChanged) {
      const result = await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: updateData
        }),
        prisma.orderstatuslog.create({
          data: {
            order_id: orderId,
            changed_by: userId,
            old_status: oldStatus,
            new_status: targetStatus,
            notes: autoCompleted ? 'Үйлдвэрлэлийн бүх шат 100% дууссан тул автоматаар Бэлэн төлөвт шилжив' : null
          }
        })
      ]);

      if (autoCompleted) {
        // Send notification to Sales and Admins only if not already sent
        const existingNotif = await prisma.notification.findFirst({
          where: { order_id: orderId, title: 'Захиалга бэлэн боллоо' }
        });

        if (!existingNotif) {
          const usersToNotify = await prisma.user.findMany({
            where: { role: { in: ['SALES', 'ADMIN'] } }
          });
          const notifications = usersToNotify.map(u => ({
            user_id: u.id,
            order_id: orderId,
            title: 'Захиалга бэлэн боллоо',
            message: `Захиалга #${existingOrder.order_number || existingOrder.id} (${existingOrder.product_name}) 100% үйлдвэрлэгдэж дууслаа.`,
          }));
          if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
          }
        }
      }

      return res.json({ message: 'Production stages updated successfully', order: result[0], autoCompleted });
    } else {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData
      });
      return res.json({ message: 'Production stages updated successfully', order: updatedOrder, autoCompleted: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update production stages' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const orders = await prisma.order.findMany({
      where: { sales_person_id: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        specifications: true,
        materials: true,
        operations: true,
        outsourcedJobs: true,
        user: true,
        payments: true,
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const orderId = parseInt(id as string);
    
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) return res.status(404).json({ error: 'Order not found' });

    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    if (existingOrder.sales_person_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Та энэ захиалгыг засах эрхгүй байна.' });
    }

    let order_number = existingOrder.order_number;
    let current_status = data.current_status || undefined;
    if (current_status && current_status !== 'Үнийн санал') {
      if (!order_number) {
        order_number = await generateOrderNumber();
      }
      
      const isPendingStatus = current_status === 'Хүлээгдэж буй' || existingOrder.current_status === 'Үнийн санал' || existingOrder.current_status === 'Хүлээгдэж буй';
      if (data.design_status === 'Эх бэлэн' && isPendingStatus) {
        const firstActive = await prisma.order_status.findFirst({ where: { type: 'ACTIVE' }, orderBy: { sequence: 'asc' } });
        if (firstActive) {
          current_status = firstActive.name;
        }
      }
    }

    // We need to delete old relations and recreate them for simplicity
    await prisma.$transaction([
      prisma.orderspecification.deleteMany({ where: { order_id: orderId } }),
      prisma.ordermaterial.deleteMany({ where: { order_id: orderId } }),
      prisma.orderoperation.deleteMany({ where: { order_id: orderId } }),
      prisma.orderoutsourced.deleteMany({ where: { order_id: orderId } }),
      
      prisma.order.update({
        where: { id: orderId },
        data: {
          order_number,
          current_status: current_status,
          customer_name: data.customer_name || '',
          phone: data.phone || null,
          deadline: data.deadline ? new Date(data.deadline) : null,
          product_name: data.product_name || '',
          category: data.category || null,
          binding_type: data.binding_type || null,
          total_qty: data.total_qty ? Number(data.total_qty) : 0,
          size: data.size || null,
          sub_size: data.sub_size || null,
          needs_design: Boolean(data.needs_design),
          design_status: data.design_status || 'Эх бэлэн',
          design_cost: data.design_cost ? Number(data.design_cost) : 0,
          is_urgent: Boolean(data.is_urgent),
          notes: data.notes || null,
          profit_margin: data.profit_margin ? Number(data.profit_margin) : 0,
          has_vat: Boolean(data.has_vat),
          final_price: (data.final_price ?? data.finalPrice) ? Number(data.final_price ?? data.finalPrice) : 0,
          payment_method_1: data.payment_method_1 || null,
          payment_percent_1: data.payment_percent_1 ? Number(data.payment_percent_1) : null,
          payment_method_2: data.payment_method_2 || null,
          payment_percent_2: data.payment_percent_2 ? Number(data.payment_percent_2) : null,
          finance_notes: data.finance_notes || null,
          
          specifications: {
            create: {
              cover_color: data.cover_color || null,
              inner_color: data.inner_color || null,
              has_bookmark: data.has_bookmark || null,
              total_pages: data.total_pages ? Number(data.total_pages) : null,
              print_cost: data.print_cost ? Number(data.print_cost) : 0
            }
          },
          materials: {
            create: (data.materials || []).map((m: any) => ({
              material_name: m.material_name || '',
              size: m.size || null,
              print_size: m.print_size || null,
              press_sheet: m.press_sheet != null ? String(m.press_sheet) : null,
              base_qty: m.base_qty ? Number(m.base_qty) : null,
              extra_qty: m.extra_qty ? Number(m.extra_qty) : null,
              is_cover: Boolean(m.is_cover),
              total_qty: m.total_qty ? Number(m.total_qty) : 0,
              divide_by: m.divide_by ? Number(m.divide_by) : 1,
              unit_cost: m.unit_cost ? Number(m.unit_cost) : 0,
              sheet_qty: m.sheet_qty ? Number(m.sheet_qty) : null,
              total_cost: (m.sheet_qty ? Number(m.sheet_qty) : 0) * (m.unit_cost ? Number(m.unit_cost) : 0),
              notes: m.notes || null
            }))
          },
          operations: {
            create: (data.operations || []).map((o: any) => ({
              operation_name: o.operation_name || '',
              qty: o.qty ? Number(o.qty) : 0,
              unit_cost: o.unit_cost ? Number(o.unit_cost) : 0,
              total_cost: (o.qty ? Number(o.qty) : 0) * (o.unit_cost ? Number(o.unit_cost) : 0),
              notes: o.notes || null,
              is_manual: Boolean(o.is_manual)
            }))
          },
          outsourcedJobs: {
            create: (data.outsourcedJobs || data.outsourced || []).map((o: any) => ({
              job_name: o.job_name || o.contractor_name || '',
              qty: o.qty ? Number(o.qty) : 0,
              unit_cost: o.unit_cost ? Number(o.unit_cost) : 0,
              total_cost: (o.qty ? Number(o.qty) : 0) * (o.unit_cost ? Number(o.unit_cost) : 0),
              notes: [o.contractor_name ? `Гүйцэтгэгч: ${o.contractor_name}` : null, o.notes].filter(Boolean).join(' - ') || null
            }))
          }
        }
      })
    ]);
    
    res.json({ message: 'Order updated successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order', details: error.message || String(error) });
  }
};
