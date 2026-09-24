import { Request, Response } from 'express';
import prisma from '../db';

const compareProductSizes = (a: string, b: string): number => {
  const normA = (a || '').trim().replace(/\u0410/g, 'A').replace(/\u0430/g, 'a').replace(/\u0412/g, 'B').replace(/\u0432/g, 'b').toUpperCase();
  const normB = (b || '').trim().replace(/\u0410/g, 'A').replace(/\u0430/g, 'a').replace(/\u0412/g, 'B').replace(/\u0432/g, 'b').toUpperCase();
  
  if (normA === 'CUSTOM') return 1;
  if (normB === 'CUSTOM') return -1;
  
  const matchA = normA.match(/^([AB])(\d+)/);
  const matchB = normB.match(/^([AB])(\d+)/);
  
  if (matchA && matchB) {
    if (matchA[1] !== matchB[1]) {
      return matchA[1] === 'A' ? -1 : 1;
    }
    const numA = parseInt(matchA[2], 10);
    const numB = parseInt(matchB[2], 10);
    if (numA !== numB) return numA - numB;
  } else if (matchA) {
    return -1;
  } else if (matchB) {
    return 1;
  }
  
  return normA.localeCompare(normB);
};

export const getConstants = async (req: Request, res: Response) => {
  try {
    const constants = await prisma.constant.findMany({
      orderBy: { id: 'asc' }
    });
    
    const sizeConstants = constants
      .filter(c => c.type === 'SIZE')
      .sort((a, b) => compareProductSizes(a.value, b.value));
    
    const otherConstants = constants.filter(c => c.type !== 'SIZE');
    
    res.json([...otherConstants, ...sizeConstants]);
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
      const coreStatuses = ['Үнийн санал', 'Санхүү хүлээгдэж буй', 'Үйлдвэрлэлд', 'Бэлэн болсон', 'Хүлээлгэн өгсөн', 'Цуцлагдсан'];
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
      const coreStatuses = ['Үнийн санал', 'Санхүү хүлээгдэж буй', 'Үйлдвэрлэлд', 'Бэлэн болсон', 'Хүлээлгэн өгсөн', 'Цуцлагдсан'];
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
