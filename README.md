<div align="center">
  <h1>✨ Manju's Atelier ✨</h1>
  <p><i>Handcrafted with Love, Made to Last.</i></p>
  
  <p>
    <b>Live at:</b> <a href="https://www.manjusatelier.in">www.manjusatelier.in</a>
  </p>
  
  [![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
</div>

<br />

Welcome to **Manju's Atelier**, a production-grade, full-stack e-commerce application dedicated to premium handmade crafts. Designed with a warm, elegant aesthetic, it prioritizes a seamless user experience across all devices.

---

## 🚀 Live Production Status

This application is currently live in production at **[www.manjusatelier.in](https://www.manjusatelier.in)**. 

### ✅ What's Implemented (Done)
- **Stunning Frontend:** Responsive, mobile-first UI built with React, Vite, and Tailwind CSS. Features subtle Framer Motion animations for a premium feel.
- **Robust Backend:** Node.js & Express API, securely connected to MongoDB.
- **User Authentication:** Secure JWT-based authentication (httpOnly cookies) and password hashing via bcrypt.
- **Shopping Experience:** Full product catalog with categories, filtering, sorting, and search functionalities.
- **Cart & Wishlist:** Fully functional shopping cart and wishlist state management.
- **Real-time Interaction:** Integrated Chatbot and contact functionalities.
- **Security:** Hardened with helmet, CORS, rate limiting, and mongo-sanitize.

### 🚧 What's Next (Yet to be Done)
- **Payment Gateway (Razorpay):** Integration with Razorpay for real-time checkout and payment processing is currently in development and is the next major milestone.
- **Admin Dashboard UI:** The backend API is fully prepared with admin-guarded routes (`role: 'admin'`) for CRUD operations on products, categories, and coupons. The frontend admin UI is pending implementation.
- **Order Management:** Full lifecycle tracking (from payment to shipping) will be finalized alongside the payment integration.

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS (custom warm theme)
- Framer Motion (subtle, tasteful animations)
- Lucide icons
- React Router (code-split routes, lazy loading)

**Backend**
- Node.js + Express (ESM)
- MongoDB + Mongoose
- JWT Auth (httpOnly cookies)
- Socket.io (Real-time features)

---

## 📂 Project Structure

```text
manjus-atelier/
├── client/            # React + Vite frontend
│   └── src/
│       ├── components/  # UI components, layout, pages
│       ├── context/     # Auth, Cart, Wishlist, Theme
│       ├── pages/       # Home, Shop, ProductDetails, Cart...
│       └── types/       # TypeScript definitions
├── server/            # Express API
│   └── src/
│       ├── config/      # Database connections
│       ├── controllers/ # Business logic (auth, products)
│       ├── models/      # Mongoose Schemas
│       └── routes/      # API Endpoints
└── package.json       # Root convenience scripts
```

---

## 💻 Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ 
- MongoDB (Atlas recommended, or local/Docker instance)

### 2. Install dependencies
```bash
# Install concurrently at root to run both client/server easily
npm install

# Install client & server dependencies
cd client && npm install
cd ../server && npm install
```

### 3. Environment Setup
```bash
cd server
cp .env.example .env 
```
Configure your `.env` with your `MONGODB_URI`, `JWT_SECRET`, and `COOKIE_SECRET`.

### 4. Seed Database (Optional)
```bash
cd server
npm run seed
```
This populates the database with sample categories, products, and an admin user.

### 5. Run the Application
From the root directory, run both servers simultaneously:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## ⚖️ License & Copyright

**© 2026 Manju's Atelier. All Rights Reserved.**

This repository and its contents are **proprietary and confidential**. 
This code is provided for portfolio and demonstration purposes only. You are **not** permitted to copy, modify, distribute, or use this source code, in whole or in part, for any personal or commercial projects. 

<div align="center">
  <p>Built with ❤️ for Manju's Atelier.</p>
</div>

