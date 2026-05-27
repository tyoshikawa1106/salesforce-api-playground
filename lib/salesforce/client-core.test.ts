import { describe, expect, it } from "vitest";
import { DEFAULT_SALESFORCE_API_VERSION } from "./api-version";
import {
    buildAuthorizationCodeTokenEndpointUrl,
    buildAuthorizationCodeTokenParams,
    buildAuthorizationEndpointUrl,
    buildAuthorizationUrl,
    buildAuthorizationUrlParams,
    buildRefreshTokenEndpointUrl,
    buildRefreshTokenParams,
    buildRefreshTokenRequest,
    buildRevokeEndpointUrl,
    buildRevokeParams,
    buildRevokeRequestInit,
    buildTokenRequestInit,
    extractSalesforceErrorMessage,
    readSalesforceErrorDetails,
    selectRevokeToken,
    tokenResponseToRefreshedSession,
    tokenResponseToSession
} from "./client-core";
import type { SalesforceSession } from "./session";

const salesforceConfig = {
    clientId: "client-id",
    clientSecret: "client-secret",
    loginUrl: "https://login.salesforce.com",
    redirectUri: "https://app.example.test/api/auth/callback",
    apiVersion: DEFAULT_SALESFORCE_API_VERSION,
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

describe("buildRefreshTokenRequest", () => {
    it("builds the refresh token endpoint and form-encoded request init together", () => {
        expect(buildRefreshTokenRequest(salesforceConfig, "refresh-token")).toEqual({
            url: "https://login.salesforce.com/services/oauth2/token",
            init: {
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: "grant_type=refresh_token&refresh_token=refresh-token&client_id=client-id&client_secret=client-secret",
                cache: "no-store"
            }
        });
    });
});

describe("buildRevokeEndpointUrl", () => {
    it("builds the OAuth revoke endpoint URL", () => {
        expect(
            buildRevokeEndpointUrl({
                instanceUrl: "https://example.my.salesforce.com"
            })
        ).toBe("https://example.my.salesforce.com/services/oauth2/revoke");
    });
});

describe("selectRevokeToken", () => {
    it("prefers the refresh token when the session has one", () => {
        expect(
            selectRevokeToken({
                accessToken: "access-token",
                refreshToken: "refresh-token"
            })
        ).toBe("refresh-token");
    });

    it("falls back to the access token when the session has no refresh token", () => {
        expect(
            selectRevokeToken({
                accessToken: "access-token"
            })
        ).toBe("access-token");
    });
});

describe("buildRevokeParams", () => {
    it("builds form params for revoke requests", () => {
        const params = buildRevokeParams("refresh-token");

        expect(Object.fromEntries(params)).toEqual({
            token: "refresh-token"
        });
        expect(params.toString()).toBe("token=refresh-token");
    });
});

describe("buildRevokeRequestInit", () => {
    it("builds a form-encoded POST request init without caching", () => {
        const params = new URLSearchParams({
            token: "refresh-token"
        });

        expect(buildRevokeRequestInit(params)).toEqual({
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: "token=refresh-token",
            cache: "no-store"
        });
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

    it("keeps the current instance URL and uses the fallback issued time when omitted", () => {
        const session: SalesforceSession = {
            accessToken: "old-access-token",
            refreshToken: "refresh-token",
            instanceUrl: "https://old.example.my.salesforce.com",
            issuedAt: 100
        };

        expect(
            tokenResponseToRefreshedSession(
                session,
                {
                    access_token: "new-access-token"
                } as Parameters<typeof tokenResponseToRefreshedSession>[1],
                789
            )
        ).toEqual({
            accessToken: "new-access-token",
            refreshToken: "refresh-token",
            instanceUrl: "https://old.example.my.salesforce.com",
            issuedAt: 789
        });
    });
});
