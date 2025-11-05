import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// Import routes
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import rideRoutes from './routes/rides.js';
import bookingRoutes from './routes/bookings.js';
import eventBookingRoutes from './routes/eventBookings.js';
import blogRoutes from './routes/blogs.js';
import teamRoutes from './routes/team.js';
import completedRideRoutes from './routes/completedRides.js';
import sponsorRoutes from './routes/sponsors.js';
import sponsorCategoryRoutes from './routes/sponsorCategories.js';
import testimonialRoutes from './routes/testimonials.js';
import adminRoutes from './routes/admin/index.js';
import testRoutes from './routes/test.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));


const allowedOrigins = [
  'http://localhost:5173',
  'https://brotherhoodofmumbai.cloud',
  'https://www.brotherhoodofmumbai.cloud'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});



// Rate limiting for general API routes - Very lenient for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // Very high limit for development
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost'));
  }
});
app.use('/api/', limiter);

// Lenient rate limiting for auth routes in development
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // Much higher for development
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost'));
  }
});
app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Very lenient rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5000, // Very high limit for admin dashboard
  message: {
    status: 'error',
    message: 'Admin rate limit exceeded, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost'));
  }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/event-bookings', eventBookingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/completed-rides', completedRideRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/sponsor-categories', sponsorCategoryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/test', testRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;