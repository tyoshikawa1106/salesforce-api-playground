import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    INTEGRATION_API_KEY_HEADER,
    assertIntegrationApiKey
} from "./integration-security";
import { getSalesforceIntegrationConfig } from "./config";

vi.mock("./config", () => ({
    getSalesforceIntegrationConfig: vi.fn()
}));

const getSalesforceIntegrationConfigMock = vi.mocked(getSalesforceIntegrationConfig);

function requestWithApiKey(apiKey?: string): Pick<Request, "headers"> {
    const headers = new Headers();

    if (apiKey !== undefined) {
        headers.set(INTEGRATION_API_KEY_HEADER, apiKey);
    }

    return { headers };
}

beforeEach(() => {
    getSalesforceIntegrationConfigMock.mockReturnValue({
        clientId: "integration-client-id",
        clientSecret: "integration-client-secret",
        loginUrl: "https://login.example.test",
        apiVersion: "v64.0",
        apiKey: "test-integration-api-key"
    });
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("assertIntegrationApiKey", () => {
    it("accepts the configured integration API key", () => {
        expect(() =>
            assertIntegrationApiKey(requestWithApiKey("test-integration-api-key"))
        ).not.toThrow();
    });

    it("rejects a missing integration API key", () => {
        expect(() => assertIntegrationApiKey(requestWithApiKey())).toThrow(
            "Invalid integration API key."
        );
    });

    it("rejects an incorrect integration API key with the existing error message", () => {
        expect(() => assertIntegrationApiKey(requestWithApiKey("wrong-key"))).toThrow(
            "Invalid integration API key."
        );
    });

    it("rejects an integration API key with a different length", () => {
        expect(() =>
            assertIntegrationApiKey(requestWithApiKey("test-integration-api-key-extra"))
        ).toThrow("Invalid integration API key.");
    });
});
