# BharatMart.live

Production-minded full-stack ecommerce starter for `bharatmart.live` with:

- React + Vite + Tailwind CSS frontend
- Node.js + Express REST API
- MySQL database
- JWT-based admin authentication
- Media upload support with `multer`
- Razorpay checkout support for online payments

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

Add these to `backend/.env` or your Render backend environment:

```text
PORT=5000
CLIENT_URL=https://bharatmart.live
JWT_SECRET=change_me_to_a_long_random_secret
MYSQL_HOST=...
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DB=...
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

For the publish frontend, add this to your Netlify or Render frontend environment:

```text
VITE_API_URL=https://your-backend.onrender.com/api
VITE_MEDIA_URL=https://your-backend.onrender.com
```

## Highlights

- Sticky, conversion-focused storefront with announcement bar and responsive sections
- Product detail page with gallery, video support, reviews, FAQ, and testimonial system
- Cart and checkout flow with coupon support, COD, and Razorpay online payment
- Admin dashboard for products, coupons, announcements, analytics, and order management
- Secure admin routes with JWT middleware
- REST API under `/api/products`, `/api/orders`, `/api/users`, `/api/admin`

## Notes

- Media uploads are stored in `backend/uploads` and exposed via `/uploads/...`.
- The logo asset is recreated as an SVG inspired by your provided branding so it can scale cleanly across the site.
- If you pasted a live Razorpay secret anywhere public, rotate that secret in the Razorpay dashboard before production use.
