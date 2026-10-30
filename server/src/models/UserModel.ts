import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMongoConnected } from '../db/mongodb';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'counsellor' | 'docs' | 'scholarship' | 'visa' | 'upgrad';
  portal: string;
  avatar?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  lastLogin?: Date;
}

export interface IUserDocument extends Document, Omit<IUser, 'id'> {
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'counsellor', 'docs', 'scholarship', 'visa', 'upgrad'],
      default: 'counsellor',
    },
    portal: { type: String, required: true },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const MongoUser = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

// In-memory / Fallback user store (guarantees zero downtime if MongoDB isn't connected yet)
const inMemoryUsers: IUser[] = [];

export const DEFAULT_PORTAL_USERS = [
  {
    id: 'usr-admin-01',
    name: 'Alex Morgan (Admin)',
    email: 'admin@crm.com',
    rawPassword: 'admin123',
    role: 'admin' as const,
    portal: 'Admin Portal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98200 11223',
    status: 'Active' as const,
  },
  {
    id: 'usr-counsellor-01',
    name: 'Neha Sharma (Counsellor)',
    email: 'counsellor@crm.com',
    rawPassword: 'counsellor123',
    role: 'counsellor' as const,
    portal: 'Counsellor Portal',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    status: 'Active' as const,
  },
  {
    id: 'usr-docs-01',
    name: 'Vikram Malhotra (Docs & Apps)',
    email: 'docs@crm.com',
    rawPassword: 'docs123',
    role: 'docs' as const,
    portal: 'Document / Application Portal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98111 22334',
    status: 'Active' as const,
  },
  {
    id: 'usr-scholarship-01',
    name: 'Elena Rossi (Scholarship Specialist)',
    email: 'scholarship@crm.com',
    rawPassword: 'scholarship123',
    role: 'scholarship' as const,
    portal: 'Scholarship Portal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    phone: '+39 345 678 9012',
    status: 'Active' as const,
  },
  {
    id: 'usr-visa-01',
    name: 'Marco Bianchi (Visa & Legalization)',
    email: 'visa@crm.com',
    rawPassword: 'visa123',
    role: 'visa' as const,
    portal: 'Visa Portal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    phone: '+39 349 876 5432',
    status: 'Active' as const,
  },
  {
    id: 'usr-upgrad-01',
    name: 'Pooja Verma (UpGrad Lead)',
    email: 'upgrad@crm.com',
    rawPassword: 'upgrad123',
    role: 'upgrad' as const,
    portal: 'UpGrad Portal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    phone: '+91 99887 66554',
    status: 'Active' as const,
  },
];

export async function initializeDefaultUsers() {
  const salt = await bcrypt.genSalt(10);

  // Initialize in-memory store
  if (inMemoryUsers.length === 0) {
    for (const u of DEFAULT_PORTAL_USERS) {
      const passwordHash = await bcrypt.hash(u.rawPassword, salt);
      inMemoryUsers.push({
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash,
        role: u.role,
        portal: u.portal,
        avatar: u.avatar,
        phone: u.phone,
        status: u.status,
        createdAt: new Date(),
      });
    }
    console.log('✅ [Auth] 5 Default Portal User Accounts initialized in credential store.');
  }

  // If MongoDB is connected, ensure default users are present in MongoDB collection
  if (isMongoConnected()) {
    try {
      for (const u of DEFAULT_PORTAL_USERS) {
        const exists = await MongoUser.findOne({ email: u.email.toLowerCase() });
        if (!exists) {
          const passwordHash = await bcrypt.hash(u.rawPassword, salt);
          await MongoUser.create({
            name: u.name,
            email: u.email.toLowerCase(),
            passwordHash,
            role: u.role,
            portal: u.portal,
            avatar: u.avatar,
            phone: u.phone,
            status: u.status,
          });
          console.log(`✅ [MongoDB] Seeded user ${u.email} to MongoDB collection`);
        }
      }
    } catch (e: any) {
      console.warn('⚠️ [MongoDB] Could not seed default users into MongoDB:', e.message);
    }
  }
}

// Unified repository methods:
export async function findUserByEmail(email: string): Promise<IUser | null> {
  const cleanEmail = email.trim().toLowerCase();

  if (isMongoConnected()) {
    try {
      const doc = await MongoUser.findOne({ email: cleanEmail });
      if (doc) {
        return {
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          role: doc.role,
          portal: doc.portal,
          avatar: doc.avatar,
          phone: doc.phone,
          status: doc.status,
          createdAt: doc.createdAt,
          lastLogin: doc.lastLogin,
        };
      }
    } catch (err) {
      console.warn('⚠️ [MongoDB] Error finding user, falling back to memory store:', err);
    }
  }

  const found = inMemoryUsers.find((u) => u.email === cleanEmail);
  return found || null;
}

export async function findUserById(id: string): Promise<IUser | null> {
  if (isMongoConnected()) {
    try {
      const doc = await MongoUser.findById(id);
      if (doc) {
        return {
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          role: doc.role,
          portal: doc.portal,
          avatar: doc.avatar,
          phone: doc.phone,
          status: doc.status,
          createdAt: doc.createdAt,
          lastLogin: doc.lastLogin,
        };
      }
    } catch (err) {
      // Fallback
    }
  }

  const found = inMemoryUsers.find((u) => u.id === id);
  return found || null;
}

export async function updateLastLogin(id: string): Promise<void> {
  const now = new Date();
  if (isMongoConnected()) {
    try {
      await MongoUser.findByIdAndUpdate(id, { lastLogin: now });
    } catch {}
  }
  const u = inMemoryUsers.find((user) => user.id === id);
  if (u) u.lastLogin = now;
}

export async function getAllUsers(): Promise<Omit<IUser, 'passwordHash'>[]> {
  if (isMongoConnected()) {
    try {
      const docs = await MongoUser.find().select('-passwordHash').sort({ createdAt: -1 });
      return docs.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        email: d.email,
        role: d.role,
        portal: d.portal,
        avatar: d.avatar,
        phone: d.phone,
        status: d.status,
        createdAt: d.createdAt,
        lastLogin: d.lastLogin,
      }));
    } catch {}
  }

  return inMemoryUsers.map(({ passwordHash, ...rest }) => rest);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'counsellor' | 'docs' | 'scholarship' | 'visa' | 'upgrad';
  portal: string;
  phone?: string;
  avatar?: string;
}): Promise<Omit<IUser, 'passwordHash'>> {
  const cleanEmail = data.email.trim().toLowerCase();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  if (isMongoConnected()) {
    const doc = await MongoUser.create({
      name: data.name,
      email: cleanEmail,
      passwordHash,
      role: data.role,
      portal: data.portal,
      phone: data.phone || '',
      avatar: data.avatar || '',
      status: 'Active',
    });
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      portal: doc.portal,
      phone: doc.phone,
      avatar: doc.avatar,
      status: doc.status,
      createdAt: doc.createdAt,
    };
  }

  const newUser: IUser = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: cleanEmail,
    passwordHash,
    role: data.role,
    portal: data.portal,
    phone: data.phone || '',
    avatar: data.avatar || '',
    status: 'Active',
    createdAt: new Date(),
  };

  inMemoryUsers.push(newUser);
  const { passwordHash: _, ...userWithoutPass } = newUser;
  return userWithoutPass;
}
