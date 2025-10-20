import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';

// Import admin route modules
import userRoutes from './users.js';
import eventRoutes from './events.js';
import rideRoutes from './rides.js';
import blogRoutes from './blogs.js';
import teamRoutes from './team.js';
import completedRideRoutes from './completedRides.js';
import bookingRoutes from './bookings.js';
import eventBookingRoutes from './eventBookings.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

// Apply authentication and admin authorization to all admin routes
router.use(authenticate, authorize('admin'));

// Mount admin routes
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/rides', rideRoutes);
router.use('/blogs', blogRoutes);
router.use('/team', teamRoutes);
router.use('/completed-rides', completedRideRoutes);
router.use('/bookings', bookingRoutes);
router.use('/event-bookings', eventBookingRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;