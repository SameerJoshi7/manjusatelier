import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import placeholderRoutes from './routes/placeholderRoutes.js';
import adminRoutes, { uploadDir } from './routes/adminRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // --- Security & core middleware ---
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(compression());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Webhooks need the raw body → mount BEFORE json parser.
  app.use('/api/webhooks', webhookRoutes);

  // Placeholder images — mounted before the rate limiter so image-heavy pages
  // aren't throttled.
  app.use('/api/placeholder', placeholderRoutes);

  // Uploaded product images (served statically).
  app.use('/api/uploads', express.static(uploadDir));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use(hpp());

  // Rate limit the API
  app.set('trust proxy', 1); // Trust first proxy (Render/Heroku/Nginx)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased limit to prevent strict throttling
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Stricter limit for auth endpoints
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // --- Routes ---
  app.get('/ping', (req, res) => res.json({}));
  app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/notifications', notificationRoutes);

  // --- Errors ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
