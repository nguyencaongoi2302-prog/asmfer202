import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'english_quiz_current_user';

function sanitizeUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const saveUser = (nextUser) => {
    const safeUser = sanitizeUser(nextUser);
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  };

  const login = async (email, password) => {
    const foundUser = await authApi.login(email, password);
    if (!foundUser) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    return saveUser(foundUser);
  };

  const register = async (payload) => {
    const createdUser = await authApi.register(payload);
    return saveUser(createdUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  }
  return context;
}
