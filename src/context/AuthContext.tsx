"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { account, client, ID, OAuthProvider, appwriteConfig, isAppwriteConfigured } from "@/lib/appwrite";
import type { UserRole } from "@/lib/types";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    userId: string,
    secret: string,
    password: string
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Owner email is always treated as admin. */
function deriveRole(email: string, prefRole?: string): UserRole {
  if (
    appwriteConfig.ownerEmail &&
    email.toLowerCase() === appwriteConfig.ownerEmail.toLowerCase()
  ) {
    return "admin";
  }
  if (prefRole === "expert" || prefRole === "admin") return prefRole;
  return "client";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAppwriteConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await account.get();
      setUser({
        id: me.$id,
        name: me.name,
        email: me.email,
        role: deriveRole(me.email, (me.prefs as { role?: string })?.role),
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Ping Appwrite on app open to verify the SDK connection.
    if (isAppwriteConfigured) {
      client
        .ping()
        .then(() =>
          console.log(
            `[Appwrite] ✓ Connected to ${appwriteConfig.endpoint} (project ${appwriteConfig.projectId})`
          )
        )
        .catch((e) => console.error("[Appwrite] ✗ Ping failed:", e));
    }
  }, [refresh]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const role = deriveRole(email);
      await account.updatePrefs({ role });
      await refresh();
    },
    [refresh]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      await account.createEmailPasswordSession(email, password);
      await refresh();
    },
    [refresh]
  );

  const loginWithGoogle = useCallback(() => {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${appwriteConfig.appUrl}/app`,
      `${appwriteConfig.appUrl}/login?error=oauth`
    );
  }, []);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession("current");
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await account.createRecovery(
      email,
      `${appwriteConfig.appUrl}/reset-password`
    );
  }, []);

  const resetPassword = useCallback(
    async (userId: string, secret: string, password: string) => {
      await account.updateRecovery(userId, secret, password);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isAppwriteConfigured,
        register,
        login,
        loginWithGoogle,
        logout,
        forgotPassword,
        resetPassword,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
