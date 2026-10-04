import { Router } from 'express';
import {
  getMonthlyReportData,
  downloadMonthlyReportPptx,
  getSalesTarget,
  upsertSalesTarget,
  getCustomerGifts,
  createCustomerGift,
  deleteCustomerGift,
  getSalespersonReportData,
  downloadSalespersonReportPptx
} from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Salesperson Personal Report Data & Meeting Presentation
router.get('/sales', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), getSalespersonReportData);
router.get('/sales/pptx', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), downloadSalespersonReportPptx);

// Monthly Report Data & Presentation
router.get('/monthly', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), getMonthlyReportData);
router.get('/monthly/pptx', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), downloadMonthlyReportPptx);

// Target Management
router.get('/targets', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), getSalesTarget);
router.post('/targets', authMiddleware(['ADMIN', 'FINANCE']), upsertSalesTarget);

// Customer Gifts Management
router.get('/gifts', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), getCustomerGifts);
router.post('/gifts', authMiddleware(['ADMIN', 'FINANCE', 'SALES']), createCustomerGift);
router.delete('/gifts/:id', authMiddleware(['ADMIN', 'FINANCE']), deleteCustomerGift);

export default router;
