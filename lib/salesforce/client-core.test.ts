import { describe, expect, it } from "vitest";
import {
  buildAuthenticatedSalesforceRequestInit,
  buildAuthorizationCodeTokenEndpointUrl,
  buildAuthorizationCodeTokenParams,
  buildAuthorizationEndpointUrl,
  buildAuthorizationUrl,
  buildAuthorizationUrlParams,
  buildRefreshTokenEndpointUrl,
  buildRefreshTokenParams,
  buildSalesforceApiUrl,
  buildTokenRequestInit,
  extractSalesforceErrorMessage,
  readSalesforceErrorDetails,
  readSalesforceResponseData,
  tokenResponseToRefreshedSession,
  tokenResponseToSession
} from "./client-core";
import type { SalesforceSession } from "./session";

const salesforceConfig = {
  clientId: "client-id",
  clientSecret: "client-secret",
  loginUrl: "https://login.salesforce.com",
  redirectUri: "https://app.example.test/api/auth/callback",
  apiVersion: "v62.0",
  sessionSecret: "session-secret"
};

describe("buildAuthorizationEndpointUrl", () => {
  it("builds the OAuth authorization endpoint URL", () => {
    expect(buildAuthorizationEndpointUrl(salesforceConfig)).toBe(
      "https://login.salesforce.com/services/oauth2/authorize"
    );
  });
});

describe("buildAuthorizationUrlParams", () => {
  it("builds query params for starting the OAuth authorization flow", () => {
    const params = buildAuthorizationUrlParams(salesforceConfig, "oauth-state");

    expect(Object.fromEntries(params)).toEqual({
      response_type: "code",
      client_id: "client-id",
      redirect_uri: "https://app.example.test/api/auth/callback",
      scope: "api refresh_token",
      state: "oauth-state"
    });
    expect(params.toString()).toBe(
      "response_type=code&client_id=client-id&redirect_uri=https%3A%2F%2Fapp.example.test%2Fapi%2Fauth%2Fcallback&scope=api+refresh_token&state=oauth-state"
    );
  });
});

describe("buildAuthorizationUrl", () => {
  it("builds the final OAuth authorization URL", () => {
    expect(buildAuthorizationUrl(salesforceConfig, "oauth-state")).toBe(
      "https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=client-id&redirect_uri=https%3A%2F%2Fapp.example.test%2Fapi%2Fauth%2Fcallback&scope=api+refresh_token&state=oauth-state"
    );
  });
});

describe("buildAuthorizationCodeTokenEndpointUrl", () => {
  it("builds the token endpoint URL for authorization code exchange", () => {
    expect(buildAuthorizationCodeTokenEndpointUrl(salesforceConfig)).toBe(
      "https://login.salesforce.com/services/oauth2/token"
    );
  });
});

describe("buildAuthorizationCodeTokenParams", () => {
  it("builds form params for authorization code exchange", () => {
    const params = buildAuthorizationCodeTokenParams(salesforceConfig, "auth-code");

    expect(Object.fromEntries(params)).toEqual({
      grant_type: "authorization_code",
      code: "auth-code",
      client_id: "client-id",
      client_secret: "client-secret",
      redirect_uri: "https://app.example.test/api/auth/callback"
    });
    expect(params.toString()).toBe(
      "grant_type=authorization_code&code=auth-code&client_id=client-id&client_secret=client-secret&redirect_uri=https%3A%2F%2Fapp.example.test%2Fapi%2Fauth%2Fcallback"
    );
  });
});

describe("buildRefreshTokenEndpointUrl", () => {
  it("builds the token endpoint URL for refresh token requests", () => {
    expect(buildRefreshTokenEndpointUrl(salesforceConfig)).toBe(
      "https://login.salesforce.com/services/oauth2/token"
    );
  });
});

describe("buildRefreshTokenParams", () => {
  it("builds form params for refresh token requests", () => {
    const params = buildRefreshTokenParams(salesforceConfig, "refresh-token");

    expect(Object.fromEntries(params)).toEqual({
      grant_type: "refresh_token",
      refresh_token: "refresh-token",
      client_id: "client-id",
      client_secret: "client-secret"
    });
    expect(params.toString()).toBe(
      "grant_type=refresh_token&refresh_token=refresh-token&client_id=client-id&client_secret=client-secret"
    );
  });
});

describe("buildTokenRequestInit", () => {
  it("builds a form-encoded POST request init without caching", () => {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: "refresh-token"
    });

    expect(buildTokenRequestInit(params)).toEqual({
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=refresh_token&refresh_token=refresh-token",
      cache: "no-store"
    });
  });
});

