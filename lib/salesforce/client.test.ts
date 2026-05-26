import { afterEach, describe, expect, it, vi } from "vitest";
import {
    SalesforceApiError,
    exchangeCodeForToken,
    jsonWithSession,
    refreshAccessToken,
    revokeSalesforceSession,
    salesforceApiErrorFromResponse,
    salesforceErrorResponse
} from "./client";
import { getSalesforceConfig } from "./config";
import {
    clearSessionCookie,
    clearStateCookie,
    setSessionCookie
} from "./session";

vi.mock("./config", () => ({
    getSalesforceConfig: vi.fn()
}));

vi.mock("./session", () => ({
    clearSessionCookie: vi.fn(),
    clearStateCookie: vi.fn(),
    setSessionCookie: vi.fn()
}));

const clearSessionCookieMock = vi.mocked(clearSessionCookie);
const clearStateCookieMock = vi.mocked(clearStateCookie);
const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);
const setSessionCookieMock = vi.mocked(setSessionCookie);

const salesforceConfig = {
    clientId: "client-id",
    clientSecret: "client-secret",
    loginUrl: "https://login.salesforce.com",
    redirectUri: "https://app.example.test/api/auth/callback",
    apiVersion: "v62.0",
    sessionSecret: "session-secret"
};

const salesforceSession = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    instanceUrl: "https://example.my.salesforce.com",
    issuedAt: 100
};

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("SalesforceApiError", () => {
    it("keeps status and details for API error responses", () => {
        const details = [{ message: "bad request", errorCode: "INVALID_FIELD" }];
        const error = new SalesforceApiError("Salesforce API request failed.", 400, details);

        expect(error.message).toBe("Salesforce API request failed.");
        expect(error.status).toBe(400);
        expect(error.details).toBe(details);
    });
});

describe("salesforceApiErrorFromResponse", () => {
    it("builds an API error from a Salesforce error payload", async () => {
        const details = [
            { message: "First error", errorCode: "INVALID_FIELD" },
            { message: "Second error", errorCode: "REQUIRED_FIELD_MISSING" }
        ];
        const response = Response.json(details, {
            status: 400,
            statusText: "Bad Request"
        });

        await expect(salesforceApiErrorFromResponse(response)).resolves.toMatchObject({
            message: "First error Second error",
            status: 400,
            details
        });
    });

    it("falls back to a generic message when the response has no message or status text", async () => {
        const response = new Response("", { status: 500 });

        await expect(salesforceApiErrorFromResponse(response)).resolves.toMatchObject({
            message: "Salesforce API request failed.",
            status: 500,
            details: ""
        });
    });
});

describe("exchangeCodeForToken", () => {
    it("exchanges an OAuth code for a session without exposing the client secret in the URL", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            Response.json({
                access_token: "access-token",
                refresh_token: "refresh-token",
                instance_url: "https://example.my.salesforce.com",
                issued_at: "200",
                id: "https://login.salesforce.com/id/00Dxx0000000001/005xx0000012345"
            })
        );
        vi.stubGlobal("fetch", fetchMock);

        await expect(exchangeCodeForToken("oauth-code")).resolves.toEqual({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            instanceUrl: "https://example.my.salesforce.com",
            issuedAt: 200,
            userId: "005xx0000012345"
        });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://login.salesforce.com/services/oauth2/token",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                cache: "no-store"
            })
        );
        expect(fetchMock.mock.calls[0]?.[0]).not.toContain(salesforceConfig.clientSecret);
    });

    it("returns Salesforce OAuth errors when code exchange fails", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        const details = { error: "invalid_grant", error_description: "authentication failure" };
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(Response.json(details, { status: 400, statusText: "Bad Request" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(exchangeCodeForToken("oauth-code")).rejects.toMatchObject({
            message: "Bad Request",
            status: 400,
            details
        });
    });
});

describe("revokeSalesforceSession", () => {
    it("revokes the refresh token for a connected session", async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response("", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(revokeSalesforceSession(salesforceSession)).resolves.toBeUndefined();

        expect(fetchMock).toHaveBeenCalledWith(
            "https://example.my.salesforce.com/services/oauth2/revoke",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                cache: "no-store"
            })
        );
    });

    it("returns Salesforce revoke errors", async () => {
        const details = { error: "invalid_token", error_description: "token is already revoked" };
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(Response.json(details, { status: 400, statusText: "Bad Request" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(revokeSalesforceSession(salesforceSession)).rejects.toMatchObject({
            message: "Bad Request",
            status: 400,
            details
        });
    });
});

describe("refreshAccessToken", () => {
    it("refreshes the access token and preserves the existing session context", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            Response.json({
                access_token: "refreshed-token",
                instance_url: "https://new.example.my.salesforce.com",
                issued_at: "200"
            })
        );
        vi.stubGlobal("fetch", fetchMock);

        await expect(refreshAccessToken(salesforceSession)).resolves.toEqual({
            accessToken: "refreshed-token",
            refreshToken: "refresh-token",
            instanceUrl: "https://new.example.my.salesforce.com",
            issuedAt: 200
        });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://login.salesforce.com/services/oauth2/token",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                cache: "no-store"
            })
        );
    });

    it("fails before calling Salesforce when the session has no refresh token", async () => {
        const fetchMock = vi.fn<typeof fetch>();
        vi.stubGlobal("fetch", fetchMock);

        await expect(
            refreshAccessToken({
                accessToken: "access-token",
                instanceUrl: "https://example.my.salesforce.com",
                issuedAt: 100
            })
        ).rejects.toMatchObject({
            message: "Salesforce session expired. Please connect again.",
            status: 401
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns Salesforce refresh errors", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        const details = [{ message: "expired refresh token", errorCode: "invalid_grant" }];
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(Response.json(details, { status: 400, statusText: "Bad Request" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(refreshAccessToken(salesforceSession)).rejects.toMatchObject({
            message: "expired refresh token",
            status: 400,
            details
        });
    });
});

describe("jsonWithSession", () => {
    it("returns JSON with the requested status and refreshes the session cookie", async () => {
        const response = jsonWithSession({ ok: true }, salesforceSession, 201);

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(setSessionCookieMock).toHaveBeenCalledWith(response, salesforceSession);
    });
});

describe("salesforceErrorResponse", () => {
    it("serializes Salesforce API errors with details and status", async () => {
        const details = [{ message: "bad request", errorCode: "INVALID_FIELD" }];
        const response = salesforceErrorResponse(new SalesforceApiError("bad request", 400, details));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "bad request",
            details
        });
    });

    it("serializes unexpected errors without Salesforce details", async () => {
        const response = salesforceErrorResponse(new Error("Unexpected failure"));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "Unexpected failure"
        });
    });

    it("clears cookies and normalizes expired sessions to a reconnect response", async () => {
        const details = [{ message: "expired access/refresh token", errorCode: "invalid_grant" }];
        const response = salesforceErrorResponse(
            new SalesforceApiError("Unable to refresh session due to: expired access/refresh token", 400, details)
        );

        expect(response.status).toBe(401);
        expect(clearSessionCookieMock).toHaveBeenCalledWith(response);
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        await expect(response.json()).resolves.toEqual({
            error: "Salesforce session expired. Please connect again.",
            details
        });
    });
});
