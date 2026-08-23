import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { prisma } from "@/lib/db/client";

const sessionCookieName = "dini_admin_session_v2";
const legacySessionCookieName = "dini_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export type AuthenticatedAdmin = {
  id: string;
  name: string;
  role: string;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionExpiry() {
  return new Date(Date.now() + sessionMaxAgeSeconds * 1000);
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = getSessionExpiry();

  await prisma.$transaction(async (transaction) => {
    // This application permits one active session per administrator. Rotating
    // the session on sign-in also revokes abandoned sessions from another
    // browser or hostname.
    await transaction.adminSession.deleteMany({
      where: {
        userId,
      },
    });

    await transaction.adminSession.create({
      data: {
        userId,
        tokenHash: hashSessionToken(token),
        expiresAt,
      },
    });
  });

  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getCurrentAdmin(): Promise<AuthenticatedAdmin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    select: {
      expiresAt: true,
      user: {
        select: {
          active: true,
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function destroyCurrentAdminSession() {
  const cookieStore = await cookies();
  const tokens = [
    cookieStore.get(sessionCookieName)?.value,
    cookieStore.get(legacySessionCookieName)?.value,
  ].filter((token): token is string => Boolean(token));

  if (tokens.length > 0) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: {
          in: tokens.map(hashSessionToken),
        },
      },
    });
  }

  for (const cookieName of [sessionCookieName, legacySessionCookieName]) {
    cookieStore.set(cookieName, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
}
