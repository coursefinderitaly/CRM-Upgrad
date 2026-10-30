import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoConnected = false;
let connectionError: string | null = null;

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('ℹ️ [MongoDB] MONGODB_URI not set in server/.env. Running with local credential fallback.');
    mongoConnected = false;
    connectionError = 'MONGODB_URI is empty. Waiting for user to configure MongoDB connection string.';
    return false;
  }

  try {
    console.log('⏳ [MongoDB] Connecting to MongoDB database...');
    // Connect with a reasonable timeout so server boots quickly
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    mongoConnected = true;
    connectionError = null;
    console.log('✅ [MongoDB] Successfully connected to MongoDB for User Credentials & Auth!');
    return true;
  } catch (err: any) {
    mongoConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB';
    console.warn(`⚠️ [MongoDB] Connection failed: ${connectionError}. Falling back to internal credential store.`);
    return false;
  }
}

export function isMongoConnected(): boolean {
  return mongoConnected && mongoose.connection.readyState === 1;
}

export function getMongoStatus() {
  const uri = process.env.MONGODB_URI || '';
  const isConfigured = uri.trim().length > 0;
  const maskedUri = isConfigured
    ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    : 'Not configured';

  return {
    connected: isMongoConnected(),
    configured: isConfigured,
    maskedUri,
    readyState: mongoose.connection.readyState,
    error: connectionError,
    activeDatabase: isMongoConnected() ? mongoose.connection.name : 'Internal Credential Store',
  };
}
