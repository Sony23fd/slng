import { Request, Response } from 'express';
import prisma from '../db';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const search = req.query.search as string;

    let where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { full_name: { contains: search } },
        { role: { contains: search } }
      ];
    }

    if (page && limit) {
      const total = await prisma.user.count({ where });
      const users = await prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, full_name: true, role: true, phone: true, createdAt: true },
        orderBy: { id: 'desc' }
      });
      res.json({
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, full_name: true, role: true, phone: true, createdAt: true },
        orderBy: { id: 'desc' }
      });
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, full_name, password, role, phone } = req.body;
  try {
    const existing = await prisma.user.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Хэрэглэгчийн нэр давхцаж байна' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, full_name, password: hash, role, phone: phone || null }
    });
    res.json({ id: user.id, name: user.name, full_name: user.full_name, role: user.role, phone: user.phone });
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
