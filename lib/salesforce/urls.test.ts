import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getSalesforceConfig } from "./config";
import { getConfiguredAppOrigin, getRequestOrigin } from "./urls";

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
            apiVersion: "v62.0",
            sessionSecret: "session-secret"
        });

        expect(getConfiguredAppOrigin()).toBe("https://app.example.test");
    });
});

describe("getRequestOrigin", () => {
    it("prefers forwarded host and proto behind a reverse proxy", () => {
        const request = new NextRequest("http://internal.example.test/api/auth/logout", {
            headers: {
                "x-forwarded-host": "playground.example.test",
                "x-forwarded-proto": "https"
            }
        });

        expect(getRequestOrigin(request)).toBe("https://playground.example.test");
    });

    it("defaults forwarded host requests to https when forwarded proto is missing", () => {
        const request = new NextRequest("http://internal.example.test/api/auth/logout", {
            headers: {
                "x-forwarded-host": "playground.example.test"
            }
        });

        expect(getRequestOrigin(request)).toBe("https://playground.example.test");
    });

    it("uses the request URL origin when no forwarded headers are present", () => {
        const request = new NextRequest("http://localhost:3000/api/auth/logout");

        expect(getRequestOrigin(request)).toBe("http://localhost:3000");
    });
});
