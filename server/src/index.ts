import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { errorLogger } from './middleware/errorLogger.js';

const app = express();

// ==========================================
// SECURITY & REQUEST MIDDLEWARE
// ==========================================

app.use(helmet({ crossOriginResourcePolicy: false }));

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BizFlow API',
    database: process.env.MONGODB_URI ? 'configured' : 'missing',
    time: new Date().toISOString()
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// ==========================================
// CENTRAL ERROR LOGGER
// IMPORTANT: Keep this AFTER all routes.
// ==========================================

app.use(errorLogger);

// ==========================================
// START SERVER
// ==========================================

const port = Number(process.env.PORT) || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`BizFlow API running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error(
      'Database connection failed:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  });
