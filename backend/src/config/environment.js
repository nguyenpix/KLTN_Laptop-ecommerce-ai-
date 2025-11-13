import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment configuration
const config = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop_store',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // File upload configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10MB',
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',
};

export default config;
