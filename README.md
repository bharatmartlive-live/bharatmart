# BharatMart.live

Production-minded full-stack ecommerce starter for `bharatmart.live` with:

- React + Vite + Tailwind CSS frontend
- Node.js + Express REST API
- MySQL database
- JWT-based admin authentication
- Media upload support with `multer`

## Project Structure

```text
bharatmart.live/
  backend/         Express API, uploads, MySQL integration
  frontend/        React storefront + admin dashboard
  database/        Schema and sample seed data
```

## Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Create backend env file from `backend/.env.example`.

3. Create the database and import schema:

```bash
mysql -u YOUR_USER -p YOUR_DATABASE < database/schema.sql
mysql -u YOUR_USER -p YOUR_DATABASE < database/seed.sql
```

4. Start both apps:

```bash
npm.cmd run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## Seed Admin Login

- Email: `admin@bharatmart.live`
- Password: `Admin@123`

## Environment Variables

Use the MySQL credentials you shared inside `backend/.env`.

## Highlights

- Sticky, conversion-focused storefront with announcement bar and responsive sections
- Product detail page with gallery and video support
- Cart and checkout flow with persisted local cart state
- Admin dashboard for products, coupons, announcements, and orders
- Secure admin routes with JWT middleware
- REST API under `/api/products`, `/api/orders`, `/api/users`, `/api/admin`

## Notes

- Media uploads are stored in `backend/uploads` and exposed via `/uploads/...`.
- The logo asset is recreated as an SVG inspired by your provided branding so it can scale cleanly across the site.
