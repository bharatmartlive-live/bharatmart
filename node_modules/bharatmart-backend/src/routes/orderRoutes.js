import { Router } from 'express';
import { createOrder, listCustomerOrders, listOrders } from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', createOrder);
router.get('/', requireAdmin, listOrders);
router.get('/customer/:email', listCustomerOrders);

export default router;
