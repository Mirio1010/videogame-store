import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  deleteAccount as deleteAccountRequest,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateEmail as updateEmailRequest,
  updateNickname as updateNicknameRequest,
  updatePassword as updatePasswordRequest,
  uploadAvatar as uploadAvatarRequest,
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

  const refreshCurrentUser = useCallback(async () => {
    if (!session?.access_token) {
      return null;
    }

    const currentUser = await refreshUser(session.access_token);
    setUser(currentUser);
    return currentUser;
  }, [refreshUser, session]);

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

  const updateNickname = useCallback(
    async (nickname) => {
      if (!session?.access_token) {
        throw new Error("You must be logged in to update nickname");
      }

      const response = await updateNicknameRequest({
        accessToken: session.access_token,
        nickname,
      });
      if (response?.user) {
        setUser(response.user);
      }
      return response;
    },
    [session]
  );

  const updateAvatar = useCallback(
    async (avatarDataUrl) => {
      if (!session?.access_token) {
        throw new Error("You must be logged in to update avatar");
      }

      const response = await uploadAvatarRequest({
        accessToken: session.access_token,
        avatarDataUrl,
      });
      if (response?.user) {
        setUser(response.user);
      }
      return response;
    },
    [session]
  );

  const updateEmail = useCallback(
    async (email) => {
      if (!session?.access_token) {
        throw new Error("You must be logged in to update email");
      }

      const response = await updateEmailRequest({
        accessToken: session.access_token,
        email,
      });
      if (response?.user) {
        setUser(response.user);
      }
      return response;
    },
    [session]
  );

  const updatePassword = useCallback(
    async (password) => {
      if (!session?.access_token) {
        throw new Error("You must be logged in to update password");
      }

      return updatePasswordRequest({
        accessToken: session.access_token,
        password,
      });
    },
    [session]
  );

  const deleteMyAccount = useCallback(
    async (confirmationText) => {
      if (!session?.access_token) {
        throw new Error("You must be logged in to delete account");
      }

      const response = await deleteAccountRequest({
        accessToken: session.access_token,
        confirmationText,
      });

      clearAuthState();
      return response;
    },
    [clearAuthState, session]
  );

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshCurrentUser,
      updateNickname,
      updateAvatar,
      updateEmail,
      updatePassword,
      deleteMyAccount,
    }),
    [
      user,
      session,
      loading,
      login,
      register,
      logout,
      refreshCurrentUser,
      updateNickname,
      updateAvatar,
      updateEmail,
      updatePassword,
      deleteMyAccount,
    ]
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
