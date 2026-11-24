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

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, full_name, password, role, phone, stamp_url } = req.body;
  try {
    const userId = parseInt(id as string);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Буруу хэрэглэгчийн дугаар' });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    }

    // Check if name is taken by another user
    if (name && name !== existing.name) {
      const duplicate = await prisma.user.findFirst({
        where: { name, NOT: { id: userId } }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Хэрэглэгчийн нэр давхцаж байна' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone || null;
    if (stamp_url !== undefined) updateData.stamp_url = stamp_url || null;

    // Only update password if provided and not empty
    if (password && typeof password === 'string' && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, full_name: true, role: true, phone: true, stamp_url: true, createdAt: true, updatedAt: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
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
