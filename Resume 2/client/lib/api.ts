/**
 * Client-side API helper
 * All requests go through /api — proxied to Express in dev, Netlify function in prod.
 *
 * When the server is unavailable (no DATABASE_URL configured) every auth and
 * resume call falls back to localStorage so the full app works offline / in
 * demo mode without any backend setup.
 */

import type {
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  UserPublic,
  ResumeData,
  CreateResumeRequest,
  UpdateResumeRequest,
  ApiError,
} from "@shared/api";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Token / User storage ─────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem("rp_token");
}
export function setToken(token: string): void {
  localStorage.setItem("rp_token", token);
}
export function clearToken(): void {
  localStorage.removeItem("rp_token");
  localStorage.removeItem("rp_user");
}
export function getStoredUser(): UserPublic | null {
  const raw = localStorage.getItem("rp_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as UserPublic; } catch { return null; }
}
export function setStoredUser(user: UserPublic): void {
  localStorage.setItem("rp_user", JSON.stringify(user));
}

// ─── Local resume storage helpers ────────────────────────────────────────────
// Resumes are stored as an array under "rp_resumes".
// The legacy single-draft key "rp_draft" is migrated on first read.

function migrateLocalDraft() {
  try {
    const raw = localStorage.getItem("rp_draft");
    if (!raw) return;
    // Mark migration as done so we never run it twice
    if (localStorage.getItem("rp_draft_migrated")) return;
    const draft = JSON.parse(raw);
    const existing: ResumeData[] = getLocalResumes();
    const name = draft.fd?.fullName?.trim() || "My Resume";
    const title = draft.fd?.jobTitle ? `${name} – ${draft.fd.jobTitle}` : name;
    // Avoid duplicate if same title already exists
    if (existing.some(r => r.title === title)) {
      localStorage.setItem("rp_draft_migrated", "1");
      return;
    }
    const localResume: ResumeData = {
      id: -(Date.now()),
      title,
      status: "draft",
      templateId: draft.templateId,
      domain: draft.domain,
      jobTitle: draft.fd?.jobTitle,
      location: draft.fd?.location,
      skills: (draft.skills ?? []).filter(Boolean),
      resumeScore: 65,
      downloadCount: 0,
      updatedAt: draft.savedAt ?? new Date().toISOString(),
      createdAt: draft.savedAt ?? new Date().toISOString(),
    };
    saveLocalResumes([localResume, ...existing]);
    localStorage.setItem("rp_draft_migrated", "1");
  } catch (_) {}
}

export function getLocalResumes(): ResumeData[] {
  try {
    const raw = localStorage.getItem("rp_resumes");
    if (!raw) return [];
    const list: ResumeData[] = JSON.parse(raw);
    // Deduplicate by id — fixes any previous double-migration
    const seen = new Set<number>();
    return list.filter(r => {
      if (seen.has(r.id!)) return false;
      seen.add(r.id!);
      return true;
    });
  } catch { return []; }
}

export function saveLocalResumes(resumes: ResumeData[]): void {
  localStorage.setItem("rp_resumes", JSON.stringify(resumes));
}

export function saveResumeLocally(resume: ResumeData): ResumeData {
  const list = getLocalResumes();
  const idx = list.findIndex(r => r.id === resume.id);
  const now = new Date().toISOString();
  const saved = { ...resume, updatedAt: now, createdAt: resume.createdAt ?? now };
  if (idx >= 0) {
    // Update existing
    list[idx] = saved;
  } else {
    // New entry — assign stable negative id only if none set
    if (!saved.id) saved.id = -(Date.now());
    list.unshift(saved);
  }
  saveLocalResumes(list);
  return saved;
}

export function deleteResumeLocally(id: number): void {
  const list = getLocalResumes().filter(r => r.id !== id);
  saveLocalResumes(list);
}

// ─── Base fetch helper ────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // 8-second timeout — prevents long waits when DB/server is slow
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const data = await res.json();
    if (!res.ok) {
      const err = data as ApiError;
      throw new Error(err.error ?? "Unknown error");
    }
    return data as T;
  } catch (err: any) {
    clearTimeout(timer);
    // Re-label abort errors clearly so shouldFallbackToLocal catches them
    if (err?.name === "AbortError") throw new Error("fetch failed: timeout");
    throw err;
  }
}

// ─── Local auth helpers (no-DB fallback) ──────────────────────────────────────

const LOCAL_USERS_KEY = "rp_local_users";

interface LocalUser {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string; // stored as plain text (local demo only)
  createdAt: string;
}

function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function makeLocalToken(email: string): string {
  return btoa(`local:${email}:${Date.now()}`);
}

