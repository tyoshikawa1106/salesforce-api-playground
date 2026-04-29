import { describe, expect, it } from "vitest";
import {
  buildSalesforceApiUrl,
  extractSalesforceErrorMessage,
  tokenResponseToRefreshedSession,
  tokenResponseToSession
} from "./client-core";
import type { SalesforceSession } from "./session";

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
