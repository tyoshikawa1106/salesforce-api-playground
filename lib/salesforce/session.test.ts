import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SalesforceSession,
  createOauthState,
  decryptSession,
  encryptSession
} from "./session";

const sessionSecret = "test-session-secret-with-32-chars";

function setSessionSecret() {
  vi.stubEnv("SALESFORCE_CLIENT_ID", "test-client-id");
  vi.stubEnv("SALESFORCE_CLIENT_SECRET", "test-client-secret");
  vi.stubEnv("SALESFORCE_REDIRECT_URI", "https://example.test/auth/callback");
  vi.stubEnv("SESSION_SECRET", sessionSecret);
  vi.stubEnv("SALESFORCE_LOGIN_URL", undefined);
  vi.stubEnv("SALESFORCE_API_VERSION", undefined);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("session encryption", () => {
  const session: SalesforceSession = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    instanceUrl: "https://example.my.salesforce.com",
    issuedAt: 1710000000000,
    userId: "user-id",
    organizationId: "org-id"
  };

  it("round-trips an encrypted session", () => {
    setSessionSecret();

    const encrypted = encryptSession(session);

    expect(encrypted).not.toContain(session.accessToken);
    expect(decryptSession(encrypted)).toEqual(session);
  });

  it("returns null for invalid encrypted values", () => {
    setSessionSecret();

    expect(decryptSession("not-a-session")).toBeNull();
  });
});

describe("createOauthState", () => {
  it("creates a base64url-safe random state", () => {
    const state = createOauthState();

    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(state).toHaveLength(32);
  });
});
