import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredAuth,
  fetchCurrentUser,
  getStoredAuth,
  loginUser,
  logoutUser,
  registerUser,
  setStoredAuth,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const stored = getStoredAuth();
      if (!stored?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        clearStoredAuth();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    setStoredAuth(result);
    setUser(result.user);
    return result.user;
  };

  const register = async (payload) => {
    const result = await registerUser(payload);
    setStoredAuth(result);
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    const stored = getStoredAuth();
    clearStoredAuth();
    setUser(null);
    await logoutUser(stored?.refreshToken);
  };

  const value = useMemo(() => {
    return {
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      isAdmin: user?.tipo_usuario === 'administrador',
      canManageStock: ['administrador', 'vendedor'].includes(user?.tipo_usuario),
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