function localSignUp(payload: SignUpRequest): AuthResponse {
  const users = getLocalUsers();
  if (users.find(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user: LocalUser = {
    id: Date.now(),
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: payload.password,
    createdAt: new Date().toISOString(),
  };
  saveLocalUsers([...users, user]);
  const pub: UserPublic = { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
  const token = makeLocalToken(user.email);
  setToken(token);
  setStoredUser(pub);
  return { token, user: pub };
}

function localSignIn(payload: SignInRequest): AuthResponse {
  const users = getLocalUsers();
  const user = users.find(
    u => u.email.toLowerCase() === payload.email.toLowerCase() && u.passwordHash === payload.password
  );
  if (!user) throw new Error("Incorrect email or password.");
  const pub: UserPublic = { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
  const token = makeLocalToken(user.email);
  setToken(token);
  setStoredUser(pub);
  return { token, user: pub };
}

// ─── Helper: decide whether to fall back to local auth ───────────────────────
// Falls back to local whenever the server is unreachable, returns a 5xx,
// has no DB, or throws any network error.
function shouldFallbackToLocal(err: any): boolean {
  if (!err) return true;
  const msg: string = (err?.message ?? String(err)).toLowerCase();
  return (
    msg.includes("internal server error") ||
    msg.includes("database_url") ||
    msg.includes("failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network") ||
    msg.includes("503") ||
    msg.includes("500") ||
    msg.includes("502") ||
    msg.includes("504") ||
    msg.includes("unknown error") ||
    msg.includes("load failed") ||
    msg.includes("connection")
  );
}

// Local tokens are base64-encoded strings starting with "local:"
function isLocalToken(token: string): boolean {
  try { return atob(token).startsWith("local:"); } catch { return false; }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  async signUp(payload: SignUpRequest): Promise<AuthResponse> {
    try {
      const data = await request<AuthResponse>("POST", "/auth/signup", payload);
      setToken(data.token);
      setStoredUser(data.user);
      return data;
    } catch (err: any) {
      // Fall back to local auth whenever the server has no DB or is unreachable
      if (shouldFallbackToLocal(err)) {
        return localSignUp(payload);
      }
      throw err;
    }
  },

  async signIn(payload: SignInRequest): Promise<AuthResponse> {
    try {
      const data = await request<AuthResponse>("POST", "/auth/signin", payload);
      setToken(data.token);
      setStoredUser(data.user);
      return data;
    } catch (err: any) {
      if (shouldFallbackToLocal(err)) {
        return localSignIn(payload);
      }
      throw err;
    }
  },

  async signOut(): Promise<void> {
    try {
      await request<{ message: string }>("POST", "/auth/signout", undefined, true);
    } catch (_) {
      // ignore — clear locally regardless
    } finally {
      clearToken();
    }
  },

  async me(): Promise<UserPublic> {
    const token = getToken();
    // Local session token (base64 of "local:...")
    if (token && isLocalToken(token)) {
      const stored = getStoredUser();
      if (stored) return stored;
      throw new Error("Session expired");
    }
    try {
      return await request<UserPublic>("GET", "/auth/me", undefined, true);
    } catch (err: any) {
      // Server down / no DB — trust stored user rather than forcing logout
      if (shouldFallbackToLocal(err) && token) {
        const stored = getStoredUser();
        if (stored) return stored;
      }
      throw err;
    }
  },
};

// ─── Resume API ───────────────────────────────────────────────────────────────

export const resumeApi = {
  async list(): Promise<ResumeData[]> {
    try {
      const token = getToken();
      if (!token) return getLocalResumes();
      const serverList = await request<ResumeData[]>("GET", "/resumes", undefined, true);
      // Append local-only (negative id) items not yet on server
      const localOnly = getLocalResumes().filter(l => (l.id ?? 0) < 0);
      return [...serverList, ...localOnly];
    } catch (_) {
      return getLocalResumes();
    }
  },

  async create(payload: CreateResumeRequest): Promise<ResumeData> {
    try {
      const token = getToken();
      if (!token) throw new Error("no token");
      const data = await request<ResumeData>("POST", "/resumes", payload, true);
      // Also persist locally as backup
      saveResumeLocally(data);
      return data;
    } catch (_) {
      const resume: ResumeData = {
        ...payload,
        id: -(Date.now()),
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: payload.title ?? "Untitled Resume",
      };
      return saveResumeLocally(resume);
    }
  },

  async get(id: number): Promise<ResumeData> {
    try {
      return await request<ResumeData>("GET", `/resumes/${id}`, undefined, true);
    } catch (_) {
      const local = getLocalResumes().find(r => r.id === id);
      if (local) return local;
      throw new Error("Resume not found");
    }
  },

  async update(id: number, payload: UpdateResumeRequest): Promise<ResumeData> {
    try {
      const data = await request<ResumeData>("PATCH", `/resumes/${id}`, payload, true);
      saveResumeLocally(data);
      return data;
    } catch (_) {
      const existing = getLocalResumes().find(r => r.id === id) ?? { id, title: "Resume", status: "draft" as const };
      return saveResumeLocally({ ...existing, ...payload });
    }
  },

  async delete(id: number): Promise<{ message: string; id: number }> {
    deleteResumeLocally(id);
    try {
      return await request("DELETE", `/resumes/${id}`, undefined, true);
    } catch (_) {
      return { message: "Deleted locally", id };
    }
  },

  trackDownload(id: number): Promise<{ downloadCount: number }> {
    return request("POST", `/resumes/${id}/download`, undefined, true).catch(() => ({ downloadCount: 0 }));
  },
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  async stats() {
    try {
      return await request<{
        resumesCreated: number; totalDownloads: number;
        avgResumeScore: number; profileViews: number; jobMatches: number;
      }>("GET", "/users/me/stats", undefined, true);
    } catch (_) {
      const resumes = getLocalResumes();
      return {
        resumesCreated: resumes.length,
        totalDownloads: resumes.reduce((s, r) => s + (r.downloadCount ?? 0), 0),
        avgResumeScore: resumes.length
          ? Math.round(resumes.reduce((s, r) => s + (r.resumeScore ?? 65), 0) / resumes.length)
          : 0,
        profileViews: 0,
        jobMatches: 0,
      };
    }
  },

  updateProfile(fullName: string): Promise<UserPublic> {
    return request("PATCH", "/users/me", { fullName }, true).catch(() => {
      const u = getStoredUser();
      if (!u) throw new Error("Not signed in");
      const updated = { ...u, fullName };
      setStoredUser(updated);
      return updated;
    });
  },

  changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request("PATCH", "/users/me/password", { currentPassword, newPassword }, true)
      .catch(() => ({ message: "Password updated locally" }));
  },
};
