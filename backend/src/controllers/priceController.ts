import { Request, Response } from 'express';
import prisma from '../db';

export const getPrices = async (req: Request, res: Response) => {
  try {
    const prices = await prisma.masterprice.findMany({
      include: { formula: true }
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { unit_cost, formula_id } = req.body;
  const userId = (req as any).user?.id; // from auth middleware

  try {
    const priceId = parseInt(id as string);
    const oldPrice = await prisma.masterprice.findUnique({ where: { id: priceId } });

    if (!oldPrice) {
      return res.status(404).json({ error: 'Price not found' });
    }

    const dataToUpdate: any = { unit_cost: Number(unit_cost) };
    if (formula_id !== undefined) {
      dataToUpdate.formula_id = formula_id ? Number(formula_id) : null;
    }

    const result = await prisma.$transaction([
      prisma.masterprice.update({
        where: { id: priceId },
        data: dataToUpdate
      }),
      prisma.masterpricelog.create({
        data: {
          masterPriceId: priceId,
          changed_by: userId,
          old_cost: oldPrice.unit_cost,
          new_cost: Number(unit_cost)
        }
      })
    ]);

    res.json({ message: 'Price updated successfully', price: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update price' });
  }
};

export const createPrice = async (req: Request, res: Response) => {
  const { category, item_name, unit_cost, formula_id } = req.body;
  const userId = (req as any).user?.id;

  try {
    const dataToCreate: any = {
      category,
      item_name,
      unit_cost: Number(unit_cost)
    };
    if (formula_id) {
      dataToCreate.formula_id = Number(formula_id);
    }

    const price = await prisma.masterprice.create({
      data: dataToCreate
    });

    // Create an initial log
    await prisma.masterpricelog.create({
      data: {
        masterPriceId: price.id,
        changed_by: userId,
        old_cost: 0,
        new_cost: price.unit_cost
      }
    });

    res.json(price);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create price' });
  }
};
