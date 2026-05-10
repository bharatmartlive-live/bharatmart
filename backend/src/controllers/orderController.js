import crypto from 'crypto';
import { env } from '../config/env.js';
import { storeCampaign } from '../config/storeCampaign.js';
import { pool } from '../config/db.js';
import { ensureOrderSchema } from '../services/orderSchemaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const orderSelect = `
  SELECT
    o.*,
    COALESCE(
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'title', p.title,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ),
      JSON_ARRAY()
    ) AS items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
`;

const ONLINE_PAYMENT_METHOD = 'ONLINE';
const COD_PAYMENT_METHOD = 'COD';

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));
const toPaise = (value) => Math.round(roundMoney(value) * 100);

const normalizeCartItems = (items = []) =>
  items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    price: Number(item.price || 0)
  }));

const buildLegacyAddress = ({
  billingAddress,
  shippingAddress,
  paymentMethod,
  couponCode,
  couponDiscount,
  onlineDiscount,
  note,
  monthlyOffers
}) =>
  [
    `Billing: ${billingAddress}`,
    `Shipping: ${shippingAddress}`,
    `Payment: ${paymentMethod}`,
    `Coupon: ${couponCode ? `${couponCode} (saved Rs ${Math.round(couponDiscount)})` : 'No coupon'}`,
    `Online payment extra savings: Rs ${Math.round(onlineDiscount || 0)}`,
    `Note: ${note || 'No note'}`,
    `Monthly offers: ${monthlyOffers ? 'Yes' : 'No'}`
  ].join('\n');

async function resolveCoupon(couponCode) {
  const normalizedCode = String(couponCode || '')
    .trim()
    .toUpperCase();

  if (!normalizedCode) return null;

  const [rows] = await pool.query(
    'SELECT id, code, discount, active FROM coupons WHERE UPPER(code) = ? AND active = true LIMIT 1',
    [normalizedCode]
  );

  if (rows[0]) {
    return rows[0];
  }

  if (normalizedCode === storeCampaign.couponCode) {
    return {
      id: 'default-summer10',
      code: storeCampaign.couponCode,
      discount: storeCampaign.couponDiscount,
      active: true
    };
  }

  return null;
}

async function getResolvedUserId(userId, email) {
  if (userId) return Number(userId);

  const [users] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  return users[0]?.id || null;
}

async function calculateOrderSnapshot({ items, couponCode = '', paymentMethod = COD_PAYMENT_METHOD }) {
  const normalizedItems = normalizeCartItems(items);

  if (!normalizedItems.length) {
    throw new Error('Please add at least one product before placing an order.');
  }

  if (
    normalizedItems.some(
      (item) => !item.productId || !item.quantity || item.quantity < 1 || Number.isNaN(item.price)
    )
  ) {
    throw new Error('Invalid cart item details. Please refresh cart and try again.');
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const placeholders = productIds.map(() => '?').join(', ');
  const [products] = await pool.query(
    `SELECT id, title, price, discount, stock FROM products WHERE id IN (${placeholders})`,
    productIds
  );

  const productMap = new Map(products.map((product) => [Number(product.id), product]));
  const missingItem = normalizedItems.find((item) => !productMap.has(item.productId));

  if (missingItem) {
    throw new Error('One or more products are no longer available. Please refresh your cart and try again.');
  }

  const pricedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = Number(product.price || 0);
    const salePrice = roundMoney(unitPrice - (unitPrice * Number(product.discount || 0)) / 100);

    return {
      productId: item.productId,
      quantity: item.quantity,
      title: product.title,
      unitPrice,
      salePrice,
      lineMrpTotal: roundMoney(unitPrice * item.quantity),
      lineSaleTotal: roundMoney(salePrice * item.quantity)
    };
  });

  const originalTotal = roundMoney(
    pricedItems.reduce((sum, item) => sum + item.lineMrpTotal, 0)
  );
  const subtotalPrice = roundMoney(
    pricedItems.reduce((sum, item) => sum + item.lineSaleTotal, 0)
  );

  const resolvedCoupon = await resolveCoupon(couponCode);
  const couponDiscount = resolvedCoupon
    ? roundMoney((subtotalPrice * Number(resolvedCoupon.discount || 0)) / 100)
    : 0;
  const afterCouponTotal = roundMoney(Math.max(0, subtotalPrice - couponDiscount));
  const onlineDiscountRate =
    paymentMethod === ONLINE_PAYMENT_METHOD ? storeCampaign.onlinePaymentExtraDiscount : 0;
  const onlineDiscount = roundMoney((afterCouponTotal * onlineDiscountRate) / 100);
  const totalPrice = roundMoney(Math.max(0, afterCouponTotal - onlineDiscount));

  return {
    items: pricedItems,
    coupon: resolvedCoupon,
    originalTotal,
    subtotalPrice,
    couponDiscount,
    onlineDiscount,
    onlineDiscountRate,
    totalPrice
  };
}

function getRazorpayAuthorizationHeader() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    const error = new Error(
      'Razorpay is not configured yet. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your backend environment.'
    );
    error.statusCode = 503;
    throw error;
  }

  return `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString('base64')}`;
}

async function razorpayRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: getRazorpayAuthorizationHeader(),
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error?.description ||
      data?.error?.reason ||
      data?.message ||
      'Razorpay request failed. Please try again.';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function createStoredOrder({
  userId,
  customerName,
  email,
  phone,
  billingAddress,
  shippingAddress,
  note,
  monthlyOffers,
  paymentMethod,
  paymentStatus,
  paymentProvider = null,
  razorpayOrderId = null,
  razorpayPaymentId = null,
  pricing
}) {
  const legacyAddress = buildLegacyAddress({
    billingAddress,
    shippingAddress,
    paymentMethod,
    couponCode: pricing.coupon?.code || '',
    couponDiscount: pricing.couponDiscount,
    onlineDiscount: pricing.onlineDiscount,
    note,
    monthlyOffers
  });

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      `
        INSERT INTO orders (
          user_id,
          customer_name,
          email,
          phone,
          address,
          billing_address,
          shipping_address,
          note,
          monthly_offers,
          original_total,
          subtotal_price,
          coupon_code,
          coupon_discount,
          online_discount,
          total_price,
          payment_method,
          payment_status,
          payment_provider,
          razorpay_order_id,
          razorpay_payment_id,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        userId,
        customerName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        legacyAddress,
        billingAddress,
        shippingAddress,
        note || null,
        Boolean(monthlyOffers),
        pricing.originalTotal,
        pricing.subtotalPrice,
        pricing.coupon?.code || null,
        pricing.couponDiscount,
        pricing.onlineDiscount,
        pricing.totalPrice,
        paymentMethod,
        paymentStatus,
        paymentProvider,
        razorpayOrderId,
        razorpayPaymentId
      ]
    );

    for (const item of pricing.items) {
      await connection.query(
        `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `,
        [orderResult.insertId, item.productId, item.quantity, item.salePrice]
      );
    }

    await connection.commit();
    return orderResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function validateCheckoutFields({ customerName, email, phone, billingAddress, shippingAddress }) {
  if (!customerName || !email || !phone || !billingAddress || !shippingAddress) {
    const error = new Error(
      'Customer name, email, phone, billing address, and shipping address are required.'
    );
    error.statusCode = 400;
    throw error;
  }
}

