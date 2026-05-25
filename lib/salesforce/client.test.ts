import { afterEach, describe, expect, it, vi } from "vitest";
import {
    SalesforceApiError,
    exchangeCodeForToken,
    jsonWithSession,
    revokeSalesforceSession,
    salesforceApiErrorFromResponse,
    salesforceErrorResponse,
    salesforceFetch,
    soql
} from "./client";
import { getSalesforceConfig } from "./config";
import { getSession, setSessionCookie } from "./session";

vi.mock("./config", () => ({
    getSalesforceConfig: vi.fn()
}));

vi.mock("./session", () => ({
    getSession: vi.fn(),
    setSessionCookie: vi.fn()
}));

const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);
const getSessionMock = vi.mocked(getSession);
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

describe("soql", () => {
    it("combines template parts without calling Salesforce", () => {
        const objectName = "Account";
        const limit = "10";

        expect(soql`SELECT Id, Name FROM ${objectName} LIMIT ${limit}`).toBe(
            "SELECT Id, Name FROM Account LIMIT 10"
        );
    });
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

describe("salesforceFetch", () => {
    it("fetches with the current session and reads JSON data", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        getSessionMock.mockResolvedValue(salesforceSession);
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(Response.json({ records: [{ Id: "001xx000003DGbY" }] }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(salesforceFetch("/query?q=SELECT+Id+FROM+Account")).resolves.toEqual({
            data: { records: [{ Id: "001xx000003DGbY" }] },
            session: {
                accessToken: "access-token",
                refreshToken: "refresh-token",
                instanceUrl: "https://example.my.salesforce.com",
                issuedAt: 100
            }
        });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://example.my.salesforce.com/services/data/v62.0/query?q=SELECT+Id+FROM+Account",
            {
                headers: {
                    authorization: "Bearer access-token",
                    "content-type": "application/json"
                },
                cache: "no-store"
            }
        );
    });

    it("refreshes the access token and retries once when Salesforce returns 401", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        getSessionMock.mockResolvedValue({
            accessToken: "expired-token",
            refreshToken: "refresh-token",
            instanceUrl: "https://old.example.my.salesforce.com",
            issuedAt: 100,
            userId: "005xx0000012345"
        });
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(new Response("", { status: 401, statusText: "Unauthorized" }))
            .mockResolvedValueOnce(
                Response.json({
                    access_token: "refreshed-token",
                    instance_url: "https://new.example.my.salesforce.com",
                    issued_at: "200"
                })
            )
            .mockResolvedValueOnce(Response.json({ id: "001xx000003DGbY" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(salesforceFetch("/sobjects/Account/001xx000003DGbY")).resolves.toEqual({
            data: { id: "001xx000003DGbY" },
            session: {
                accessToken: "refreshed-token",
                refreshToken: "refresh-token",
                instanceUrl: "https://new.example.my.salesforce.com",
                issuedAt: 200,
                userId: "005xx0000012345"
            }
        });
        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "https://old.example.my.salesforce.com/services/data/v62.0/sobjects/Account/001xx000003DGbY",
            {
                headers: {
                    authorization: "Bearer expired-token",
                    "content-type": "application/json"
                },
                cache: "no-store"
            }
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            "https://login.salesforce.com/services/oauth2/token",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                cache: "no-store"
            })
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            "https://new.example.my.salesforce.com/services/data/v62.0/sobjects/Account/001xx000003DGbY",
            {
                headers: {
                    authorization: "Bearer refreshed-token",
                    "content-type": "application/json"
                },
                cache: "no-store"
            }
        );
    });

    it("fails before calling Salesforce when there is no session", async () => {
        getSessionMock.mockResolvedValue(null);
        const fetchMock = vi.fn<typeof fetch>();
        vi.stubGlobal("fetch", fetchMock);

        await expect(salesforceFetch("/query?q=SELECT+Id+FROM+Account")).rejects.toMatchObject({
            message: "Not connected to Salesforce.",
            status: 401
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not retry a 401 when the session has no refresh token", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        getSessionMock.mockResolvedValue({
            accessToken: "expired-token",
            instanceUrl: "https://example.my.salesforce.com",
            issuedAt: 100
        });
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(new Response("", { status: 401, statusText: "Unauthorized" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(salesforceFetch("/query?q=SELECT+Id+FROM+Account")).rejects.toMatchObject({
            message: "Salesforce session expired. Please connect again.",
            status: 401
        });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("returns the refresh failure when access token refresh is rejected", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        getSessionMock.mockResolvedValue({
            ...salesforceSession,
            accessToken: "expired-token"
        });
        const refreshError = [{ message: "expired refresh token", errorCode: "invalid_grant" }];
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(new Response("", { status: 401, statusText: "Unauthorized" }))
            .mockResolvedValueOnce(Response.json(refreshError, { status: 400, statusText: "Bad Request" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(salesforceFetch("/sobjects/Account/001xx000003DGbY")).rejects.toMatchObject({
            message: "expired refresh token",
            status: 400,
            details: refreshError
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("returns the retried Salesforce error after a successful refresh", async () => {
        getSalesforceConfigMock.mockReturnValue(salesforceConfig);
        getSessionMock.mockResolvedValue({
            ...salesforceSession,
            accessToken: "expired-token"
        });
        const salesforceError = [{ message: "record is not accessible", errorCode: "INSUFFICIENT_ACCESS" }];
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(new Response("", { status: 401, statusText: "Unauthorized" }))
            .mockResolvedValueOnce(
                Response.json({
                    access_token: "refreshed-token",
                    instance_url: "https://example.my.salesforce.com",
                    issued_at: "200"
                })
            )
            .mockResolvedValueOnce(Response.json(salesforceError, { status: 403, statusText: "Forbidden" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(salesforceFetch("/sobjects/Account/001xx000003DGbY")).rejects.toMatchObject({
            message: "record is not accessible",
            status: 403,
            details: salesforceError
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
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
});
