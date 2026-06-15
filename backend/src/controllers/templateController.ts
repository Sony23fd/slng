import { Request, Response } from 'express';
import prisma from '../db';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.producttemplate.findMany({
      orderBy: { template_name: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const template = await prisma.producttemplate.create({
      data: req.body
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const template = await prisma.producttemplate.update({
      where: { id: parseInt(req.params.id as string, 10) },
      data: req.body
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    await prisma.producttemplate.delete({
      where: { id: parseInt(req.params.id as string, 10) }
    });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
