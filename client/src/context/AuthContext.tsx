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
      if (res.ok) {
        const data = await res.json();
        setMongoStatus(data);
      }
    } catch (err) {
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
      if (res.ok) {
        const data = await res.json();
        setPortalUsers(data);
      }
    } catch (err) {
      console.warn('Failed to load portal users:', err);
    }
  }, []);

  useEffect(() => {
    refreshMongoStatus();
    loadPortalUsers();
  }, [refreshMongoStatus, loadPortalUsers]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      setUser(data.user);
      setActiveRole(data.user.role);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      // Refresh MongoDB status
      refreshMongoStatus();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to auth server' };
    }
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
      const data = await res.json();
      refreshMongoStatus();
      return {
        success: data.success || res.ok,
        message: data.message || (res.ok ? 'MongoDB connected successfully' : 'Connection failed'),
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
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to create user' };
      }
      loadPortalUsers();
      return { success: true };
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
