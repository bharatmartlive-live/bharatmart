import { Router } from 'express';
import {
  createOrder,
  createRazorpayOrder,
  listCustomerOrders,
  listOrders,
  verifyRazorpayPayment
} from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-razorpay-payment', verifyRazorpayPayment);
router.post('/', createOrder);
router.get('/', requireAdmin, listOrders);
router.get('/customer/:email', listCustomerOrders);

export default router;
