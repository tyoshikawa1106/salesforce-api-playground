import { afterEach, describe, expect, it, vi } from "vitest";
import * as loginRoute from "./auth/login/route";
import * as callbackRoute from "./auth/callback/route";
import * as logoutRoute from "./auth/logout/route";
import * as sessionRoute from "./session/route";
import { exchangeCodeForToken, revokeSalesforceSession, salesforceErrorResponse } from "@/lib/salesforce/client";
import { buildAuthorizationUrl } from "@/lib/salesforce/client-core";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import { getConfiguredAppOrigin, getRequestOrigin } from "@/lib/salesforce/urls";
import { NextRequest } from "next/server";
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
  exchangeCodeForToken: vi.fn(),
  revokeSalesforceSession: vi.fn(),
  salesforceErrorResponse: vi.fn((error: unknown) =>
    Response.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    )
  )
}));

vi.mock("@/lib/salesforce/urls", () => ({
  getConfiguredAppOrigin: vi.fn(() => "https://app.example.test"),
  getRequestOrigin: vi.fn(() => "https://app.example.test")
}));

vi.mock("@/lib/salesforce/session", () => ({
  SESSION_COOKIE: "sf_playground_session",
  STATE_COOKIE: "sf_playground_oauth_state",
  clearSessionCookie: vi.fn((response: Response) => {
    response.headers.append(
      "set-cookie",
      "sf_playground_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );
  }),
  clearStateCookie: vi.fn((response: Response) => {
    response.headers.append(
      "set-cookie",
      "sf_playground_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );
  }),
  createOauthState: vi.fn(),
  getSession: vi.fn(),
  setSessionCookie: vi.fn((response: Response) => {
    response.headers.append(
      "set-cookie",
      "sf_playground_session=encrypted-session; Path=/; HttpOnly; SameSite=Lax"
    );
  }),
  setStateCookie: vi.fn((response: Response, state: string) => {
    response.headers.append(
      "set-cookie",
      `sf_playground_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`
    );
  })
}));

const cookiesMock = vi.mocked(cookies);
const exchangeCodeForTokenMock = vi.mocked(exchangeCodeForToken);
const revokeSalesforceSessionMock = vi.mocked(revokeSalesforceSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const buildAuthorizationUrlMock = vi.mocked(buildAuthorizationUrl);
const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);
const getConfiguredAppOriginMock = vi.mocked(getConfiguredAppOrigin);
const getRequestOriginMock = vi.mocked(getRequestOrigin);
const clearSessionCookieMock = vi.mocked(clearSessionCookie);
const clearStateCookieMock = vi.mocked(clearStateCookie);
const createOauthStateMock = vi.mocked(createOauthState);
const getSessionMock = vi.mocked(getSession);
const setSessionCookieMock = vi.mocked(setSessionCookie);
const setStateCookieMock = vi.mocked(setStateCookie);

const config = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "https://app.example.test/api/auth/callback",
  loginUrl: "https://login.example.test",
  apiVersion: "v60.0",
  sessionSecret: "test-session-secret-with-32-chars"
};

const session = {
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  instanceUrl: "https://example.my.salesforce.test",
  issuedAt: 1710000000000,
  userId: "005xx0000012345"
};

function setOauthStateCookie(value?: string) {
  cookiesMock.mockReturnValue({
    get: vi.fn((name: string) => (name === STATE_COOKIE && value ? { value } : undefined))
  } as unknown as ReturnType<typeof cookies>);
}

function setDefaultMocks() {
  getSalesforceConfigMock.mockReturnValue(config);
  createOauthStateMock.mockReturnValue("generated-state");
  getConfiguredAppOriginMock.mockReturnValue("https://app.example.test");
  getRequestOriginMock.mockReturnValue("https://app.example.test");
  setOauthStateCookie("generated-state");
}

function nextRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]): NextRequest {
  return new NextRequest(url, init);
}

async function expectJson(response: Response, expected: unknown) {
  await expect(response.json()).resolves.toEqual(expected);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("Session API route", () => {
  it("returns disconnected when there is no session", async () => {
    getSessionMock.mockReturnValue(null);

    const response = await sessionRoute.GET();

    await expectJson(response, { connected: false });
  });

  it("returns connected session metadata without secrets", async () => {
    getSessionMock.mockReturnValue(session);

    const response = await sessionRoute.GET();
    const body = await response.json();

    expect(body).toEqual({
      connected: true,
      instanceUrl: session.instanceUrl,
      issuedAt: session.issuedAt,
      userId: session.userId
    });
    expect(JSON.stringify(body)).not.toContain(session.accessToken);
    expect(JSON.stringify(body)).not.toContain(session.refreshToken);
    expect(JSON.stringify(body)).not.toContain(config.clientSecret);
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
    expect(buildAuthorizationUrlMock).toHaveBeenCalledWith(config, "generated-state");
    expect(setStateCookieMock).toHaveBeenCalledWith(response, "generated-state");
    expect(authorizeUrl.origin).toBe("https://login.example.test");
    expect(authorizeUrl.searchParams.get("response_type")).toBe("code");
    expect(authorizeUrl.searchParams.get("client_id")).toBe(config.clientId);
    expect(authorizeUrl.searchParams.get("redirect_uri")).toBe(config.redirectUri);
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

    expect(exposed).not.toContain(config.clientSecret);
    expect(exposed).not.toContain(session.accessToken);
    expect(exposed).not.toContain(session.refreshToken);
  });
});

describe("Callback API route", () => {
  it("exchanges a valid code and state, sets the session cookie, and redirects home", async () => {
    setDefaultMocks();
    exchangeCodeForTokenMock.mockResolvedValue(session);
    const request = nextRequest("https://app.example.test/api/auth/callback?code=valid-code&state=generated-state");

    const response = await callbackRoute.GET(request);

    expect(exchangeCodeForTokenMock).toHaveBeenCalledWith("valid-code");
    expect(clearStateCookieMock).toHaveBeenCalledWith(response);
    expect(setSessionCookieMock).toHaveBeenCalledWith(response, session);
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
    getSessionMock.mockReturnValue(session);
    const request = nextRequest("https://app.example.test/api/auth/logout", { method: "POST" });

    const response = await logoutRoute.POST(request);

    expect(revokeSalesforceSessionMock).toHaveBeenCalledWith(session);
    expect(clearSessionCookieMock).toHaveBeenCalledWith(response);
    expect(clearStateCookieMock).toHaveBeenCalledWith(response);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/");
    expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE);
    expect(response.headers.get("set-cookie")).toContain(STATE_COOKIE);
  });

  it("still redirects and clears cookies when there is no session", async () => {
    setDefaultMocks();
    getSessionMock.mockReturnValue(null);
    const request = nextRequest("https://app.example.test/api/auth/logout", { method: "POST" });

    const response = await logoutRoute.POST(request);

    expect(revokeSalesforceSessionMock).not.toHaveBeenCalled();
    expect(clearSessionCookieMock).toHaveBeenCalledWith(response);
    expect(clearStateCookieMock).toHaveBeenCalledWith(response);
    expect(response.headers.get("location")).toBe("https://app.example.test/");
  });

  it("delegates revoke errors to salesforceErrorResponse", async () => {
    setDefaultMocks();
    getSessionMock.mockReturnValue(session);
    const error = new Error("Revoke failed");
    revokeSalesforceSessionMock.mockRejectedValue(error);
    const request = nextRequest("https://app.example.test/api/auth/logout", { method: "POST" });

    const response = await logoutRoute.POST(request);

    expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
    await expectJson(response, { error: "Revoke failed" });
  });
});
