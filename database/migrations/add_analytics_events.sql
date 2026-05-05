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
  CONSTRAINT fk_analytics_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
