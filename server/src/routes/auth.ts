import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  findUserByEmail,
  findUserById,
  getAllUsers,
  createUser,
  updateLastLogin,
  DEFAULT_PORTAL_USERS,
  initializeDefaultUsers,
} from '../models/UserModel';
import { connectMongoDB, getMongoStatus, isMongoConnected } from '../db/mongodb';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'study_abroad_crm_jwt_super_secret_key_2026';

// Helper to extract JWT token from header
export function verifyAuthToken(req: Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'This portal account has been deactivated. Contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    await updateLastLogin(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        portal: user.portal,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      token,
      user: safeUser,
      mongoConnected: isMongoConnected(),
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const decoded = verifyAuthToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized or token expired' });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      mongoConnected: isMongoConnected(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/status - check MongoDB connection & auth health
router.get('/status', (req: Request, res: Response) => {
  res.json({
    ...getMongoStatus(),
    demoAccounts: DEFAULT_PORTAL_USERS.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      portal: u.portal,
      defaultPassword: u.rawPassword,
    })),
  });
});

// GET /api/auth/users - list portal staff (for Admin portal)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/users - create new portal user (for Admin portal)
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, portal, phone, avatar } = req.body;

    if (!name || !email || !password || !role || !portal) {
      return res.status(400).json({ error: 'Name, email, password, role, and portal are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const newUser = await createUser({
      name,
      email,
      password,
      role,
      portal,
      phone,
      avatar,
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/configure-mongo - dynamically set MONGODB_URI and reconnect
router.post('/configure-mongo', async (req: Request, res: Response) => {
  try {
    const { mongodbUri } = req.body;
    if (!mongodbUri || typeof mongodbUri !== 'string') {
      return res.status(400).json({ error: 'Valid mongodbUri string is required' });
    }

    // Update .env file
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${mongodbUri.trim()}`);
      } else {
        envContent += `\nMONGODB_URI=${mongodbUri.trim()}\n`;
      }
    } else {
      envContent = `PORT=5000\nJWT_SECRET=${JWT_SECRET}\nMONGODB_URI=${mongodbUri.trim()}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');

    // Update process.env and attempt reconnect
    process.env.MONGODB_URI = mongodbUri.trim();
    const success = await connectMongoDB();
    if (success) {
      await initializeDefaultUsers();
      res.json({
        success: true,
        message: 'Successfully connected to MongoDB! Default portal accounts synced.',
        status: getMongoStatus(),
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'MongoDB connection failed with the provided URI. Please check network/credentials.',
        status: getMongoStatus(),
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
