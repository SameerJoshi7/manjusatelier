<div align="center">
  <h1>✨ Manju's Atelier ✨</h1>
  <p><i>Handcrafted with Love, Made to Last.</i></p>
  
  [![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
</div>

A production-quality, full-stack e-commerce application for a premium handmade crafts brand.
Elegant, warm, and fast — built with a mobile-first, accessibility-conscious approach.

## Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS (custom warm theme)
- Framer Motion (subtle, tasteful animations)
- Lucide icons
- React Router (code-split routes, lazy loading)

**Backend**
- Node.js + Express (ESM)
- MongoDB + Mongoose
- JWT auth (httpOnly cookies) with bcrypt password hashing
- **Razorpay** payment gateway (server-side order creation, signature verification, webhooks)
- Security: helmet, CORS, rate limiting, mongo-sanitize, hpp, input validation

## Project Structure

```
manjus-atelier/
├── client/            # React + Vite frontend
│   └── src/
│       ├── components/  # ui/, layout/, home/, product/
│       ├── context/     # Auth, Cart, Wishlist, Theme, Toast
│       ├── hooks/        # useProducts, useCategories, usePageMeta
│       ├── lib/          # api client, utils, icons
│       ├── pages/        # Home, Shop, ProductDetails, Cart, Checkout, ...
│       └── types/
├── server/            # Express API
│   └── src/
│       ├── config/       # db connection
│       ├── controllers/  # auth, product, category, order, review, coupon
│       ├── middleware/   # auth, error handling, validation
│       ├── models/       # User, Product, Category, Order, Review, Coupon
│       ├── routes/       # + webhookRoutes (raw body for Razorpay)
│       └── utils/        # token, razorpay, seed
├── docker-compose.yml  # optional local MongoDB
└── package.json        # root convenience scripts
```

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on 22)
- A MongoDB database. Choose one:
  - **MongoDB Atlas** (recommended, free, zero-install): create a free cluster at
    <https://www.mongodb.com/atlas> and copy the connection string.
  - **Docker**: `docker compose up -d` (starts MongoDB on `localhost:27017`).
  - **Local install**: install MongoDB Community Server.

### 2. Install dependencies
```bash
npm run install:all
# or, from each folder:  cd server && npm install   /   cd client && npm install
```

### 3. Configure the backend
```bash
cd server
cp .env.example .env        # then edit .env
```
Set at minimum:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET`, `COOKIE_SECRET` — long random strings
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — from the
  [Razorpay dashboard](https://dashboard.razorpay.com/app/keys) (test mode is fine)

### 4. Seed the database
```bash
npm run seed        # from the root, or `npm run seed` inside /server
```
This creates 7 categories, 12 handmade products, 3 coupons, and demo accounts:
- Admin: `admin@manjusatelier.com` / `Admin@12345`

### 5. Run in development
```bash
# Option A — one command (installs `concurrently` at root):
npm install
npm run dev

# Option B — two terminals:
npm run dev:server     # http://localhost:5000
npm run dev:client     # http://localhost:5173
```
The Vite dev server proxies `/api` to the backend automatically.

## Payments (Razorpay)

Checkout uses Razorpay in **test mode** by default. Use Razorpay's
[test cards](https://razorpay.com/docs/payments/payments/test-card-details/) (e.g. card
`4111 1111 1111 1111`, any future expiry, any CVV) to simulate a successful payment.

Security highlights:
- **Prices are always recomputed on the server** from the database — the client price is never
  trusted.
- Payment **signatures are verified** (`HMAC-SHA256`) before an order is marked paid.
- Stock is decremented only after successful verification.
- A **webhook** endpoint (`/api/webhooks/razorpay`) provides a reliable fallback using the raw
  request body and webhook-secret verification. Configure it in the Razorpay dashboard for
  production.

## Key Features

- Home, Shop (filters/sort/search/pagination, grid & list views), Product Details (gallery + zoom,
  tabs, reviews), Categories, About (timeline), Contact (form + map + FAQ), Cart (coupons, shipping
  estimate), multi-step Checkout, order success, Wishlist, Auth, and Account/Orders.
- Dark mode, sticky transparent-on-top navbar with mega menu, back-to-top, toasts.
- Skeleton loaders, empty & error states, keyboard-friendly and ARIA-labelled controls.
- SEO: per-page titles/descriptions, Open Graph & Twitter tags, JSON-LD, semantic HTML.
- Performance: route-level code splitting, lazy image loading, manual vendor chunks.

## Building for Production

```bash
npm run build            # builds the client to client/dist
npm start                # runs the API (serve client/dist via your host/CDN)
```

## Extending (admin-ready)

The API already exposes admin-guarded CRUD for products, categories, and coupons
(`role: 'admin'`). Data models cover Products, Categories, Orders, Users, Reviews, Coupons, and
Wishlist — ready to power an admin dashboard.

## Notes on Images

Product/lifestyle imagery uses seeded placeholder photos so the app works out of the box. Replace
the image URLs in `server/src/utils/seed.js` (and category images) with your own asset URLs or a
CDN when going live.
