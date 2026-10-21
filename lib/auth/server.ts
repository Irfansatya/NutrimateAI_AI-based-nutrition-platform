import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";
import type { User, UserRole } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export { hashPassword, verifyPassword };

export const AUTH_COOKIE_NAME = "nm_session_token";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export const DUMMY_PASSWORD_HASH =
  "6b97b4b6a340b2e1c017df168886b4ee:058b49c8648a9c2b28aa2061a3f2d48624fa7d507b2a0ac6ae39bbac9b5b38c3dca8466676569fea518e9ed68eac1ccd7cbedacdb800754e29d6bcacfc3fb81f";

/**
 * Generate a random bearer session token (64 hex characters)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash session token using SHA-256 before saving to PostgreSQL
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Persist session in PostgreSQL and set HTTP-only cookie
 */
export async function createServerSession(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { token: rawToken, expiresAt };
}

/**
 * Revoke the current session and remove the cookie
 */
export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashSessionToken(rawToken);
    await prisma.userSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type SafeUser = Omit<User, "passwordHash" | "deletedAt">;

/**
 * Resolve currently authenticated user from cookie & database session
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!rawToken) return null;

    const tokenHash = hashSessionToken(rawToken);
    const now = new Date();

    const session = await prisma.userSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user) return null;

    // Check account status and soft delete
    if (session.user.status !== "ACTIVE" || session.user.deletedAt !== null) {
      return null;
    }

    const { passwordHash: _, deletedAt: __, ...safeUser } = session.user;
    return safeUser;
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user or throw/return null
 */
export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Require a user with a specific role (e.g. ADMIN)
 */
export async function requireRole(expectedRole: UserRole): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== expectedRole) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
