import { afterEach, describe, expect, it, vi } from "vitest";
import { getSalesforceConfig } from "./config";

const baseEnv = {
  SALESFORCE_CLIENT_ID: "test-client-id",
  SALESFORCE_CLIENT_SECRET: "test-client-secret",
  SALESFORCE_REDIRECT_URI: "https://example.test/auth/callback",
  SESSION_SECRET: "a".repeat(32),
  SALESFORCE_LOGIN_URL: undefined,
  SALESFORCE_API_VERSION: undefined
};

function setRequiredEnv(overrides: Record<string, string | undefined> = {}) {
  for (const [key, value] of Object.entries({ ...baseEnv, ...overrides })) {
    vi.stubEnv(key, value);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSalesforceConfig", () => {
  it("returns configured values with safe defaults", () => {
    setRequiredEnv();

    expect(getSalesforceConfig()).toEqual({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      redirectUri: "https://example.test/auth/callback",
      loginUrl: "https://login.salesforce.com",
      apiVersion: "v60.0",
      sessionSecret: "a".repeat(32)
    });
  });

  it("uses optional Salesforce endpoint overrides", () => {
    setRequiredEnv({
      SALESFORCE_LOGIN_URL: "https://test.salesforce.com",
      SALESFORCE_API_VERSION: "v61.0"
    });

    expect(getSalesforceConfig()).toMatchObject({
      loginUrl: "https://test.salesforce.com",
      apiVersion: "v61.0"
    });
  });

  it("throws when required environment variables are missing", () => {
    setRequiredEnv({
      SALESFORCE_CLIENT_SECRET: undefined,
      SALESFORCE_REDIRECT_URI: undefined
    });

    expect(() => getSalesforceConfig()).toThrow(
      "Missing required environment variables: clientSecret, redirectUri"
    );
  });

  it("throws when the session secret is too short", () => {
    setRequiredEnv({ SESSION_SECRET: "too-short" });

    expect(() => getSalesforceConfig()).toThrow(
      "SESSION_SECRET must be at least 32 characters."
    );
  });
});
