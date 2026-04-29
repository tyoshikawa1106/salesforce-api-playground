import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SalesforceApiError,
  salesforceApiErrorFromResponse,
  salesforceFetch,
  soql
} from "./client";
import { getSalesforceConfig } from "./config";
import { getSession } from "./session";

vi.mock("./config", () => ({
  getSalesforceConfig: vi.fn()
}));

vi.mock("./session", () => ({
  getSession: vi.fn(),
  setSessionCookie: vi.fn()
}));

const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);
const getSessionMock = vi.mocked(getSession);

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

describe("salesforceFetch", () => {
  it("fetches with the current session and reads JSON data", async () => {
    getSalesforceConfigMock.mockReturnValue({
      clientId: "client-id",
      clientSecret: "client-secret",
      loginUrl: "https://login.salesforce.com",
      redirectUri: "https://app.example.test/api/auth/callback",
      apiVersion: "v62.0",
      sessionSecret: "session-secret"
    });
    getSessionMock.mockReturnValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      instanceUrl: "https://example.my.salesforce.com",
      issuedAt: 100
    });
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
    getSalesforceConfigMock.mockReturnValue({
      clientId: "client-id",
      clientSecret: "client-secret",
      loginUrl: "https://login.salesforce.com",
      redirectUri: "https://app.example.test/api/auth/callback",
      apiVersion: "v62.0",
      sessionSecret: "session-secret"
    });
    getSessionMock.mockReturnValue({
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
});
