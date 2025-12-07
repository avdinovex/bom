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
import sponsorRoutes from './sponsors.js';
import sponsorCategoryRoutes from './sponsorCategories.js';
import couponRoutes from './coupons.js';
import testimonialRoutes from './testimonials.js';
import audienceRegistrationRoutes from './audienceRegistrations.js';

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
router.use('/sponsors', sponsorRoutes);
router.use('/sponsor-categories', sponsorCategoryRoutes);
router.use('/coupons', couponRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/audience-registrations', audienceRegistrationRoutes);

export default router;