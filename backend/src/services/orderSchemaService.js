import { pool } from '../config/db.js';

let orderSchemaReadyPromise = null;

const orderColumnDefinitions = {
  billing_address: 'TEXT NULL',
  shipping_address: 'TEXT NULL',
  note: 'TEXT NULL',
  monthly_offers: 'BOOLEAN DEFAULT FALSE',
  original_total: 'DECIMAL(10, 2) NOT NULL DEFAULT 0',
  subtotal_price: 'DECIMAL(10, 2) NOT NULL DEFAULT 0',
  coupon_code: 'VARCHAR(80) NULL',
  coupon_discount: 'DECIMAL(10, 2) NOT NULL DEFAULT 0',
  online_discount: 'DECIMAL(10, 2) NOT NULL DEFAULT 0',
  payment_method: "VARCHAR(30) NOT NULL DEFAULT 'COD'",
  payment_status: "VARCHAR(30) NOT NULL DEFAULT 'Pending'",
  payment_provider: 'VARCHAR(40) NULL',
  razorpay_order_id: 'VARCHAR(120) NULL',
  razorpay_payment_id: 'VARCHAR(120) NULL'
};

export async function ensureOrderSchema() {
  if (!orderSchemaReadyPromise) {
    orderSchemaReadyPromise = (async () => {
      const [rows] = await pool.query(
        `
          SELECT COLUMN_NAME
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'orders'
        `
      );

      const existingColumns = new Set(rows.map((row) => row.COLUMN_NAME));
      const missingColumns = Object.entries(orderColumnDefinitions).filter(
        ([columnName]) => !existingColumns.has(columnName)
      );

      for (const [columnName, definition] of missingColumns) {
        await pool.query(`ALTER TABLE orders ADD COLUMN ${columnName} ${definition}`);
      }

      if (missingColumns.length) {
        console.log(
          `Orders schema updated with columns: ${missingColumns.map(([columnName]) => columnName).join(', ')}`
        );
      } else {
        console.log('Orders schema ready.');
      }
    })().catch((error) => {
      orderSchemaReadyPromise = null;
      console.error('Orders schema setup failed:', error.message);
      throw error;
    });
  }

  return orderSchemaReadyPromise;
}
