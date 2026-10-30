"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PORTAL_USERS = exports.MongoUser = void 0;
exports.initializeDefaultUsers = initializeDefaultUsers;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.updateLastLogin = updateLastLogin;
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("../db/mongodb");
const UserSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
UserSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.passwordHash);
};
exports.MongoUser = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
// In-memory / Fallback user store (guarantees zero downtime if MongoDB isn't connected yet)
const inMemoryUsers = [];
exports.DEFAULT_PORTAL_USERS = [
    {
        id: 'usr-admin-01',
        name: 'Alex Morgan (Admin)',
        email: 'admin@crm.com',
        rawPassword: 'admin123',
        role: 'admin',
        portal: 'Admin Portal',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        phone: '+91 98200 11223',
        status: 'Active',
    },
    {
        id: 'usr-counsellor-01',
        name: 'Neha Sharma (Counsellor)',
        email: 'counsellor@crm.com',
        rawPassword: 'counsellor123',
        role: 'counsellor',
        portal: 'Counsellor Portal',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        phone: '+91 98765 43210',
        status: 'Active',
    },
    {
        id: 'usr-docs-01',
        name: 'Vikram Malhotra (Docs & Apps)',
        email: 'docs@crm.com',
        rawPassword: 'docs123',
        role: 'docs',
        portal: 'Document / Application Portal',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        phone: '+91 98111 22334',
        status: 'Active',
    },
    {
        id: 'usr-scholarship-01',
        name: 'Elena Rossi (Scholarship Specialist)',
        email: 'scholarship@crm.com',
        rawPassword: 'scholarship123',
        role: 'scholarship',
        portal: 'Scholarship Portal',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        phone: '+39 345 678 9012',
        status: 'Active',
    },
    {
        id: 'usr-visa-01',
        name: 'Marco Bianchi (Visa & Legalization)',
        email: 'visa@crm.com',
        rawPassword: 'visa123',
        role: 'visa',
        portal: 'Visa Portal',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        phone: '+39 349 876 5432',
        status: 'Active',
    },
    {
        id: 'usr-upgrad-01',
        name: 'Pooja Verma (UpGrad Lead)',
        email: 'upgrad@crm.com',
        rawPassword: 'upgrad123',
        role: 'upgrad',
        portal: 'UpGrad Portal',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        phone: '+91 99887 66554',
        status: 'Active',
    },
];
async function initializeDefaultUsers() {
    const salt = await bcryptjs_1.default.genSalt(10);
    // Initialize in-memory store
    if (inMemoryUsers.length === 0) {
        for (const u of exports.DEFAULT_PORTAL_USERS) {
            const passwordHash = await bcryptjs_1.default.hash(u.rawPassword, salt);
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
    if ((0, mongodb_1.isMongoConnected)()) {
        try {
            for (const u of exports.DEFAULT_PORTAL_USERS) {
                const exists = await exports.MongoUser.findOne({ email: u.email.toLowerCase() });
                if (!exists) {
                    const passwordHash = await bcryptjs_1.default.hash(u.rawPassword, salt);
                    await exports.MongoUser.create({
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
        }
        catch (e) {
            console.warn('⚠️ [MongoDB] Could not seed default users into MongoDB:', e.message);
        }
    }
}
// Unified repository methods:
async function findUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if ((0, mongodb_1.isMongoConnected)()) {
        try {
            const doc = await exports.MongoUser.findOne({ email: cleanEmail });
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
        }
        catch (err) {
            console.warn('⚠️ [MongoDB] Error finding user, falling back to memory store:', err);
        }
    }
    const found = inMemoryUsers.find((u) => u.email === cleanEmail);
    return found || null;
}
async function findUserById(id) {
    if ((0, mongodb_1.isMongoConnected)()) {
        try {
            const doc = await exports.MongoUser.findById(id);
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
        }
        catch (err) {
            // Fallback
        }
    }
    const found = inMemoryUsers.find((u) => u.id === id);
    return found || null;
}
async function updateLastLogin(id) {
    const now = new Date();
    if ((0, mongodb_1.isMongoConnected)()) {
        try {
            await exports.MongoUser.findByIdAndUpdate(id, { lastLogin: now });
        }
        catch { }
    }
    const u = inMemoryUsers.find((user) => user.id === id);
    if (u)
        u.lastLogin = now;
}
async function getAllUsers() {
    if ((0, mongodb_1.isMongoConnected)()) {
        try {
            const docs = await exports.MongoUser.find().select('-passwordHash').sort({ createdAt: -1 });
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
        }
        catch { }
    }
    return inMemoryUsers.map(({ passwordHash, ...rest }) => rest);
}
async function createUser(data) {
    const cleanEmail = data.email.trim().toLowerCase();
    const salt = await bcryptjs_1.default.genSalt(10);
    const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
    if ((0, mongodb_1.isMongoConnected)()) {
        const doc = await exports.MongoUser.create({
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
    const newUser = {
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
