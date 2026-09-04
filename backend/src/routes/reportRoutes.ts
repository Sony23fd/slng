import { Router } from 'express';
import {
  getMonthlyReportData,
  downloadMonthlyReportPptx,
  getSalesTarget,
  upsertSalesTarget,
  getCustomerGifts,
  createCustomerGift,
  deleteCustomerGift,
  getSalespersonReportData
} from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Salesperson Personal Report Data
router.get('/sales', authMiddleware(), getSalespersonReportData);

// Monthly Report Data & Presentation
router.get('/monthly', authMiddleware(), getMonthlyReportData);
router.get('/monthly/pptx', downloadMonthlyReportPptx); // Also allows direct browser download with token or query

// Target Management
router.get('/targets', authMiddleware(), getSalesTarget);
router.post('/targets', authMiddleware(['ADMIN', 'FINANCE', 'MANAGER']), upsertSalesTarget);

// Customer Gifts Management
router.get('/gifts', authMiddleware(), getCustomerGifts);
router.post('/gifts', authMiddleware(['ADMIN', 'FINANCE', 'SALES', 'MANAGER']), createCustomerGift);
router.delete('/gifts/:id', authMiddleware(['ADMIN', 'FINANCE', 'MANAGER']), deleteCustomerGift);

export default router;
