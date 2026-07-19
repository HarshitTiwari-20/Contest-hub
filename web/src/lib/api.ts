const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export function getApiUrl(path = "") {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export type PublicUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  country: string | null;
  college: string | null;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  maxStreak: number;
  isPublic: boolean;
  createdAt: string;
};

export async function apiRegister(input: {
  email: string;
  username: string;
  password: string;
  name?: string;
}): Promise<{ user: PublicUser } | { error: string; issues?: { path: string; message: string }[] }> {
  const res = await fetch(getApiUrl("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      error: data.error ?? "Registration failed",
      issues: data.issues,
    };
  }
  return data;
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser } | { error: string; issues?: { path: string; message: string }[] }> {
  const res = await fetch(getApiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      error: data.error ?? "Sign in failed",
      issues: data.issues,
    };
  }
  return data;
}
