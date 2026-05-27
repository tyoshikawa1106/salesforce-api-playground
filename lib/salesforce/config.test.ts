import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SALESFORCE_API_VERSION } from "./api-version";
import {
    getSalesforceConfig,
    getSalesforceIntegrationConfig
} from "./config";

const baseEnv = {
    SALESFORCE_CLIENT_ID: "test-client-id",
    SALESFORCE_CLIENT_SECRET: "test-client-secret",
    SALESFORCE_REDIRECT_URI: "https://example.test/auth/callback",
    SESSION_SECRET: "a".repeat(32),
    SALESFORCE_LOGIN_URL: undefined
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
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            sessionSecret: "a".repeat(32)
        });
    });

    it("uses optional Salesforce endpoint overrides", () => {
        setRequiredEnv({
            SALESFORCE_LOGIN_URL: "https://test.salesforce.com"
        });

        expect(getSalesforceConfig()).toMatchObject({
            loginUrl: "https://test.salesforce.com"
        });
    });

    it("ignores Salesforce API version environment variables", () => {
        setRequiredEnv({
            SALESFORCE_API_VERSION: "v1.0"
        });

        expect(getSalesforceConfig()).toMatchObject({
            apiVersion: DEFAULT_SALESFORCE_API_VERSION
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

describe("getSalesforceIntegrationConfig", () => {
    it("returns client credentials settings", () => {
        vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_ID", "integration-client-id");
        vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_SECRET", "integration-client-secret");
        vi.stubEnv("SALESFORCE_INTEGRATION_LOGIN_URL", "https://login.example.test");
        vi.stubEnv("INTEGRATION_API_KEY", "integration-api-key");

        expect(getSalesforceIntegrationConfig()).toEqual({
            clientId: "integration-client-id",
            clientSecret: "integration-client-secret",
            loginUrl: "https://login.example.test",
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            apiKey: "integration-api-key"
        });
    });

    it("does not fall back to the shared Salesforce login URL", () => {
        vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_ID", "integration-client-id");
        vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_SECRET", "integration-client-secret");
        vi.stubEnv("SALESFORCE_LOGIN_URL", "https://test.salesforce.com");
        vi.stubEnv("INTEGRATION_API_KEY", "integration-api-key");

        expect(() => getSalesforceIntegrationConfig()).toThrow(
            "Missing required environment variables: loginUrl"
        );
    });

    it("throws when integration environment variables are missing", () => {
        vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_ID", "integration-client-id");

        expect(() => getSalesforceIntegrationConfig()).toThrow(
            "Missing required environment variables: clientSecret, loginUrl, apiKey"
        );
    });
});
