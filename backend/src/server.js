import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first - specify exact path
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import { startRideMigrationScheduler } from './services/rideMigrationService.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start the ride migration scheduler
startRideMigrationScheduler();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
  });
});

export default server;