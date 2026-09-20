"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearAccessToken, getAccessToken, hasAccessToken } from "@/lib/auth";
import { UserProvider } from "@/components/shared/UserContext";

type User = {
  id: string;
  email: string;
  name: string | null;
};

type AuthError = Error & {
  status?: number;
  code?: number;
};

type GateStatus = "checking" | "ready" | "redirecting";

type GateState = {
  status: GateStatus;
  user: User | null;
};

let cachedUser: User | null = null;
let authCheckPromise: Promise<User> | null = null;

export function setAuthUser(user: User) {
  cachedUser = user;
}

function clearAuthCache() {
  cachedUser = null;
  authCheckPromise = null;
}

function getLoginHref(pathname: string | null) {
  const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
  return `/auth/login${next}`;
}

function isUnauthorizedAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const authError = error as AuthError;
  return authError.status === 401 || authError.code === 401 || error.message === "请先登录";
}

async function validateAuth(): Promise<User> {
  if (cachedUser) {
    return cachedUser;
  }

  if (!authCheckPromise) {
    authCheckPromise = apiFetch<{ user: User }>("/api/auth/me")
      .then((data) => {
        cachedUser = data.user;
        authCheckPromise = null;
        return data.user;
      })
      .catch((error) => {
        authCheckPromise = null;
        throw error;
      });
  }

  return authCheckPromise;
}

function createInitialGateState(): GateState {
  return { status: "checking", user: null };
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gateState, setGateState] = useState<GateState>(() => createInitialGateState());

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      clearAuthCache();
      setGateState({ status: "redirecting", user: null });
      window.location.href = getLoginHref(pathname);
      return;
    }

    if (cachedUser) {
      setGateState({ status: "ready", user: cachedUser });
      return;
    }

    let active = true;

    void validateAuth()
      .then((user) => {
        if (!active) {
          return;
        }

        setGateState({ status: "ready", user });
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (!isUnauthorizedAuthError(error)) {
          console.error("AuthGate failed:", error);
        }

        clearAuthCache();
        clearAccessToken();
        setGateState({ status: "redirecting", user: null });
        window.location.href = getLoginHref(pathname);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  if (gateState.status === "redirecting") {
    return null;
  }

  return (
    <UserProvider initialUser={gateState.user} loading={gateState.status === "checking"}>
      {children}
    </UserProvider>
  );
}
