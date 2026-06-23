import { Request, Response } from 'express';
import prisma from '../db';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userId = (req as any).user?.id;

    // Generate Order Number
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const prefix = `SP${yy}`;

    // Get starting sequence from Constant
    const startSeqConstant = await prisma.constant.findFirst({
      where: { type: 'ORDER_START_SEQ' }
    });
    const defaultStartSeq = startSeqConstant && !isNaN(parseInt(startSeqConstant.value)) 
      ? parseInt(startSeqConstant.value) 
      : 1;

    // Get last order of this year
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
    const order_number = `${prefix}${String(sequence).padStart(5, '0')}`;

    const order = await prisma.order.create({
      data: {
        order_number,
        customer_name: data.customer_name,
        phone: data.phone,
        deadline: data.deadline ? new Date(data.deadline) : null,
        product_name: data.product_name,
        category: data.category,
        total_qty: data.total_qty ? Number(data.total_qty) : 0,
        size: data.size,
        sub_size: data.sub_size,
        needs_design: data.needs_design,
        is_urgent: data.is_urgent,
        sales_person_name: data.sales_person_name,
        sales_person_id: userId,
        notes: data.notes,
        profit_margin: data.profit_margin ? Number(data.profit_margin) : 0,
        has_vat: data.has_vat,
        final_price: data.final_price ? Number(data.final_price) : 0,
        payment_method_1: data.payment_method_1,
        payment_percent_1: data.payment_percent_1 ? Number(data.payment_percent_1) : null,
        payment_method_2: data.payment_method_2,
        payment_percent_2: data.payment_percent_2 ? Number(data.payment_percent_2) : null,
        finance_notes: data.finance_notes,
        
        specifications: {
          create: {
            cover_color: data.cover_color,
            inner_color: data.inner_color,
            has_bookmark: data.has_bookmark,
            total_pages: data.total_pages,
            print_cost: data.print_cost ? Number(data.print_cost) : 0
          }
        },
        materials: {
          create: data.materials
        },
        operations: {
          create: data.operations
        },
        outsourcedJobs: {
          create: data.outsourcedJobs
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { new_status, changed_by, notes } = req.body;

  try {
    const orderId = parseInt(id as string);

    // Fetch the current order to get the old status
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const old_status = order.current_status;

    // Use Prisma Transaction
    const result = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { current_status: new_status }
      }),
      prisma.orderstatuslog.create({
        data: {
          order_id: orderId,
          changed_by: changed_by, // This should come from req.user (JWT)
          old_status,
          new_status,
          notes
        }
      })
    ]);

    res.status(200).json({ message: 'Order status updated successfully', order: result[0], log: result[1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
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
    
    // We need to delete old relations and recreate them for simplicity
    await prisma.$transaction([
      prisma.orderspecification.deleteMany({ where: { order_id: orderId } }),
      prisma.ordermaterial.deleteMany({ where: { order_id: orderId } }),
      prisma.orderoperation.deleteMany({ where: { order_id: orderId } }),
      prisma.orderoutsourced.deleteMany({ where: { order_id: orderId } }),
      
      prisma.order.update({
        where: { id: orderId },
        data: {
          customer_name: data.customer_name,
          phone: data.phone,
          deadline: data.deadline ? new Date(data.deadline) : null,
          product_name: data.product_name,
          category: data.category,
          total_qty: data.total_qty ? Number(data.total_qty) : 0,
          size: data.size,
          sub_size: data.sub_size,
          needs_design: data.needs_design,
          is_urgent: data.is_urgent,
          notes: data.notes,
          profit_margin: data.profit_margin ? Number(data.profit_margin) : 0,
          has_vat: data.has_vat,
          final_price: data.final_price ? Number(data.final_price) : 0,
          payment_method_1: data.payment_method_1,
          payment_percent_1: data.payment_percent_1 ? Number(data.payment_percent_1) : null,
          payment_method_2: data.payment_method_2,
          payment_percent_2: data.payment_percent_2 ? Number(data.payment_percent_2) : null,
          finance_notes: data.finance_notes,
          
          specifications: {
            create: {
              cover_color: data.cover_color,
              inner_color: data.inner_color,
              has_bookmark: data.has_bookmark,
              total_pages: data.total_pages,
              print_cost: data.print_cost ? Number(data.print_cost) : 0
            }
          },
          materials: { create: data.materials },
          operations: { create: data.operations },
          outsourcedJobs: { create: data.outsourcedJobs }
        }
      })
    ]);
    
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};
