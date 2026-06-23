"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase, supabaseConfig, isSupabaseConfigured } from "@/lib/supabase";
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
  resetPassword: (password: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Owner email is always treated as admin. */
function deriveRole(email: string, profileRole?: string): UserRole {
  if (
    supabaseConfig.ownerEmail &&
    email.toLowerCase() === supabaseConfig.ownerEmail.toLowerCase()
  ) {
    return "admin";
  }
  if (profileRole === "expert" || profileRole === "admin" || profileRole === "intern") return profileRole;
  return "client";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) {
      setUser(null);
      return;
    }
    // Pull the role from the profiles table (best-effort).
    let profileRole: string | undefined;
    let name = (u.user_metadata?.name as string) || u.email || "";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", u.id)
        .maybeSingle();
      if (profile) {
        profileRole = profile.role;
        if (profile.name) name = profile.name;
      }
    } catch {
      /* profile not found yet — fall back to metadata */
    }
    setUser({
      id: u.id,
      name,
      email: u.email ?? "",
      role: deriveRole(u.email ?? "", profileRole),
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      await hydrate();
    } finally {
      setLoading(false);
    }
  }, [hydrate]);

  useEffect(() => {
    refresh();
    if (!isSupabaseConfigured) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ensure RLS-protected Realtime channels use the current access token.
      supabase.realtime.setAuth(session?.access_token ?? null);
      hydrate();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh, hydrate]);

  /** Insert or update the caller's own profile row. */
  const upsertProfile = useCallback(
    async (id: string, name: string, email: string, role: UserRole) => {
      await supabase.from("profiles").upsert({ id, name, email, role });
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const role = deriveRole(email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (error) throw error;

      // Ensure we have an active session (works when email confirmation is off).
      let userId = data.user?.id;
      if (!data.session) {
        const { data: signIn, error: signInErr } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          throw new Error(
            "Account created. Please confirm your email, then log in."
          );
        }
        userId = signIn.user?.id ?? userId;
      }
      if (userId) await upsertProfile(userId, name, email, role);
      await refresh();
    },
    [refresh, upsertProfile]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refresh();
    },
    [refresh]
  );

  const loginWithGoogle = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${supabaseConfig.appUrl}/app` },
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${supabaseConfig.appUrl}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (password: string) => {
    // The recovery link establishes a session (detectSessionInUrl);
    // we just set the new password on the active user.
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isSupabaseConfigured,
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
