import cron from 'node-cron';
import UpcomingRide from '../models/UpcomingRide.js';
import CompletedRide from '../models/CompletedRide.js';
import Booking from '../models/Booking.js';
import logger from '../config/logger.js';

/**
 * Migrates rides from upcoming to completed when their end time has passed
 */
export const migrateExpiredRides = async () => {
  try {
    const now = new Date();
    
    // Find upcoming rides that have passed their end time (or start time if no end time)
    const expiredRides = await UpcomingRide.find({
      $or: [
        { endTime: { $lt: now } }, // Rides with end time that has passed
        { 
          endTime: { $exists: false }, 
          startTime: { $lt: now } 
        } // Rides without end time but start time has passed
      ],
      isActive: true // Only migrate active rides
    }).populate('organizer', 'fullName email');

    if (expiredRides.length === 0) {
      logger.info('No expired rides found for migration');
      return { migratedCount: 0, errors: [] };
    }

    logger.info(`Found ${expiredRides.length} expired rides to migrate`);

    const migratedRides = [];
    const errors = [];

    for (const ride of expiredRides) {
      try {
        // Get the count of successful bookings for this ride
        const successfulBookings = await Booking.countDocuments({
          ride: ride._id,
          status: 'paid'
        });

        // Calculate duration if possible
        let duration = '';
        if (ride.endTime && ride.startTime) {
          const durationMs = new Date(ride.endTime) - new Date(ride.startTime);
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          
          if (hours > 0) {
            duration = `${hours} hour${hours > 1 ? 's' : ''}`;
            if (minutes > 0) {
              duration += ` ${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
          } else if (minutes > 0) {
            duration = `${minutes} minute${minutes > 1 ? 's' : ''}`;
          }
        }

        // Create completed ride data
        const completedRideData = {
          title: ride.title,
          imgUrl: ride.imgUrl,
          date: ride.endTime || ride.startTime, // Use end time if available, otherwise start time
          details: ride.description,
          venue: ride.venue,
          distance: ride.distance,
          duration: duration || 'N/A',
          participants: successfulBookings,
          difficulty: ride.difficulty,
          organizer: ride.organizer?._id,
          route: ride.route,
          isPublished: true,
          isFeatured: ride.isFeatured || false,
          highlights: ride.requirements || [] // Use requirements as highlights for now
        };

        // Create the completed ride
        const completedRide = await CompletedRide.create(completedRideData);

        // Mark the upcoming ride as inactive instead of deleting
        // This preserves the data for historical purposes and booking references
        await UpcomingRide.findByIdAndUpdate(ride._id, {
          isActive: false,
          migratedAt: now,
          migratedToCompletedRide: completedRide._id
        });

        migratedRides.push({
          upcomingRideId: ride._id,
          completedRideId: completedRide._id,
          title: ride.title,
          participants: successfulBookings
        });

        logger.info(`Successfully migrated ride: ${ride.title} (ID: ${ride._id}) to completed rides`);

      } catch (rideError) {
        const errorMsg = `Failed to migrate ride ${ride.title} (ID: ${ride._id}): ${rideError.message}`;
        logger.error(errorMsg);
        errors.push({
          rideId: ride._id,
          title: ride.title,
          error: rideError.message
        });
      }
    }

    logger.info(`Migration completed. Migrated: ${migratedRides.length}, Errors: ${errors.length}`);

    return {
      migratedCount: migratedRides.length,
      migratedRides,
      errors
    };

  } catch (error) {
    logger.error('Error during ride migration:', error);
    throw error;
  }
};

/**
 * Manually trigger ride migration (for admin use)
 */
export const manualMigrateRides = async () => {
  logger.info('Manual ride migration triggered');
  return await migrateExpiredRides();
};

/**
 * Start the scheduled ride migration job
 * Runs every hour to check for expired rides
 */
export const startRideMigrationScheduler = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Starting scheduled ride migration check');
      await migrateExpiredRides();
    } catch (error) {
      logger.error('Scheduled ride migration failed:', error);
    }
  });

  // Also run every day at midnight for a more thorough check
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting daily ride migration check');
      await migrateExpiredRides();
    } catch (error) {
      logger.error('Daily ride migration failed:', error);
    }
  });

  logger.info('Ride migration scheduler started - running every hour and daily at midnight');
};

/**
 * Get migration status and statistics
 */
export const getMigrationStats = async () => {
  try {
    const now = new Date();
    
    // Count expired rides that haven't been migrated yet
    const pendingMigration = await UpcomingRide.countDocuments({
      $or: [
        { endTime: { $lt: now } },
        { 
          endTime: { $exists: false }, 
          startTime: { $lt: now } 
        }
      ],
      isActive: true
    });

    // Count recently migrated rides (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentlyMigrated = await UpcomingRide.countDocuments({
      isActive: false,
      migratedAt: { $gte: sevenDaysAgo }
    });

    // Total completed rides
    const totalCompleted = await CompletedRide.countDocuments();

    return {
      pendingMigration,
      recentlyMigrated,
      totalCompleted,
      lastChecked: now
    };
  } catch (error) {
    logger.error('Error getting migration stats:', error);
    throw error;
  }
};