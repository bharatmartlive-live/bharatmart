import { asyncHandler } from '../utils/asyncHandler.js';
import {
  isValidAnalyticsEventType,
  recordAnalyticsEvent
} from '../services/analyticsService.js';

export const createAnalyticsEvent = asyncHandler(async (req, res) => {
  const { sessionId, eventType, productId = null, path = '', referrer = '' } = req.body;

  if (!sessionId || !eventType || !isValidAnalyticsEventType(eventType)) {
    return res.status(400).json({ message: 'Invalid analytics event payload.' });
  }

  await recordAnalyticsEvent({
    sessionId,
    eventType,
    productId,
    path,
    referrer
  });

  res.status(201).json({ message: 'Analytics event recorded.' });
});
