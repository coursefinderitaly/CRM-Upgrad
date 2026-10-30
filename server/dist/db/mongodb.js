"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = connectMongoDB;
exports.isMongoConnected = isMongoConnected;
exports.getMongoStatus = getMongoStatus;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let mongoConnected = false;
let connectionError = null;
async function connectMongoDB() {
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
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        mongoConnected = true;
        connectionError = null;
        console.log('✅ [MongoDB] Successfully connected to MongoDB for User Credentials & Auth!');
        return true;
    }
    catch (err) {
        mongoConnected = false;
        connectionError = err.message || 'Failed to connect to MongoDB';
        console.warn(`⚠️ [MongoDB] Connection failed: ${connectionError}. Falling back to internal credential store.`);
        return false;
    }
}
function isMongoConnected() {
    return mongoConnected && mongoose_1.default.connection.readyState === 1;
}
function getMongoStatus() {
    const uri = process.env.MONGODB_URI || '';
    const isConfigured = uri.trim().length > 0;
    const maskedUri = isConfigured
        ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
        : 'Not configured';
    return {
        connected: isMongoConnected(),
        configured: isConfigured,
        maskedUri,
        readyState: mongoose_1.default.connection.readyState,
        error: connectionError,
        activeDatabase: isMongoConnected() ? mongoose_1.default.connection.name : 'Internal Credential Store',
    };
}
