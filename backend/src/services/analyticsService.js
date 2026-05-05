import { pool } from '../config/db.js';

const EVENT_TYPES = new Set(['page_view', 'product_view', 'add_to_cart']);
let analyticsTableReadyPromise = null;

export function isValidAnalyticsEventType(eventType) {
  return EVENT_TYPES.has(eventType);
}

export async function ensureAnalyticsTable() {
  if (!analyticsTableReadyPromise) {
    analyticsTableReadyPromise = pool
      .query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        session_id VARCHAR(120) NOT NULL,
        event_type ENUM('page_view', 'product_view', 'add_to_cart') NOT NULL,
        product_id INT NULL,
        path VARCHAR(255) DEFAULT '',
        referrer VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_analytics_event_type_created (event_type, created_at),
        INDEX idx_analytics_product_event (product_id, event_type),
        INDEX idx_analytics_session_created (session_id, created_at),
        CONSTRAINT fk_analytics_product
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `)
      .then(() => {
        console.log('Analytics table ready.');
      })
      .catch((error) => {
        analyticsTableReadyPromise = null;
        console.error('Analytics table setup failed:', error.message);
        throw error;
      });
  }

  return analyticsTableReadyPromise;
}

export async function recordAnalyticsEvent({
  sessionId,
  eventType,
  productId = null,
  path = '',
  referrer = ''
}) {
  await ensureAnalyticsTable();

  await pool.query(
    `INSERT INTO analytics_events (session_id, event_type, product_id, path, referrer)
     VALUES (?, ?, ?, ?, ?)`,
    [
      String(sessionId).slice(0, 120),
      eventType,
      productId ? Number(productId) : null,
      String(path || '').slice(0, 255),
      String(referrer || '').slice(0, 255)
    ]
  );
}

export async function getAnalyticsSummary() {
  await ensureAnalyticsTable();

  const [overviewRows] = await pool.query(`
    SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) AS uniqueVisitors,
      COALESCE(SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END), 0) AS pageViews,
      COALESCE(SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END), 0) AS productViews,
      COALESCE(SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END), 0) AS addToCartEvents,
      COUNT(DISTINCT CASE
        WHEN event_type = 'page_view' AND created_at >= NOW() - INTERVAL 7 DAY
        THEN session_id
      END) AS uniqueVisitors7d,
      COALESCE(SUM(CASE
        WHEN event_type = 'page_view' AND created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0
      END), 0) AS pageViews7d,
      COALESCE(SUM(CASE
        WHEN event_type = 'product_view' AND created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0
      END), 0) AS productViews7d,
      COALESCE(SUM(CASE
        WHEN event_type = 'add_to_cart' AND created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0
      END), 0) AS addToCartEvents7d
    FROM analytics_events
  `);

  const [productRows] = await pool.query(`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.category,
      COALESCE(SUM(CASE WHEN ae.event_type = 'product_view' THEN 1 ELSE 0 END), 0) AS views,
      COALESCE(SUM(CASE WHEN ae.event_type = 'add_to_cart' THEN 1 ELSE 0 END), 0) AS addToCart,
      COALESCE(SUM(CASE
        WHEN ae.event_type = 'product_view' AND ae.created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0
      END), 0) AS views7d,
      COALESCE(SUM(CASE
        WHEN ae.event_type = 'add_to_cart' AND ae.created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0
      END), 0) AS addToCart7d,
      COUNT(DISTINCT CASE WHEN ae.event_type = 'product_view' THEN ae.session_id END) AS interestedVisitors,
      MAX(ae.created_at) AS lastInteractionAt
    FROM products p
    LEFT JOIN analytics_events ae ON ae.product_id = p.id
    GROUP BY p.id, p.title, p.slug, p.category, p.created_at
    ORDER BY views DESC, addToCart DESC, p.created_at DESC
  `);

  const overview = overviewRows[0] || {};
  const productViews = Number(overview.productViews || 0);
  const addToCartEvents = Number(overview.addToCartEvents || 0);

  return {
    overview: {
      uniqueVisitors: Number(overview.uniqueVisitors || 0),
      pageViews: Number(overview.pageViews || 0),
      productViews,
      addToCartEvents,
      uniqueVisitors7d: Number(overview.uniqueVisitors7d || 0),
      pageViews7d: Number(overview.pageViews7d || 0),
      productViews7d: Number(overview.productViews7d || 0),
      addToCartEvents7d: Number(overview.addToCartEvents7d || 0),
      addToCartRate: productViews ? Number(((addToCartEvents / productViews) * 100).toFixed(1)) : 0
    },
    products: productRows.map((row) => {
      const views = Number(row.views || 0);
      const addToCart = Number(row.addToCart || 0);
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        views,
        addToCart,
        views7d: Number(row.views7d || 0),
        addToCart7d: Number(row.addToCart7d || 0),
        interestedVisitors: Number(row.interestedVisitors || 0),
        lastInteractionAt: row.lastInteractionAt,
        addToCartRate: views ? Number(((addToCart / views) * 100).toFixed(1)) : 0
      };
    })
  };
}
