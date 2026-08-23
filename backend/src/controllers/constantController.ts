import { Request, Response } from 'express';
import prisma from '../db';

export const getConstants = async (req: Request, res: Response) => {
  try {
    const constants = await prisma.constant.findMany();
    res.json(constants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch constants' });
  }
};

export const createConstant = async (req: Request, res: Response) => {
  const { type, value, description } = req.body;
  try {
    const constant = await prisma.constant.create({
      data: { type, value, description }
    });
    res.json(constant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create constant' });
  }
};

export const deleteConstant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const constantId = parseInt(id as string);
    const existing = await prisma.constant.findUnique({ where: { id: constantId } });
    
    if (!existing) {
      res.status(404).json({ error: 'Constant not found' });
      return;
    }

    if (existing.type === 'ORDER_STATUS') {
      const coreStatuses = ['Шинэ захиалга', 'Хүлээгдэж буй', 'Бэлэн болсон', 'Хүлээлгэн өгсөн'];
      if (coreStatuses.includes(existing.value)) {
        res.status(400).json({ error: `Энэхүү '${existing.value}' төлөв нь системийн үндсэн төлөв тул устгах боломжгүй.` });
        return;
      }
      
      const count = await prisma.order.count({ where: { current_status: existing.value } });
      if (count > 0) {
        res.status(400).json({ error: `Энэ төлөвийг ашиглаж буй ${count} захиалга байгаа тул устгах боломжгүй.` });
        return;
      }
    }

    await prisma.constant.delete({ where: { id: constantId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete constant' });
  }
};

export const updateConstant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, value, description } = req.body;
  try {
    const constantId = parseInt(id as string);
    const existing = await prisma.constant.findUnique({ where: { id: constantId } });
    
    if (!existing) {
      res.status(404).json({ error: 'Constant not found' });
      return;
    }

    if (existing.type === 'ORDER_STATUS' && existing.value !== value) {
      const coreStatuses = ['Шинэ захиалга', 'Хүлээгдэж буй', 'Бэлэн болсон', 'Хүлээлгэн өгсөн'];
      if (coreStatuses.includes(existing.value)) {
        res.status(400).json({ error: `Энэхүү '${existing.value}' төлөв нь системийн үндсэн төлөв тул нэрийг солих боломжгүй.` });
        return;
      }
      
      // Update all orders that had the old status to the new status
      await prisma.order.updateMany({
        where: { current_status: existing.value },
        data: { current_status: value }
      });
    }

    const updated = await prisma.constant.update({
      where: { id: constantId },
      data: { type, value, description }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update constant' });
  }
};
