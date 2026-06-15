import { Request, Response } from 'express';
import prisma from '../db';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, password, role } = req.body;
  try {
    const existing = await prisma.user.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Хэрэглэгчийн нэр давхцаж байна' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, password: hash, role }
    });
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // If the user is tied to logs or orders, deleting might fail due to foreign key constraints,
    // so we should ideally check or just let Prisma throw and catch it.
    await prisma.user.delete({ where: { id: parseInt(id as string) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user. User might be linked to existing orders.' });
  }
};
