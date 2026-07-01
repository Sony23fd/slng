import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../db';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const login = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: { name } });

    if (!user) {
      return res.status(401).json({ error: 'Нэр эсвэл нууц үг буруу байна' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Нэр эсвэл нууц үг буруу байна' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, stamp_url: user.stamp_url, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, role: user.role, stamp_url: user.stamp_url, phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { stamp_url, phone } = req.body;
    const updateData: any = {};
    if (stamp_url !== undefined) updateData.stamp_url = stamp_url;
    if (phone !== undefined) updateData.phone = phone;

    const user = await prisma.user.update({
      where: { id: (req as any).user.id },
      data: updateData
    });
    res.json({ id: user.id, name: user.name, role: user.role, stamp_url: user.stamp_url, phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
