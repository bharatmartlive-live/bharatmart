import slugify from 'slugify';
import { pool } from '../config/db.js';

const PRODUCT_CACHE_TTL = 1000 * 60 * 5;
const productCache = {
  rows: null,
  expiresAt: 0
};

const safeJsonParse = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

export function clearProductCache() {
  productCache.rows = null;
  productCache.expiresAt = 0;
}

export async function warmProductCache() {
  try {
    await getAllProducts({ forceRefresh: true });
    console.log('Product cache warmed.');
  } catch (error) {
    console.error('Product cache warm-up failed:', error.message);
  }
}

export async function getAllProducts(options = {}) {
  const now = Date.now();

  if (!options.forceRefresh && productCache.rows && productCache.expiresAt > now) {
    return productCache.rows;
  }

  const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  productCache.rows = rows;
  productCache.expiresAt = now + PRODUCT_CACHE_TTL;
  return rows;
}

export async function getProductById(id) {
  const cachedProducts = await getAllProducts();
  const cachedProduct = cachedProducts.find((product) => String(product.id) === String(id));
  if (cachedProduct) return cachedProduct;

  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

export async function createProduct(payload) {
  const {
    title,
    description,
    price,
    discount = 0,
    stock = 0,
    category = 'Trending Summer Products',
    imageUrls = [],
    videoUrl = '',
    specifications = [],
    featured = true
  } = payload;

  const slug = slugify(title, { lower: true, strict: true });

  const [result] = await pool.query(
    `INSERT INTO products
      (title, slug, description, price, discount, stock, category, image_urls, video_url, specifications, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      slug,
      description,
      price,
      discount,
      stock,
      category,
      JSON.stringify(imageUrls),
      videoUrl,
      JSON.stringify(specifications),
      featured
    ]
  );

  clearProductCache();
  return getProductById(result.insertId);
}

export async function updateProduct(id, payload) {
  const current = await getProductById(id);
  if (!current) return null;

  const next = {
    title: payload.title ?? current.title,
    description: payload.description ?? current.description,
    price: payload.price ?? current.price,
    discount: payload.discount ?? current.discount,
    stock: payload.stock ?? current.stock,
    category: payload.category ?? current.category,
    imageUrls: payload.imageUrls ?? safeJsonParse(current.image_urls),
    videoUrl: payload.videoUrl ?? current.video_url,
    specifications: payload.specifications ?? safeJsonParse(current.specifications),
    featured: payload.featured ?? current.featured
  };

  const slug = slugify(next.title, { lower: true, strict: true });

  await pool.query(
    `UPDATE products
     SET title = ?, slug = ?, description = ?, price = ?, discount = ?, stock = ?, category = ?, image_urls = ?, video_url = ?, specifications = ?, featured = ?
     WHERE id = ?`,
    [
      next.title,
      slug,
      next.description,
      next.price,
      next.discount,
      next.stock,
      next.category,
      JSON.stringify(next.imageUrls),
      next.videoUrl,
      JSON.stringify(next.specifications),
      next.featured,
      id
    ]
  );

  clearProductCache();
  return getProductById(id);
}

export async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  clearProductCache();
}
