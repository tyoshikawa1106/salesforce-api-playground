import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SALESFORCE_API_VERSION } from "./api-version";
import { getSalesforceConfig } from "./config";
import { getConfiguredAppOrigin } from "./urls";

vi.mock("./config", () => ({
    getSalesforceConfig: vi.fn()
}));

const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);

afterEach(() => {
    vi.clearAllMocks();
});

describe("getConfiguredAppOrigin", () => {
    it("uses the configured redirect URI origin without exposing the callback path", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "https://app.example.test/api/auth/callback",
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            sessionSecret: "session-secret"
        });

        expect(getConfiguredAppOrigin()).toBe("https://app.example.test");
    });
});
