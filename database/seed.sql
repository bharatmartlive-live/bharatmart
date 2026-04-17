INSERT INTO users (name, email, password, is_admin)
VALUES
  (
    'Admin User',
    'admin@bharatmart.live',
    '$2b$10$nCPCFm5VvApEAjYJIh5dZuUABU2K/le.alP210qUdcD/ejGp3rqO6',
    TRUE
  )
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO products (title, slug, description, price, discount, stock, category, image_urls, video_url, featured)
VALUES
  (
    'Portable Neck Cooling Fan',
    'portable-neck-cooling-fan',
    'Hands-free cooling with three-speed airflow, silent motor, and USB-C charging for all-day summer comfort.',
    1899,
    26,
    32,
    'Trending Summer Products',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=900&q=80'
    ),
    'https://www.w3schools.com/html/mov_bbb.mp4',
    TRUE
  ),
  (
    'Insulated Water Bottle 1L',
    'insulated-water-bottle-1l',
    'Double-wall stainless steel bottle that keeps drinks chilled for 24 hours during peak summer travel.',
    1199,
    18,
    64,
    'Hot Deals',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'
    ),
    '',
    TRUE
  ),
  (
    'Mini Air Cooler for Desk',
    'mini-air-cooler-for-desk',
    'Compact personal air cooler with humidifier mode, ambient glow, and efficient bedside cooling.',
    3499,
    31,
    21,
    'Recommended for You',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
    ),
    '',
    TRUE
  )
ON DUPLICATE KEY UPDATE slug = slug;

INSERT INTO coupons (code, discount, active)
VALUES
  ('HEATWAVE10', 10, TRUE),
  ('SUMMER20', 20, TRUE)
ON DUPLICATE KEY UPDATE code = code;

INSERT INTO announcements (text, active)
VALUES
  ('SUMMER FLASH: Up to 55% off cooling essentials', TRUE),
  ('Use code HEATWAVE10 for extra savings', TRUE),
  ('Free shipping on orders above Rs 999', TRUE)
ON DUPLICATE KEY UPDATE text = text;
