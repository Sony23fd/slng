import { Request, Response } from 'express';
import prisma from '../db';

export const getPrices = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const search = req.query.search as string;
    const category = req.query.category as string;

    let where: any = {};
    if (category && category !== 'All' && category !== 'Бүгд') {
      where.category = category;
    }
    if (search) {
      const searchCondition = [
        { item_name: { contains: search } },
        { category: { contains: search } }
      ];
      if (where.category) {
        where.AND = [
          { category: where.category },
          { OR: searchCondition }
        ];
        delete where.category;
      } else {
        where.OR = searchCondition;
      }
    }

    if (page && limit) {
      const total = await prisma.masterprice.count({ where });
      const prices = await prisma.masterprice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ category: 'asc' }, { item_name: 'asc' }],
        include: { formula: true }
      });
      res.json({
        data: prices,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      const prices = await prisma.masterprice.findMany({
        where,
        orderBy: [{ category: 'asc' }, { item_name: 'asc' }],
        include: { formula: true }
      });
      res.json(prices);
    }
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

export const bulkUpdatePrices = async (req: Request, res: Response) => {
  const { items } = req.body; // Array of { id: number, unit_cost: number, formula_id?: number | null }
  const userId = (req as any).user?.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  try {
    const results = [];
    for (const item of items) {
      const priceId = parseInt(item.id);
      const oldPrice = await prisma.masterprice.findUnique({ where: { id: priceId } });
      if (!oldPrice) continue;

      const newCost = Number(item.unit_cost);
      const dataToUpdate: any = { unit_cost: newCost };
      if (item.formula_id !== undefined) {
        dataToUpdate.formula_id = item.formula_id ? Number(item.formula_id) : null;
      }

      const isCostChanged = oldPrice.unit_cost !== newCost;
      const isFormulaChanged = item.formula_id !== undefined && oldPrice.formula_id !== dataToUpdate.formula_id;

      if (isCostChanged || isFormulaChanged) {
        const [updated] = await prisma.$transaction([
          prisma.masterprice.update({
            where: { id: priceId },
            data: dataToUpdate
          }),
          prisma.masterpricelog.create({
            data: {
              masterPriceId: priceId,
              changed_by: userId,
              old_cost: oldPrice.unit_cost,
              new_cost: newCost
            }
          })
        ]);
        results.push(updated);
      } else {
        results.push(oldPrice);
      }
    }
    res.json({ message: 'Bulk update successful', count: results.length, data: results });
  } catch (error) {
    console.error('Failed to bulk update prices:', error);
    res.status(500).json({ error: 'Failed to bulk update prices' });
  }
};

export const importPrices = async (req: Request, res: Response) => {
  const { items } = req.body; // Array of { category: string, item_name: string, unit_cost: number }
  const userId = (req as any).user?.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided for import' });
  }

  try {
    let updatedCount = 0;
    let createdCount = 0;

    for (const row of items) {
      const category = (row.category || 'Цаас').trim();
      const itemName = (row.item_name || '').trim();
      const unitCost = Number(row.unit_cost);

      if (!itemName || isNaN(unitCost)) continue;

      const existing = await prisma.masterprice.findFirst({
        where: { item_name: itemName }
      });

      if (existing) {
        if (existing.unit_cost !== unitCost) {
          await prisma.$transaction([
            prisma.masterprice.update({
              where: { id: existing.id },
              data: { unit_cost: unitCost, category }
            }),
            prisma.masterpricelog.create({
              data: {
                masterPriceId: existing.id,
                changed_by: userId,
                old_cost: existing.unit_cost,
                new_cost: unitCost
              }
            })
          ]);
          updatedCount++;
        }
      } else {
        const created = await prisma.masterprice.create({
          data: {
            category,
            item_name: itemName,
            unit_cost: unitCost
          }
        });
        await prisma.masterpricelog.create({
          data: {
            masterPriceId: created.id,
            changed_by: userId,
            old_cost: 0,
            new_cost: unitCost
          }
        });
        createdCount++;
      }
    }

    res.json({ message: 'Import successful', updatedCount, createdCount });
  } catch (error) {
    console.error('Failed to import prices:', error);
    res.status(500).json({ error: 'Failed to import prices' });
  }
};

export const getPriceLogs = async (req: Request, res: Response) => {
  const priceId = req.query.priceId ? parseInt(req.query.priceId as string) : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

  try {
    const where: any = {};
    if (priceId) {
      where.masterPriceId = priceId;
    }

    const logs = await prisma.masterpricelog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true } },
        masterprice: { select: { id: true, item_name: true, category: true } }
      }
    });

    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch price logs:', error);
    res.status(500).json({ error: 'Failed to fetch price logs' });
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

export const deletePrice = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const priceId = parseInt(id as string);
    await prisma.masterprice.delete({ where: { id: priceId } });
    res.json({ message: 'Price deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete price' });
  }
};

