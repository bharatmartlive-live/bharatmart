import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackAnalyticsEvent } from '../../lib/analytics';

const shouldSkipTracking = (pathname = '') =>
  pathname.startsWith('/admin') || pathname === '/login';

export function RouteAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (shouldSkipTracking(location.pathname)) {
      return;
    }

    trackAnalyticsEvent({
      eventType: 'page_view',
      path: `${location.pathname}${location.search}`,
      dedupeKey: `page:${location.pathname}${location.search}`,
      dedupeWindowMs: 1500
    });
  }, [location.pathname, location.search]);

  return null;
}
