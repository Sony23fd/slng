import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOrderStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await prisma.order_status.findMany({
      orderBy: { sequence: 'asc' }
    });
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching order statuses:', error);
    res.status(500).json({ error: 'Failed to fetch order statuses' });
  }
};

export const createOrderStatus = async (req: Request, res: Response) => {
  try {
    const { name, color, sequence, type } = req.body;
    
    // Default system flags are always false for custom ones
    const newStatus = await prisma.order_status.create({
      data: {
        name,
        color: color || '#cbd5e1',
        sequence: sequence || 0,
        type: type || 'ACTIVE',
        is_system: false
      }
    });
    res.status(201).json(newStatus);
  } catch (error: any) {
    console.error('Error creating order status:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ийм нэртэй төлөв аль хэдийн байна.' });
    }
    res.status(500).json({ error: 'Failed to create order status' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, sequence, type } = req.body;
    
    // Check if status exists
    const existing = await prisma.order_status.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: 'Status not found' });

    // If changing name, we must update all orders with this current_status
    if (name && name !== existing.name) {
      // Begin transaction to update both status and orders
      const [updatedStatus, updatedOrders] = await prisma.$transaction([
        prisma.order_status.update({
          where: { id: Number(id) },
          data: { name, color, sequence, type } // Can't change is_system
        }),
        prisma.order.updateMany({
          where: { current_status: existing.name },
          data: { current_status: name }
        })
      ]);
      return res.json(updatedStatus);
    } else {
      // Just updating color, sequence, type
      const updatedStatus = await prisma.order_status.update({
        where: { id: Number(id) },
        data: { color, sequence, type }
      });
      return res.json(updatedStatus);
    }
  } catch (error: any) {
    console.error('Error updating order status:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ийм нэртэй төлөв аль хэдийн байна.' });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const deleteOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.order_status.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: 'Status not found' });
    
    if (existing.is_system) {
      return res.status(400).json({ error: 'Системийн төлвийг устгах боломжгүй.' });
    }

    // Check if any orders are using it
    const orderCount = await prisma.order.count({
      where: { current_status: existing.name }
    });

    if (orderCount > 0) {
      return res.status(400).json({ 
        error: `Энэ төлөв дээр ${orderCount} ширхэг захиалга байгаа тул устгах боломжгүй.` 
      });
    }

    await prisma.order_status.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order status:', error);
    res.status(500).json({ error: 'Failed to delete order status' });
  }
};
