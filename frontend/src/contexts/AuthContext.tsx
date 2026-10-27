'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { AUTH_EXPIRED_EVENT } from '@/lib/toast';

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ confirmToken?: string }>;
  confirmEmail: (token: string) => Promise<void>;
  confirmEmailChange: (token: string) => Promise<boolean>;
  resendConfirmation: () => Promise<{ message: string; confirmToken?: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(u: { id: number; email: string; displayName: string; role: string }): AuthUser {
  return { id: u.id, email: u.email, displayName: u.displayName, role: u.role === 'admin' ? 'admin' : 'user' };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ user: AuthUser }>('/api/auth/me');
      setUser(toAuthUser(res.user));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const res = await api.post<{ user: AuthUser; confirmToken?: string }>('/api/auth/register', { email, password, name });
    setUser(toAuthUser(res.user));
    if (res.confirmToken) {
      try { sessionStorage.setItem('rlm-confirm-token', res.confirmToken); } catch { /* ignore */ }
    }
    return { confirmToken: res.confirmToken };
  };

  const confirmEmail = async (token: string) => {
    const res = await api.post<{ user: AuthUser }>('/api/auth/confirm-email', { token });
    setUser(toAuthUser(res.user));
    try { sessionStorage.removeItem('rlm-confirm-token'); } catch { /* ignore */ }
    window.dispatchEvent(new Event('rlm-profile-refresh'));
  };

  const confirmEmailChange = async (token: string) => {
    const res = await api.post<{ user?: AuthUser; message?: string }>('/api/account/email/confirm', { token });
    if (res.user) {
      setUser(toAuthUser(res.user));
      window.dispatchEvent(new Event('rlm-profile-refresh'));
      return true;
    }
    return false;
  };

  const resendConfirmation = async () => {
    return api.post<{ message: string; confirmToken?: string }>('/api/auth/resend-confirmation');
  };

  const signIn = async (email: string, password: string) => {
    const res = await api.post<{ user: AuthUser }>('/api/auth/login', { email, password });
    setUser(toAuthUser(res.user));
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    return api.post<{ message: string; resetToken?: string }>('/api/auth/forgot-password', { email });
  };

  const resetPassword = async (token: string, password: string) => {
    const res = await api.post<{ user: AuthUser }>('/api/auth/reset-password', { token, password });
    setUser(toAuthUser(res.user));
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    signOut: logout,
    refresh,
    forgotPassword,
    resetPassword,
    confirmEmail,
    confirmEmailChange,
    resendConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}