import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const categories = await prisma.product_category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, calc_mode, has_cover, has_inner, has_binding, has_pages, has_bookmark, waste_qty } = req.body;
    // @ts-ignore
    const category = await prisma.product_category.create({
      data: {
        name,
        calc_mode,
        has_cover: Boolean(has_cover),
        has_inner: Boolean(has_inner),
        has_binding: Boolean(has_binding),
        has_pages: Boolean(has_pages),
        has_bookmark: Boolean(has_bookmark),
        waste_qty: Number(waste_qty)
      }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, calc_mode, has_cover, has_inner, has_binding, has_pages, has_bookmark, waste_qty } = req.body;
    // @ts-ignore
    const category = await prisma.product_category.update({
      where: { id: Number(id) },
      data: {
        name,
        calc_mode,
        has_cover: Boolean(has_cover),
        has_inner: Boolean(has_inner),
        has_binding: Boolean(has_binding),
        has_pages: Boolean(has_pages),
        has_bookmark: Boolean(has_bookmark),
        waste_qty: Number(waste_qty)
      }
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    await prisma.product_category.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
