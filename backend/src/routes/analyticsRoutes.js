import { Router } from 'express';
import { createAnalyticsEvent } from '../controllers/analyticsController.js';

const router = Router();

router.post('/events', createAnalyticsEvent);

export default router;
