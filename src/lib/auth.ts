import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET =
  process.env.JWT_SECRET || "fuelgest-dev-secret-change-in-production-min-32-chars";
const TOKEN_COOKIE = "fuelgest_token";
const IMPERSONATION_COOKIE = "fuelgest_impersonate";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "manager" | "operator";
  companyId?: string | null;
  companyName?: string;
  forcePasswordChange?: boolean;
};

export type AuthSession = {
  user: SessionUser;
  impersonatedBy?: string; // ID do super admin que está impersonando
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const user = verifyToken(token);
  if (!user) return null;

  // Verifica se está impersonando
  const impersonationToken = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  let impersonatedBy: string | undefined;
  if (impersonationToken) {
    const imp = verifyToken(impersonationToken);
    if (imp && imp.role === "super_admin") {
      impersonatedBy = imp.id;
    }
  }

  return { user, impersonatedBy };
}

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const token = createToken(user);
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(IMPERSONATION_COOKIE);
}

export async function setImpersonationCookie(superAdmin: SessionUser) {
  const cookieStore = await cookies();
  const token = createToken(superAdmin);
  cookieStore.set(IMPERSONATION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 horas
  });
}

export async function clearImpersonationCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireCompanyUser(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role === "super_admin") {
    throw new Error("FORBIDDEN");
  }
  if (!user.companyId) {
    throw new Error("NO_COMPANY");
  }
  return user;
}

export async function requireManager(): Promise<SessionUser> {
  const user = await requireCompanyUser();
  if (user.role !== "manager") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Helpers para validar empresa/usuário no banco
export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { company: true },
  });
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (!user.active) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  // Atualiza último login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Registra log
  await db.auditLog.create({
    data: {
      userId: user.id,
      companyId: user.companyId,
      action: "login",
      details: `Login de ${user.email}`,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as SessionUser["role"],
    companyId: user.companyId,
    companyName: user.company?.name,
    forcePasswordChange: user.forcePasswordChange,
  };
}

// Helper para slug
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Helper para rate limit simples (memória)
const loginAttempts = new Map<string, { count: number; last: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 5 * 60 * 1000
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.last > windowMs) {
    loginAttempts.set(key, { count: 1, last: now });
    return { ok: true, remaining: maxAttempts - 1 };
  }

  record.count += 1;
  record.last = now;
  loginAttempts.set(key, record);

  return {
    ok: record.count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.count),
  };
}

export function resetRateLimit(key: string) {
  loginAttempts.delete(key);
}
