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

export const deleteConstant = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.constant.delete({ where: { id: parseInt(id as string) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete constant' });
  }
};

export const updateConstant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, value, description } = req.body;
  try {
    const updated = await prisma.constant.update({
      where: { id: parseInt(id as string) },
      data: { type, value, description }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update constant' });
  }
};
