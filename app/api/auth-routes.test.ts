import { afterEach, describe, expect, it, vi } from "vitest";
import * as loginRoute from "./auth/login/route";
import * as callbackRoute from "./auth/callback/route";
import * as logoutRoute from "./auth/logout/route";
import * as sessionRoute from "./session/route";
import { exchangeCodeForToken, revokeSalesforceSession, salesforceErrorResponse } from "@/lib/salesforce/client";
import { buildAuthorizationUrl } from "@/lib/salesforce/client-core";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import { getConfiguredAppOrigin } from "@/lib/salesforce/urls";
import {
    SESSION_COOKIE,
    STATE_COOKIE,
    clearSessionCookie,
    clearStateCookie,
    createOauthState,
    getSession,
    setSessionCookie,
    setStateCookie
} from "@/lib/salesforce/session";
import { cookies } from "next/headers";
import {
    dummySalesforceConfig,
    dummySalesforceSession,
    expectJson,
    mockOauthStateCookie,
    nextRequest
} from "./test-helpers";

vi.mock("next/headers", () => ({
    cookies: vi.fn()
}));

vi.mock("@/lib/salesforce/config", () => ({
    getSalesforceConfig: vi.fn()
}));

vi.mock("@/lib/salesforce/client-core", () => ({
    buildAuthorizationUrl: vi.fn((config: { clientId: string; redirectUri: string; loginUrl: string }, state: string) => {
        const authorizeUrl = new URL(`${config.loginUrl}/services/oauth2/authorize`);
        authorizeUrl.search = new URLSearchParams({
            response_type: "code",
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: "api refresh_token",
            state
        }).toString();

        return authorizeUrl.toString();
    })
}));

vi.mock("@/lib/salesforce/client", () => ({
    SalesforceApiError: class SalesforceApiError extends Error {
        constructor(
            message: string,
            public status: number,
            public details?: unknown
        ) {
            super(message);
        }
    },
    exchangeCodeForToken: vi.fn(),
    revokeSalesforceSession: vi.fn(),
    salesforceErrorResponse: vi.fn((error: unknown) => {
        const status = typeof error === "object" && error !== null && "status" in error
            ? Number(error.status)
            : 500;

        return Response.json(
            { error: error instanceof Error ? error.message : "Unexpected server error." },
            { status }
        );
    })
}));

vi.mock("@/lib/salesforce/urls", () => ({
    getConfiguredAppOrigin: vi.fn(() => "https://app.example.test")
}));

vi.mock("@/lib/salesforce/session", () => {
    const sessionCookie = "sf_playground_session";
    const stateCookie = "sf_playground_oauth_state";
    const appendCookie = (response: Response, name: string, value: string, maxAge?: number) => {
        const attributes = ["Path=/", "HttpOnly", "SameSite=Lax"];

        if (maxAge !== undefined) {
            attributes.push(`Max-Age=${maxAge}`);
        }

        response.headers.append("set-cookie", `${name}=${value}; ${attributes.join("; ")}`);
    };

    return {
        SESSION_COOKIE: sessionCookie,
        STATE_COOKIE: stateCookie,
        clearSessionCookie: vi.fn((response: Response) => {
            appendCookie(response, sessionCookie, "", 0);
        }),
        clearStateCookie: vi.fn((response: Response) => {
            appendCookie(response, stateCookie, "", 0);
        }),
        createOauthState: vi.fn(),
        getSession: vi.fn(),
        setSessionCookie: vi.fn((response: Response) => {
            appendCookie(response, sessionCookie, "encrypted-session");
        }),
        setStateCookie: vi.fn((response: Response, state: string) => {
            appendCookie(response, stateCookie, state);
        })
    };
});

const cookiesMock = vi.mocked(cookies);
const exchangeCodeForTokenMock = vi.mocked(exchangeCodeForToken);
const revokeSalesforceSessionMock = vi.mocked(revokeSalesforceSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const buildAuthorizationUrlMock = vi.mocked(buildAuthorizationUrl);
const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);
const getConfiguredAppOriginMock = vi.mocked(getConfiguredAppOrigin);
const clearSessionCookieMock = vi.mocked(clearSessionCookie);
const clearStateCookieMock = vi.mocked(clearStateCookie);
const createOauthStateMock = vi.mocked(createOauthState);
const getSessionMock = vi.mocked(getSession);
const setSessionCookieMock = vi.mocked(setSessionCookie);
const setStateCookieMock = vi.mocked(setStateCookie);

