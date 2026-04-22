import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/authService";

const AUTH_STORAGE_KEY = "auth_session";

const AuthContext = createContext(null);

function readStoredSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.refresh_token) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    clearSession();
    setSession(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (accessToken) => {
    const response = await getCurrentUser(accessToken);
    return response.user;
  }, []);

  useEffect(() => {
    async function restore() {
      const storedSession = readStoredSession();
      if (!storedSession) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await refreshUser(storedSession.access_token);
        setSession(storedSession);
        setUser(currentUser);
      } catch {
        clearAuthState();
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, [clearAuthState, refreshUser]);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    if (!response?.session?.access_token || !response?.session?.refresh_token) {
      throw new Error("Login succeeded but no session was returned");
    }

    storeSession(response.session);
    setSession(response.session);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const response = await registerRequest({ name, email, password });

    if (response?.session?.access_token && response?.session?.refresh_token) {
      storeSession(response.session);
      setSession(response.session);
      setUser(response.user);
    }

    return response;
  }, []);

  const logout = useCallback(async () => {
    if (!session?.access_token || !session?.refresh_token) {
      clearAuthState();
      return;
    }

    try {
      await logoutRequest({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      });
    } finally {
      clearAuthState();
    }
  }, [clearAuthState, session]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, session, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
