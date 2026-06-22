import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllFormulas = async (req: Request, res: Response) => {
  try {
    const formulas = await prisma.calculation_formula.findMany();
    res.json(formulas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch formulas' });
  }
};

export const createFormula = async (req: Request, res: Response) => {
  try {
    const { name, expression, description } = req.body;
    const formula = await prisma.calculation_formula.create({
      data: { name, expression, description }
    });
    res.status(201).json(formula);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create formula' });
  }
};

export const updateFormula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, expression, description } = req.body;
    const formula = await prisma.calculation_formula.update({
      where: { id: Number(id) },
      data: { name, expression, description }
    });
    res.json(formula);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update formula' });
  }
};

export const deleteFormula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.calculation_formula.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete formula' });
  }
};
