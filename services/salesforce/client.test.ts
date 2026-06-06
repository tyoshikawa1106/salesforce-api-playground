import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_SALESFORCE_API_VERSION,
    toJsforceApiVersion
} from "@/lib/salesforce/api-version";
import {
    getSalesforceConfig,
    getSalesforceIntegrationConfig
} from "@/lib/salesforce/config";
import {
    SalesforceApiError,
    exchangeClientCredentialsForToken,
    refreshAccessToken
} from "@/lib/salesforce/client";
import { getSession } from "@/lib/salesforce/session";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    createdSalesforceResult,
    emptySalesforceResult,
    withIntegrationConnection,
    withStandardObjectConnection
} from "./client";

const jsforceMocks = vi.hoisted(() => ({
    connection: vi.fn(function Connection(this: unknown, options: unknown) {
        return {
            options,
            request: vi.fn()
        };
    })
}));

vi.mock("jsforce", () => ({
    Connection: jsforceMocks.connection
}));

vi.mock("@/lib/salesforce/config", () => ({
    getSalesforceConfig: vi.fn(),
    getSalesforceIntegrationConfig: vi.fn()
}));

vi.mock("@/lib/salesforce/client", () => {
    class SalesforceApiError extends Error {
        constructor(
            message: string,
            public status: number,
            public details?: unknown
        ) {
            super(message);
        }
    }

    return {
        SalesforceApiError,
        exchangeClientCredentialsForToken: vi.fn(),
        refreshAccessToken: vi.fn()
    };
});

vi.mock("@/lib/salesforce/session", () => ({
    getSession: vi.fn()
}));

const getSessionMock = vi.mocked(getSession);
const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);
const getSalesforceIntegrationConfigMock = vi.mocked(getSalesforceIntegrationConfig);
const exchangeClientCredentialsForTokenMock = vi.mocked(exchangeClientCredentialsForToken);
const refreshAccessTokenMock = vi.mocked(refreshAccessToken);

const session: SalesforceSession = {
    accessToken: "access-token",
    instanceUrl: "https://example.my.salesforce.com",
    issuedAt: 1700000000000,
    refreshToken: "refresh-token",
    userId: "005xx0000012345"
};

const refreshedSession: SalesforceSession = {
    ...session,
    accessToken: "refreshed-access-token",
    issuedAt: 1700000001000
};

beforeEach(() => {
    vi.clearAllMocks();
    getSalesforceConfigMock.mockReturnValue({
        apiVersion: DEFAULT_SALESFORCE_API_VERSION,
        clientId: "client-id",
        clientSecret: "client-secret",
        loginUrl: "https://login.salesforce.com",
        redirectUri: "https://app.example.test/api/auth/callback",
        sessionSecret: "session-secret"
    });
    getSalesforceIntegrationConfigMock.mockReturnValue({
        apiVersion: DEFAULT_SALESFORCE_API_VERSION,
        apiKey: "integration-api-key",
        clientId: "integration-client-id",
        clientSecret: "integration-client-secret",
        loginUrl: "https://login.salesforce.com"
    });
    exchangeClientCredentialsForTokenMock.mockResolvedValue({
        accessToken: "integration-access-token",
        instanceUrl: "https://example.my.salesforce.com",
        issuedAt: 1700000000000,
        userId: "005xx0000099999"
    });
    refreshAccessTokenMock.mockResolvedValue(refreshedSession);
});

describe("Salesforce service connection helpers", () => {
    it("rejects standard operations without a Salesforce session", async () => {
        getSessionMock.mockResolvedValue(null);

        await expect(withStandardObjectConnection(async () => "unreachable")).rejects.toMatchObject({
            message: "Not connected to Salesforce.",
            status: 401
        });
    });

    it("refreshes the session once when a standard operation receives an invalid session error", async () => {
        getSessionMock.mockResolvedValue(session);
        const operation = vi
            .fn()
            .mockRejectedValueOnce({ errorCode: "INVALID_SESSION_ID" })
            .mockResolvedValueOnce("ok");

        await expect(withStandardObjectConnection(operation)).resolves.toEqual({
            data: "ok",
            session: refreshedSession
        });

        expect(refreshAccessTokenMock).toHaveBeenCalledWith(session);
        expect(operation).toHaveBeenCalledTimes(2);
        expect(jsforceMocks.connection).toHaveBeenNthCalledWith(1, {
            accessToken: "access-token",
            instanceUrl: "https://example.my.salesforce.com",
            loginUrl: "https://login.salesforce.com",
            oauth2: {
                clientId: "client-id",
                clientSecret: "client-secret",
                loginUrl: "https://login.salesforce.com",
                redirectUri: "https://app.example.test/api/auth/callback"
            },
            refreshToken: "refresh-token",
            version: toJsforceApiVersion(DEFAULT_SALESFORCE_API_VERSION)
        });
        expect(jsforceMocks.connection).toHaveBeenNthCalledWith(2, {
            accessToken: "refreshed-access-token",
            instanceUrl: "https://example.my.salesforce.com",
            loginUrl: "https://login.salesforce.com",
            oauth2: {
                clientId: "client-id",
                clientSecret: "client-secret",
                loginUrl: "https://login.salesforce.com",
                redirectUri: "https://app.example.test/api/auth/callback"
            },
            refreshToken: "refresh-token",
            version: toJsforceApiVersion(DEFAULT_SALESFORCE_API_VERSION)
        });
    });

    it("normalizes non-Salesforce standard operation failures", async () => {
        getSessionMock.mockResolvedValue(session);

        await expect(
            withStandardObjectConnection(async () => {
                throw "request failed";
            })
        ).rejects.toMatchObject({
            message: "Salesforce API request failed.",
            status: 500,
            details: "request failed"
        });
    });

    it("creates integration connections from client credentials", async () => {
        await expect(withIntegrationConnection(async () => ({ success: true }))).resolves.toEqual({
            data: { success: true }
        });

        expect(jsforceMocks.connection).toHaveBeenCalledWith({
            accessToken: "integration-access-token",
            instanceUrl: "https://example.my.salesforce.com",
            loginUrl: "https://login.salesforce.com",
            oauth2: {
                clientId: "integration-client-id",
                clientSecret: "integration-client-secret",
                loginUrl: "https://login.salesforce.com"
            },
            version: toJsforceApiVersion(DEFAULT_SALESFORCE_API_VERSION)
        });
    });

    it("normalizes integration operation failures", async () => {
        await expect(
            withIntegrationConnection(async () => {
                throw { message: "Forbidden", statusCode: 403 };
            })
        ).rejects.toMatchObject({
            message: "Forbidden",
            status: 403
        });
    });

    it("throws for unsuccessful empty Salesforce save results", () => {
        expect(() =>
            emptySalesforceResult({
                success: false,
                errors: [{ errorCode: "DELETE_FAILED", message: "Cannot delete" }]
            })
        ).toThrow(SalesforceApiError);
    });

    it("throws for unsuccessful created Salesforce save results", () => {
        expect(() =>
            createdSalesforceResult({
                success: false,
                errors: [{ errorCode: "CREATE_FAILED", message: "Cannot create" }]
            })
        ).toThrow(SalesforceApiError);
    });
});
