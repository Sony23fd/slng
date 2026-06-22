import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllRules = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const rules = await prisma.coverrule.findMany();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching cover rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

export const createRule = async (req: Request, res: Response) => {
  try {
    const { size, binding, press_sheet, divide_by, print_size } = req.body;
    // @ts-ignore
    const rule = await prisma.coverrule.create({
      data: {
        size,
        binding,
        press_sheet: Number(press_sheet),
        divide_by: Number(divide_by),
        print_size
      }
    });
    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating cover rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { size, binding, press_sheet, divide_by, print_size } = req.body;
    // @ts-ignore
    const rule = await prisma.coverrule.update({
      where: { id: Number(id) },
      data: {
        size,
        binding,
        press_sheet: Number(press_sheet),
        divide_by: Number(divide_by),
        print_size
      }
    });
    res.json(rule);
  } catch (error) {
    console.error('Error updating cover rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    await prisma.coverrule.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting cover rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
