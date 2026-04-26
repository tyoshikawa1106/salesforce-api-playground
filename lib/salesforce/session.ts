import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSalesforceConfig } from "./config";

export const SESSION_COOKIE = "sf_playground_session";
export const STATE_COOKIE = "sf_playground_oauth_state";

export type SalesforceSession = {
  accessToken: string;
  refreshToken?: string;
  instanceUrl: string;
  issuedAt: number;
  userId?: string;
  organizationId?: string;
};

const algorithm = "aes-256-gcm";

function getKey(): Buffer {
  const { sessionSecret } = getSalesforceConfig();
  return crypto.createHash("sha256").update(sessionSecret).digest();
}

export function encryptSession(session: SalesforceSession): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSession(value: string): SalesforceSession | null {
  try {
    const input = Buffer.from(value, "base64url");
    const iv = input.subarray(0, 12);
    const tag = input.subarray(12, 28);
    const encrypted = input.subarray(28);
    const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as SalesforceSession;
  } catch {
    return null;
  }
}

export function getSession(): SalesforceSession | null {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  return raw ? decryptSession(raw) : null;
}

export function setSessionCookie(response: NextResponse, session: SalesforceSession): void {
  response.cookies.set(SESSION_COOKIE, encryptSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function createOauthState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function setStateCookie(response: NextResponse, state: string): void {
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });
}

export function clearStateCookie(response: NextResponse): void {
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
