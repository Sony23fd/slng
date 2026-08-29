import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add a new payment
export const addPayment = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const { amount, method, notes } = req.body;
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

    // Since types may not have generated properly, use any for the prisma model if needed, but standard TS works.
    const payment = await (prisma as any).payment.create({
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

    res.status(201).json({ message: 'Payment recorded successfully', payment });
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
