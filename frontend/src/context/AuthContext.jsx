import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, normalizeApiError, tokenStore } from '../services/api';
import { AuthContext } from './auth-context';

function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function buildUserFromToken(accessToken, fallback = {}) {
  const claims = decodeJwt(accessToken) || {};
  const email = fallback.email || claims.email || '';
  const username =
    fallback.username ||
    claims.username ||
    claims.user_name ||
    claims.preferred_username ||
    (email ? email.split('@')[0] : '');
  const id = claims.user_id || claims.id || fallback.id || username || email || 'user';

  return {
    id,
    username: username || 'User',
    email,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const accessToken = tokenStore.getAccess();
      if (!accessToken) {
        setLoading(false);
        return;
      }

      setCurrentUser(buildUserFromToken(accessToken));

      try {
        const response = await authApi.getCurrentUser();
        setCurrentUser((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch {
        tokenStore.clear();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await authApi.login({ username, password });
    tokenStore.setTokens(response.data);
    const me = await authApi.getCurrentUser();
    const user = buildUserFromToken(response.data?.access, { ...me.data, username });
    setCurrentUser({
      ...user,
      ...me.data,
    });
    return {
      ...user,
      ...me.data,
    };
  }, []);

  const signup = useCallback(async (username, email, password) => {
    await authApi.register({ username, email, password });
    return login(username, password);
  }, [login]);

  const loginWithGoogleToken = useCallback(async (token) => {
    const response = await authApi.googleLogin({ token });
    tokenStore.setTokens(response.data);
    const me = await authApi.getCurrentUser();
    const apiUser = response.data?.user || me.data || {};
    const user = buildUserFromToken(response.data?.access, apiUser);
    setCurrentUser({
      ...user,
      ...me.data,
    });
    return {
      ...user,
      ...me.data,
    };
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const response = await authApi.getCurrentUser();
    setCurrentUser((prev) => ({
      ...prev,
      ...response.data,
    }));
    return response.data;
  }, []);

  const updateCurrentUser = useCallback(async (payload) => {
    const response = await authApi.updateCurrentUser(payload);
    setCurrentUser((prev) => ({
      ...prev,
      ...response.data,
    }));
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API logout errors and clear local auth state anyway.
    } finally {
      tokenStore.clear();
      setCurrentUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(tokenStore.getAccess()),
      loading,
      login,
      signup,
      loginWithGoogleToken,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
      normalizeApiError,
    }),
    [currentUser, loading, login, signup, loginWithGoogleToken, logout, refreshCurrentUser, updateCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