describe("buildAuthenticatedSalesforceRequestInit", () => {
  it("adds Salesforce auth headers and disables caching", () => {
    expect(
      buildAuthenticatedSalesforceRequestInit(
        { accessToken: "access-token" },
        {
          method: "PATCH",
          body: JSON.stringify({ Name: "Acme" })
        }
      )
    ).toEqual({
      method: "PATCH",
      body: JSON.stringify({ Name: "Acme" }),
      headers: {
        authorization: "Bearer access-token",
        "content-type": "application/json"
      },
      cache: "no-store"
    });
  });

  it("keeps the existing header override order", () => {
    expect(
      buildAuthenticatedSalesforceRequestInit(
        { accessToken: "access-token" },
        {
          headers: {
            authorization: "Bearer caller-token",
            "content-type": "application/merge-patch+json",
            "if-match": "etag"
          },
          cache: "reload"
        }
      )
    ).toMatchObject({
      headers: {
        authorization: "Bearer caller-token",
        "content-type": "application/merge-patch+json",
        "if-match": "etag"
      },
      cache: "no-store"
    });
  });
});

describe("buildSalesforceApiUrl", () => {
  it("builds a Salesforce REST API URL from session, version, and path", () => {
    expect(
      buildSalesforceApiUrl(
        { instanceUrl: "https://example.my.salesforce.com" },
        "v62.0",
        "/query?q=SELECT+Id+FROM+Account"
      )
    ).toBe(
      "https://example.my.salesforce.com/services/data/v62.0/query?q=SELECT+Id+FROM+Account"
    );
  });
});

describe("extractSalesforceErrorMessage", () => {
  it("joins messages from Salesforce error payload arrays", () => {
    expect(
      extractSalesforceErrorMessage(
        [
          { message: "First error", errorCode: "INVALID_FIELD" },
          { message: "Second error", errorCode: "REQUIRED_FIELD_MISSING" }
        ],
        "Bad Request"
      )
    ).toBe("First error Second error");
  });

  it("falls back to the HTTP status text for non-array details", () => {
    expect(extractSalesforceErrorMessage("not json", "Internal Server Error")).toBe(
      "Internal Server Error"
    );
  });
});

describe("readSalesforceErrorDetails", () => {
  it("reads JSON error details when the response body is JSON", async () => {
    const response = Response.json(
      [{ message: "Invalid field", errorCode: "INVALID_FIELD" }],
      { status: 400, statusText: "Bad Request" }
    );

    await expect(readSalesforceErrorDetails(response)).resolves.toEqual([
      { message: "Invalid field", errorCode: "INVALID_FIELD" }
    ]);
  });

  it("falls back to text when the response body is not JSON", async () => {
    const response = new Response("service unavailable", {
      status: 503,
      statusText: "Service Unavailable"
    });

    await expect(readSalesforceErrorDetails(response)).resolves.toBe("service unavailable");
  });
});

describe("readSalesforceResponseData", () => {
  it("returns an empty object for 204 responses", async () => {
    const response = new Response(null, { status: 204 });

    await expect(readSalesforceResponseData(response)).resolves.toEqual({});
  });

  it("reads JSON data for non-204 responses", async () => {
    const response = Response.json({ id: "001xx000003DGbY" });

    await expect(readSalesforceResponseData(response)).resolves.toEqual({
      id: "001xx000003DGbY"
    });
  });
});

describe("tokenResponseToSession", () => {
  it("maps an OAuth token response to a session", () => {
    expect(
      tokenResponseToSession(
        {
          access_token: "access-token",
          refresh_token: "refresh-token",
          instance_url: "https://example.my.salesforce.com",
          id: "https://login.salesforce.com/id/00Dxx0000000001/005xx0000012345",
          issued_at: "1714350000000"
        },
        123
      )
    ).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      instanceUrl: "https://example.my.salesforce.com",
      issuedAt: 1714350000000,
      userId: "005xx0000012345"
    });
  });

  it("uses a fallback issuedAt when the token response does not include one", () => {
    expect(
      tokenResponseToSession(
        {
          access_token: "access-token",
          instance_url: "https://example.my.salesforce.com"
        },
        456
      )
    ).toMatchObject({
      issuedAt: 456,
      userId: undefined
    });
  });
});

describe("tokenResponseToRefreshedSession", () => {
  it("updates token fields while preserving existing session fields", () => {
    const session: SalesforceSession = {
      accessToken: "old-access-token",
      refreshToken: "refresh-token",
      instanceUrl: "https://old.example.my.salesforce.com",
      issuedAt: 100,
      userId: "005xx0000012345",
      organizationId: "00Dxx0000000001"
    };

    expect(
      tokenResponseToRefreshedSession(
        session,
        {
          access_token: "new-access-token",
          instance_url: "https://new.example.my.salesforce.com"
        },
        789
      )
    ).toEqual({
      accessToken: "new-access-token",
      refreshToken: "refresh-token",
      instanceUrl: "https://new.example.my.salesforce.com",
      issuedAt: 789,
      userId: "005xx0000012345",
      organizationId: "00Dxx0000000001"
    });
  });
});