function setOauthStateCookie(value?: string) {
    mockOauthStateCookie(cookiesMock, STATE_COOKIE, value);
}

function setDefaultMocks() {
    getSalesforceConfigMock.mockReturnValue(dummySalesforceConfig);
    createOauthStateMock.mockReturnValue("generated-state");
    getConfiguredAppOriginMock.mockReturnValue("https://app.example.test");
    setOauthStateCookie("generated-state");
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("Session API route", () => {
    it("returns disconnected when there is no session", async () => {
        getSessionMock.mockResolvedValue(null);

        const response = await sessionRoute.GET();

        await expectJson(response, { connected: false });
    });

    it("returns connected session metadata without secrets", async () => {
        getSessionMock.mockResolvedValue(dummySalesforceSession);

        const response = await sessionRoute.GET();
        const body = await response.json();

        expect(body).toEqual({
            connected: true,
            instanceUrl: dummySalesforceSession.instanceUrl,
            issuedAt: dummySalesforceSession.issuedAt,
            userId: dummySalesforceSession.userId
        });
        expect(JSON.stringify(body)).not.toContain(dummySalesforceSession.accessToken);
        expect(JSON.stringify(body)).not.toContain(dummySalesforceSession.refreshToken);
        expect(JSON.stringify(body)).not.toContain(dummySalesforceConfig.clientSecret);
    });
});

describe("Login API route", () => {
    it("redirects to the Salesforce authorization URL and stores state in a cookie", async () => {
        setDefaultMocks();

        const response = await loginRoute.GET();
        const location = response.headers.get("location");
        const authorizeUrl = new URL(location ?? "");

        expect(response.status).toBe(307);
        expect(getSalesforceConfigMock).toHaveBeenCalled();
        expect(createOauthStateMock).toHaveBeenCalled();
        expect(buildAuthorizationUrlMock).toHaveBeenCalledWith(dummySalesforceConfig, "generated-state");
        expect(setStateCookieMock).toHaveBeenCalledWith(response, "generated-state");
        expect(authorizeUrl.origin).toBe("https://login.example.test");
        expect(authorizeUrl.searchParams.get("response_type")).toBe("code");
        expect(authorizeUrl.searchParams.get("client_id")).toBe(dummySalesforceConfig.clientId);
        expect(authorizeUrl.searchParams.get("redirect_uri")).toBe(dummySalesforceConfig.redirectUri);
        expect(authorizeUrl.searchParams.get("scope")).toBe("api refresh_token");
        expect(authorizeUrl.searchParams.get("state")).toBe("generated-state");
    });

    it("does not expose client secret or tokens in redirect URL or cookies", async () => {
        setDefaultMocks();

        const response = await loginRoute.GET();
        const exposed = [
            response.headers.get("location"),
            response.headers.get("set-cookie")
        ].join("\n");

        expect(exposed).not.toContain(dummySalesforceConfig.clientSecret);
        expect(exposed).not.toContain(dummySalesforceSession.accessToken);
        expect(exposed).not.toContain(dummySalesforceSession.refreshToken);
    });

    it("returns a safe error response when OAuth startup fails", async () => {
        setDefaultMocks();
        getSalesforceConfigMock.mockImplementation(() => {
            throw new Error("Missing Salesforce configuration");
        });

        const response = await loginRoute.GET();

        expect(response.status).toBe(500);
        await expectJson(response, { error: "Missing Salesforce configuration" });
        expect(setStateCookieMock).not.toHaveBeenCalled();
    });
});

describe("Callback API route", () => {
    it("exchanges a valid code and state, sets the session cookie, and redirects home", async () => {
        setDefaultMocks();
        exchangeCodeForTokenMock.mockResolvedValue(dummySalesforceSession);
        const request = nextRequest("https://app.example.test/api/auth/callback?code=valid-code&state=generated-state");

        const response = await callbackRoute.GET(request);

        expect(exchangeCodeForTokenMock).toHaveBeenCalledWith("valid-code");
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        expect(setSessionCookieMock).toHaveBeenCalledWith(response, dummySalesforceSession);
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("https://app.example.test/?auth=connected");
        expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE);
    });

    it("does not exchange the code when saved state and query state do not match", async () => {
        setDefaultMocks();
        setOauthStateCookie("saved-state");
        const request = nextRequest("https://app.example.test/api/auth/callback?code=valid-code&state=query-state");

        const response = await callbackRoute.GET(request);

        expect(exchangeCodeForTokenMock).not.toHaveBeenCalled();
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        expect(response.headers.get("location")).toBe("https://app.example.test/?auth=state_error");
    });

    it("does not exchange a token when code is missing", async () => {
        setDefaultMocks();
        const request = nextRequest("https://app.example.test/api/auth/callback?state=generated-state");

        const response = await callbackRoute.GET(request);

        expect(exchangeCodeForTokenMock).not.toHaveBeenCalled();
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        expect(response.headers.get("location")).toBe("https://app.example.test/?auth=state_error");
    });

    it("delegates token exchange errors to salesforceErrorResponse", async () => {
        setDefaultMocks();
        const error = new Error("Token exchange failed");
        exchangeCodeForTokenMock.mockRejectedValue(error);
        const request = nextRequest("https://app.example.test/api/auth/callback?code=valid-code&state=generated-state");

        const response = await callbackRoute.GET(request);

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Token exchange failed" });
    });
});

