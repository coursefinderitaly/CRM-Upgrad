"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = verifyAuthToken;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UserModel_1 = require("../models/UserModel");
const mongodb_1 = require("../db/mongodb");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'study_abroad_crm_jwt_super_secret_key_2026';
// Helper to extract JWT token from header
function verifyAuthToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return null;
    const token = authHeader.split(' ')[1];
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await (0, UserModel_1.findUserByEmail)(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials. User not found.' });
        }
        if (user.status === 'Inactive') {
            return res.status(403).json({ error: 'This portal account has been deactivated. Contact an administrator.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
        }
        await (0, UserModel_1.updateLastLogin)(user.id);
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            portal: user.portal,
        }, JWT_SECRET, { expiresIn: '7d' });
        const { passwordHash: _, ...safeUser } = user;
        res.json({
            token,
            user: safeUser,
            mongoConnected: (0, mongodb_1.isMongoConnected)(),
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: error.message || 'Login failed' });
    }
});
// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const decoded = verifyAuthToken(req);
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized or token expired' });
        }
        const user = await (0, UserModel_1.findUserById)(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { passwordHash: _, ...safeUser } = user;
        res.json({
            user: safeUser,
            mongoConnected: (0, mongodb_1.isMongoConnected)(),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/auth/status - check MongoDB connection & auth health
router.get('/status', (req, res) => {
    res.json({
        ...(0, mongodb_1.getMongoStatus)(),
        demoAccounts: UserModel_1.DEFAULT_PORTAL_USERS.map((u) => ({
            name: u.name,
            email: u.email,
            role: u.role,
            portal: u.portal,
            defaultPassword: u.rawPassword,
        })),
    });
});
// GET /api/auth/users - list portal staff (for Admin portal)
router.get('/users', async (req, res) => {
    try {
        const users = await (0, UserModel_1.getAllUsers)();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/auth/users - create new portal user (for Admin portal)
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role, portal, phone, avatar } = req.body;
        if (!name || !email || !password || !role || !portal) {
            return res.status(400).json({ error: 'Name, email, password, role, and portal are required' });
        }
        const existing = await (0, UserModel_1.findUserByEmail)(email);
        if (existing) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }
        const newUser = await (0, UserModel_1.createUser)({
            name,
            email,
            password,
            role,
            portal,
            phone,
            avatar,
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/auth/configure-mongo - dynamically set MONGODB_URI and reconnect
router.post('/configure-mongo', async (req, res) => {
    try {
        const { mongodbUri } = req.body;
        if (!mongodbUri || typeof mongodbUri !== 'string') {
            return res.status(400).json({ error: 'Valid mongodbUri string is required' });
        }
        // Update .env file
        const envPath = path_1.default.resolve(__dirname, '../../.env');
        let envContent = '';
        if (fs_1.default.existsSync(envPath)) {
            envContent = fs_1.default.readFileSync(envPath, 'utf8');
            if (envContent.includes('MONGODB_URI=')) {
                envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${mongodbUri.trim()}`);
            }
            else {
                envContent += `\nMONGODB_URI=${mongodbUri.trim()}\n`;
            }
        }
        else {
            envContent = `PORT=5000\nJWT_SECRET=${JWT_SECRET}\nMONGODB_URI=${mongodbUri.trim()}\n`;
        }
        fs_1.default.writeFileSync(envPath, envContent, 'utf8');
        // Update process.env and attempt reconnect
        process.env.MONGODB_URI = mongodbUri.trim();
        const success = await (0, mongodb_1.connectMongoDB)();
        if (success) {
            await (0, UserModel_1.initializeDefaultUsers)();
            res.json({
                success: true,
                message: 'Successfully connected to MongoDB! Default portal accounts synced.',
                status: (0, mongodb_1.getMongoStatus)(),
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'MongoDB connection failed with the provided URI. Please check network/credentials.',
                status: (0, mongodb_1.getMongoStatus)(),
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
