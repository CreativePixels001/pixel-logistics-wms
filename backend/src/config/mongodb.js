/**
 * MongoDB Configuration
 * Connection setup for TMS (Transportation Management System)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./logger');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pixel_logistics_tms';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(mongoURI, options);
    
    logger.info('✅ MongoDB connection established successfully');
    logger.info(`📊 Connected to database: ${mongoose.connection.name}`);
    
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to MongoDB:', error.message);
    return false;
  }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
const closeMongoConnection = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};

module.exports = {
  connectMongoDB,
  closeMongoConnection,
  mongoose
};
