import { Router } from 'express';
import {
  createAdminProduct,
  createAnnouncement,
  createCoupon,
  dashboardData,
  storefrontData,
  updateAdminProduct,
  updateAnnouncement,
  updateCoupon,
  updateOrderStatus,
  uploadMedia
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/storefront', storefrontData);
router.get('/dashboard', requireAdmin, dashboardData);
router.post('/products', requireAdmin, createAdminProduct);
router.put('/products/:id', requireAdmin, updateAdminProduct);
router.post('/announcements', requireAdmin, createAnnouncement);
router.patch('/announcements/:id', requireAdmin, updateAnnouncement);
router.post('/coupons', requireAdmin, createCoupon);
router.patch('/coupons/:id', requireAdmin, updateCoupon);
router.patch('/orders/:id', requireAdmin, updateOrderStatus);
router.post('/upload', requireAdmin, upload.array('media', 8), uploadMedia);

export default router;
