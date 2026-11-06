import { cookies } from "next/headers";

export const LAFTEL_ACCOUNT_COOKIE = "laftel_account_token";
export const LAFTEL_PROFILE_COOKIE = "laftel_profile_session";

const LEGACY_TOKEN_COOKIE = "laftel_random_challenge_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type CookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export type ProfileSession = {
  token: string;
  userId: number;
};

export async function getAccountToken() {
  const cookieStore = await cookies();

  return cookieStore.get(LAFTEL_ACCOUNT_COOKIE)?.value ?? null;
}

export async function setAccountToken(token: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: LAFTEL_ACCOUNT_COOKIE,
    value: token,
    ...cookieOptions(),
  });
}

export async function clearAccountToken() {
  const cookieStore = await cookies();

  cookieStore.delete(LAFTEL_ACCOUNT_COOKIE);
}

export async function getProfileSession(): Promise<ProfileSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LAFTEL_PROFILE_COOKIE)?.value;

  if (!value) return null;

  const separator = value.lastIndexOf(":");
  if (separator <= 0) return null;

  const token = value.slice(0, separator);
  const userId = Number(value.slice(separator + 1));

  if (!token || !Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return { token, userId };
}

export async function setProfileSession(token: string, userId: number) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: LAFTEL_PROFILE_COOKIE,
    value: `${token}:${userId}`,
    ...cookieOptions(),
  });
}

export async function clearProfileSession() {
  const cookieStore = await cookies();

  cookieStore.delete(LAFTEL_PROFILE_COOKIE);
}

export async function clearAllSessions() {
  const cookieStore = await cookies();

  cookieStore.delete(LAFTEL_ACCOUNT_COOKIE);
  cookieStore.delete(LAFTEL_PROFILE_COOKIE);
  cookieStore.delete(LEGACY_TOKEN_COOKIE);
}