function getCheckoutFields(body) {
  const billingAddress = body.billingAddress || body.address || '';
  const shippingAddress = body.shippingAddress || billingAddress || '';

  return {
    customerName: String(body.customerName || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    phone: String(body.phone || '').trim(),
    billingAddress: String(billingAddress || '').trim(),
    shippingAddress: String(shippingAddress || '').trim(),
    note: String(body.note || '').trim(),
    monthlyOffers: Boolean(body.monthlyOffers),
    couponCode: String(body.couponCode || '').trim().toUpperCase(),
    paymentMethod: body.paymentMethod === ONLINE_PAYMENT_METHOD ? ONLINE_PAYMENT_METHOD : COD_PAYMENT_METHOD,
    userId: body.userId ? Number(body.userId) : null,
    items: Array.isArray(body.items) ? body.items : []
  };
}

export const createOrder = asyncHandler(async (req, res) => {
  await ensureOrderSchema();
  const checkout = getCheckoutFields(req.body);
  validateCheckoutFields(checkout);

  const pricing = await calculateOrderSnapshot({
    items: checkout.items,
    couponCode: checkout.couponCode,
    paymentMethod: COD_PAYMENT_METHOD
  });
  const resolvedUserId = await getResolvedUserId(checkout.userId, checkout.email);
  const orderId = await createStoredOrder({
    userId: resolvedUserId,
    customerName: checkout.customerName,
    email: checkout.email,
    phone: checkout.phone,
    billingAddress: checkout.billingAddress,
    shippingAddress: checkout.shippingAddress,
    note: checkout.note,
    monthlyOffers: checkout.monthlyOffers,
    paymentMethod: COD_PAYMENT_METHOD,
    paymentStatus: 'Pending',
    pricing
  });

  res.status(201).json({
    message: 'Order created successfully.',
    orderId,
    paymentMethod: COD_PAYMENT_METHOD,
    totals: {
      originalTotal: pricing.originalTotal,
      subtotalPrice: pricing.subtotalPrice,
      couponDiscount: pricing.couponDiscount,
      onlineDiscount: pricing.onlineDiscount,
      totalPrice: pricing.totalPrice
    }
  });
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  await ensureOrderSchema();
  const checkout = getCheckoutFields(req.body);
  validateCheckoutFields(checkout);

  const pricing = await calculateOrderSnapshot({
    items: checkout.items,
    couponCode: checkout.couponCode,
    paymentMethod: ONLINE_PAYMENT_METHOD
  });

  if (pricing.totalPrice <= 0) {
    return res.status(400).json({ message: 'Order amount is invalid. Please refresh your cart and try again.' });
  }

  const razorpayOrder = await razorpayRequest('/orders', {
    method: 'POST',
    body: {
      amount: toPaise(pricing.totalPrice),
      currency: 'INR',
      receipt: `bm_${Date.now()}`,
      notes: {
        customer_name: checkout.customerName,
        email: checkout.email,
        phone: checkout.phone
      }
    }
  });

  res.status(201).json({
    data: {
      keyId: env.razorpayKeyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      summary: {
        originalTotal: pricing.originalTotal,
        subtotalPrice: pricing.subtotalPrice,
        couponCode: pricing.coupon?.code || '',
        couponDiscount: pricing.couponDiscount,
        onlineDiscountRate: pricing.onlineDiscountRate,
        onlineDiscount: pricing.onlineDiscount,
        totalPrice: pricing.totalPrice
      }
    }
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  await ensureOrderSchema();
  const checkout = getCheckoutFields(req.body);
  validateCheckoutFields(checkout);

  const razorpayOrderId = String(req.body.razorpayOrderId || '').trim();
  const razorpayPaymentId = String(req.body.razorpayPaymentId || '').trim();
  const razorpaySignature = String(req.body.razorpaySignature || '').trim();

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Razorpay payment verification details are missing.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
  }

  const pricing = await calculateOrderSnapshot({
    items: checkout.items,
    couponCode: checkout.couponCode,
    paymentMethod: ONLINE_PAYMENT_METHOD
  });
  const payment = await razorpayRequest(`/payments/${razorpayPaymentId}`);

  if (payment.order_id !== razorpayOrderId) {
    return res.status(400).json({ message: 'Payment verification failed. Order reference mismatch.' });
  }

  if (!['authorized', 'captured'].includes(String(payment.status || '').toLowerCase())) {
    return res.status(400).json({ message: 'Payment is not successful yet. Please complete the payment and try again.' });
  }

  if (Number(payment.amount || 0) !== toPaise(pricing.totalPrice)) {
    return res.status(400).json({ message: 'Payment amount mismatch detected. Please contact support.' });
  }

  const resolvedUserId = await getResolvedUserId(checkout.userId, checkout.email);
  const orderId = await createStoredOrder({
    userId: resolvedUserId,
    customerName: checkout.customerName,
    email: checkout.email,
    phone: checkout.phone,
    billingAddress: checkout.billingAddress,
    shippingAddress: checkout.shippingAddress,
    note: checkout.note,
    monthlyOffers: checkout.monthlyOffers,
    paymentMethod: ONLINE_PAYMENT_METHOD,
    paymentStatus: 'Paid',
    paymentProvider: 'Razorpay',
    razorpayOrderId,
    razorpayPaymentId,
    pricing
  });

  res.status(201).json({
    message: 'Payment verified and order created successfully.',
    orderId,
    paymentMethod: ONLINE_PAYMENT_METHOD,
    paymentStatus: 'Paid',
    totals: {
      originalTotal: pricing.originalTotal,
      subtotalPrice: pricing.subtotalPrice,
      couponDiscount: pricing.couponDiscount,
      onlineDiscount: pricing.onlineDiscount,
      totalPrice: pricing.totalPrice
    }
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json({ data: rows });
});

export const listCustomerOrders = asyncHandler(async (req, res) => {
  const email = String(req.params.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'Customer email is required.' });
  }

  const [rows] = await pool.query(
    `${orderSelect}
     WHERE o.email = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [email]
  );

  res.json({ data: rows });
});
