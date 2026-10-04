import { Request, Response } from 'express';
import prisma from '../db';

// Add a new payment
export const addPayment = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const { amount, method, notes, start_production } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || !method) {
      return res.status(400).json({ error: 'Amount and method are required' });
    }

    const orderId = Number(order_id);

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        order_id: orderId,
        amount: Number(amount),
        method,
        notes,
        created_by: userId
      },
      include: {
        user: {
          select: { name: true, full_name: true }
        }
      }
    });

    // Compute updated balance
    const allPayments = await prisma.payment.findMany({ where: { order_id: orderId } });
    const totalPaid = allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const finalPrice = Math.round(Number(order.final_price) || 0);
    const remainingBalance = Math.max(0, finalPrice - totalPaid);

    // If order was pending finance and user requested start_production (or full/advance paid)
    if (start_production && (order.current_status === 'Санхүү хүлээгдэж буй' || order.current_status === 'Хүлээгдэж буй')) {
      await prisma.order.update({
        where: { id: orderId },
        data: { current_status: 'Үйлдвэрлэлд' }
      });
      await prisma.orderstatuslog.create({
        data: {
          order_id: orderId,
          changed_by: userId,
          old_status: order.current_status,
          new_status: 'Үйлдвэрлэлд',
          notes: 'Урьдчилгаа төлбөр батлагдаж үйлдвэрлэлд шилжүүлэв'
        }
      });
    }

    // Notify salesperson
    if (order.sales_person_id) {
      const balanceText = remainingBalance > 0 ? `Үлдэгдэл: ${remainingBalance.toLocaleString()} ₮` : 'Бүрэн төлөгдсөн (0 ₮)';
      await prisma.notification.create({
        data: {
          user_id: order.sales_person_id,
          order_id: orderId,
          title: '💸 Төлбөр бүртгэгдлээ',
          message: `Захиалга #${order.order_number || order.id} (${order.product_name}) дээр ${Number(amount).toLocaleString()} ₮ төлбөр (${method}) бүртгэгдлээ. ${balanceText}`
        }
      });
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
      paid_amount: totalPaid,
      remaining_balance: remainingBalance,
      payment_status: remainingBalance <= 0 ? 'PAID' : 'PARTIAL'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Get payments for an order
export const getOrderPayments = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const orderId = Number(order_id);

    const payments = await (prisma as any).payment.findMany({
      where: { order_id: orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, full_name: true }
        }
      }
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