describe("Logout API route", () => {
    it("revokes the current session, clears cookies, and redirects home", async () => {
        setDefaultMocks();
        getSessionMock.mockResolvedValue(dummySalesforceSession);
        const request = nextRequest("https://app.example.test/api/auth/logout", {
            method: "POST",
            headers: {
                origin: "https://app.example.test"
            }
        });

        const response = await logoutRoute.POST(request);

        expect(revokeSalesforceSessionMock).toHaveBeenCalledWith(dummySalesforceSession);
        expect(clearSessionCookieMock).toHaveBeenCalledWith(response);
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("https://app.example.test/");
        expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE);
        expect(response.headers.get("set-cookie")).toContain(STATE_COOKIE);
    });

    it("still redirects and clears cookies when there is no session", async () => {
        setDefaultMocks();
        getSessionMock.mockResolvedValue(null);
        const request = nextRequest("https://app.example.test/api/auth/logout", {
            method: "POST",
            headers: {
                origin: "https://app.example.test"
            }
        });

        const response = await logoutRoute.POST(request);

        expect(revokeSalesforceSessionMock).not.toHaveBeenCalled();
        expect(clearSessionCookieMock).toHaveBeenCalledWith(response);
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        expect(response.headers.get("location")).toBe("https://app.example.test/");
    });

    it("clears cookies and redirects home even when revoke fails", async () => {
        setDefaultMocks();
        getSessionMock.mockResolvedValue(dummySalesforceSession);
        const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const error = new Error("Revoke failed");
        revokeSalesforceSessionMock.mockRejectedValue(error);
        const request = nextRequest("https://app.example.test/api/auth/logout", {
            method: "POST",
            headers: {
                origin: "https://app.example.test"
            }
        });

        const response = await logoutRoute.POST(request);

        expect(consoleErrorMock).toHaveBeenCalledWith(
            "Salesforce token revocation failed during logout.",
            {
                name: "Error",
                message: "Revoke failed",
                status: undefined,
                details: undefined,
                cause: undefined
            }
        );
        expect(salesforceErrorResponseMock).not.toHaveBeenCalled();
        expect(clearSessionCookieMock).toHaveBeenCalledWith(response);
        expect(clearStateCookieMock).toHaveBeenCalledWith(response);
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("https://app.example.test/");
        consoleErrorMock.mockRestore();
    });

    it("rejects logout requests from another origin before reading the session", async () => {
        setDefaultMocks();
        const request = nextRequest("https://app.example.test/api/auth/logout", {
            method: "POST",
            headers: {
                origin: "https://evil.example.test"
            }
        });

        const response = await logoutRoute.POST(request);

        expect(getSessionMock).not.toHaveBeenCalled();
        expect(revokeSalesforceSessionMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });
});
