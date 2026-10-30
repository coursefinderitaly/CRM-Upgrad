import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, PortalMeta, PORTAL_CONFIGS, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  activePortal: PortalMeta;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  mongoStatus: {
    connected: boolean;
    configured: boolean;
    activeDatabase?: string;
    maskedUri?: string;
    error?: string | null;
  } | null;
  refreshMongoStatus: () => Promise<void>;
  configureMongoUri: (uri: string) => Promise<{ success: boolean; message: string }>;
  portalUsers: any[];
  loadPortalUsers: () => Promise<void>;
  createPortalUser: (data: any) => Promise<{ success: boolean; error?: string }>;
  switchPortal: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'crm_auth_token_v1';
const USER_KEY = 'crm_auth_user_v1';

export const FALLBACK_PORTAL_USERS: (AuthUser & { password: string })[] = [
  {
    id: 'usr-counsellor-01',
    name: 'Neha Sharma (Counsellor)',
    email: 'counsellor@crm.com',
    password: 'counsellor123',
    role: 'counsellor',
    portal: 'Counsellor Portal',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
  },
  {
    id: 'usr-admin-01',
    name: 'Alex Morgan (Admin)',
    email: 'admin@crm.com',
    password: 'admin123',
    role: 'admin',
    portal: 'Admin Portal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98200 11223',
  },
  {
    id: 'usr-docs-01',
    name: 'Vikram Malhotra (Docs & Apps)',
    email: 'docs@crm.com',
    password: 'docs123',
    role: 'docs',
    portal: 'Document / Application Portal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98111 22334',
  },
  {
    id: 'usr-scholarship-01',
    name: 'Elena Rossi (Scholarship Specialist)',
    email: 'scholarship@crm.com',
    password: 'scholarship123',
    role: 'scholarship',
    portal: 'Scholarship Portal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    phone: '+39 345 678 9012',
  },
  {
    id: 'usr-visa-01',
    name: 'Marco Bianchi (Visa & Legalization)',
    email: 'visa@crm.com',
    password: 'visa123',
    role: 'visa',
    portal: 'Visa Portal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    phone: '+39 349 876 5432',
  },
  {
    id: 'usr-upgrad-01',
    name: 'Pooja Verma (UpGrad Lead)',
    email: 'upgrad@crm.com',
    password: 'upgrad123',
    role: 'upgrad',
    portal: 'UpGrad Portal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    phone: '+91 99887 66554',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => user?.role || 'admin');
  const [mongoStatus, setMongoStatus] = useState<any>(null);
  const [portalUsers, setPortalUsers] = useState<any[]>([]);

  // Keep active role aligned with logged-in user
  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  const activePortal = PORTAL_CONFIGS[activeRole] || PORTAL_CONFIGS.admin;

  const refreshMongoStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setMongoStatus(data);
      } else {
        setMongoStatus({
          connected: false,
          configured: false,
          error: 'Backend API in static/offline mode',
        });
      }
    } catch {
      setMongoStatus({
        connected: false,
        configured: false,
        error: 'Backend API unreachable',
      });
    }
  }, []);

  const loadPortalUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setPortalUsers(data);
        return;
      }
    } catch (err) {
      console.warn('Failed to load portal users from backend:', err);
    }
    // Fallback to standard portal accounts if backend is offline/static
    setPortalUsers(
      FALLBACK_PORTAL_USERS.map(({ password: _, ...u }) => ({
        ...u,
        status: 'Active',
      }))
    );
  }, []);

  useEffect(() => {
    refreshMongoStatus();
    loadPortalUsers();
  }, [refreshMongoStatus, loadPortalUsers]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = (email || '').trim().toLowerCase();

    // 1. First attempt live authentication against the backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data?.token && data?.user) {
          setToken(data.token);
          setUser(data.user);
          setActiveRole(data.user.role);
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          refreshMongoStatus();
          return { success: true };
        }
        // If the backend actively rejected with 400/401/403, return that rejection error
        if (res.status !== 404 && data?.error) {
          return { success: false, error: data.error };
        }
      }
    } catch {
      // Backend fetch failed (network error, CORS, or HTML 404/500). Gracefully proceed to fallback below.
    }

    // 2. Resilient Fallback: If server returned non-JSON, 404, or is running on static hosting, authenticate against known portal credentials
    const fallbackUser = FALLBACK_PORTAL_USERS.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (fallbackUser) {
      if (fallbackUser.password === password) {
        const safeUser: AuthUser = {
          id: fallbackUser.id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          role: fallbackUser.role,
          portal: fallbackUser.portal,
          avatar: fallbackUser.avatar,
          phone: fallbackUser.phone,
        };
        const fallbackToken = `crm_token_${fallbackUser.role}_${Date.now()}`;
        setToken(fallbackToken);
        setUser(safeUser);
        setActiveRole(safeUser.role);
        localStorage.setItem(TOKEN_KEY, fallbackToken);
        localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials. Incorrect password.' };
      }
    }

    return { success: false, error: 'Invalid credentials. User not found.' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const configureMongoUri = async (uri: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/configure-mongo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongodbUri: uri }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        refreshMongoStatus();
        return {
          success: data.success || res.ok,
          message: data.message || (res.ok ? 'MongoDB connected successfully' : 'Connection failed'),
        };
      }
      return {
        success: false,
        message: 'Backend server did not respond with JSON',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to submit MongoDB URI to backend',
      };
    }
  };

  const createPortalUser = async (data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const result = await res.json();
        if (!res.ok) {
          return { success: false, error: result.error || 'Failed to create user' };
        }
        loadPortalUsers();
        return { success: true };
      }
      return { success: false, error: 'Server returned non-JSON response' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const switchPortal = useCallback((role: UserRole) => {
    setActiveRole(role);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        activePortal,
        login,
        logout,
        mongoStatus,
        refreshMongoStatus,
        configureMongoUri,
        portalUsers,
        loadPortalUsers,
        createPortalUser,
        switchPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
