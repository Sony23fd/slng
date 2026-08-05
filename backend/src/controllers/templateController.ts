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

export const createTemplateFromOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId as string, 10);
    const { template_name } = req.body;

    if (!template_name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        materials: true,
        operations: true,
        specifications: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Construct the template JSON payload from order
    const templateData = {
      template_name,
      category: order.category,
      binding_type: order.binding_type,
      size: order.size,
      total_pages: order.specifications?.total_pages || null,
      cover_color: order.specifications?.cover_color || null,
      inner_color: order.specifications?.inner_color || null,
      needs_design: order.needs_design,
      design_status: order.design_status,
      design_cost: order.design_cost,
      notes: order.notes,
      order_data: {
        materials: order.materials.map(m => ({
          material_name: m.material_name,
          size: m.size,
          print_size: m.print_size,
          press_sheet: m.press_sheet,
          base_qty: m.base_qty,
          extra_qty: m.extra_qty,
          is_cover: m.is_cover,
          total_qty: m.total_qty,
          divide_by: m.divide_by,
          unit_cost: m.unit_cost,
          total_cost: m.total_cost,
          notes: m.notes,
          sheet_qty: m.sheet_qty
        })),
        operations: order.operations.map(o => ({
          operation_name: o.operation_name,
          qty: o.qty,
          unit_cost: o.unit_cost,
          total_cost: o.total_cost,
          notes: o.notes
        })),
        specifications: order.specifications ? {
          cover_color: order.specifications.cover_color,
          inner_color: order.specifications.inner_color,
          has_bookmark: order.specifications.has_bookmark,
          total_pages: order.specifications.total_pages,
          print_cost: order.specifications.print_cost
        } : null,
        sub_size: order.sub_size
      }
    };

    const template = await prisma.producttemplate.create({
      data: templateData
    });
    
    res.json(template);
  } catch (error) {
    console.error('Error creating template from order:', error);
    res.status(500).json({ error: 'Failed to create template from order' });
  }
};

