import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_SALESFORCE_API_VERSION,
    toJsforceApiVersion
} from "@/lib/salesforce/api-version";
import {
    getSalesforceConfig,
    getSalesforceIntegrationConfig
} from "@/lib/salesforce/config";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    SalesforceApiError,
    exchangeClientCredentialsForToken
} from "@/lib/salesforce/client";
import { getSession } from "@/lib/salesforce/session";
import {
    createAccount,
    createIntegrationAccount,
    deleteAccount,
    deleteAccounts,
    buildGlobalSearchSosl,
    listAccounts,
    searchAccountsAndContacts,
    updateIntegrationAccount,
    updateContact
} from "./records";

const jsforceMocks = vi.hoisted(() => ({
    query: vi.fn(),
    create: vi.fn(),
    search: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    connection: vi.fn(function Connection(this: unknown) {
        return {
            query: jsforceMocks.query,
            search: jsforceMocks.search,
            sobject: vi.fn(() => ({
                create: jsforceMocks.create,
                update: jsforceMocks.update,
                destroy: jsforceMocks.destroy
            }))
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

const session: SalesforceSession = {
    accessToken: "access-token",
    instanceUrl: "https://example.my.salesforce.com",
    issuedAt: 1700000000000,
    refreshToken: "refresh-token",
    userId: "005xx0000012345"
};

beforeEach(() => {
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
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("Salesforce record services", () => {
    it("creates a jsforce connection from the current session", async () => {
        getSessionMock.mockResolvedValue(session);
        jsforceMocks.query.mockResolvedValue({ records: [{ Id: "001xx000003DGbY", Name: "Acme" }] });

        await expect(listAccounts()).resolves.toEqual({
            data: { accounts: [{ Id: "001xx000003DGbY", Name: "Acme" }] },
            session
        });

        expect(jsforceMocks.connection).toHaveBeenCalledWith({
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
    });

    it("uses jsforce standard object create for accounts", async () => {
        getSessionMock.mockResolvedValue(session);
        jsforceMocks.create.mockResolvedValue({ id: "001xx000003DGbY", success: true });

        await expect(createAccount({ Name: "Acme" })).resolves.toEqual({
            data: { id: "001xx000003DGbY", success: true },
            session
        });

        expect(jsforceMocks.create).toHaveBeenCalledWith({ Name: "Acme" });
    });

    it("returns Salesforce create errors instead of reporting a failed create as success", async () => {
        getSessionMock.mockResolvedValue(session);
        const errors = [{ message: "Name is required", errorCode: "REQUIRED_FIELD_MISSING" }];
        jsforceMocks.create.mockResolvedValue({ success: false, errors });

        const promise = createAccount({ Name: "Acme" });

        await expect(promise).rejects.toMatchObject({
            message: "Salesforce API request failed.",
            status: 400,
            details: errors
        });
        await expect(promise).rejects.toBeInstanceOf(SalesforceApiError);
    });

    it("uses jsforce standard object update with the record id", async () => {
        getSessionMock.mockResolvedValue(session);
        jsforceMocks.update.mockResolvedValue({ success: true });

        await expect(updateContact("003xx000004TmiQ", { Title: "Manager" })).resolves.toEqual({
            data: {},
            session
        });

        expect(jsforceMocks.update).toHaveBeenCalledWith({
            Id: "003xx000004TmiQ",
            Title: "Manager"
        });
    });

    it("uses jsforce standard object destroy for deletes", async () => {
        getSessionMock.mockResolvedValue(session);
        jsforceMocks.destroy.mockResolvedValue({ success: true });

        await expect(deleteAccount("001xx000003DGbY")).resolves.toEqual({
            data: {},
            session
        });

        expect(jsforceMocks.destroy).toHaveBeenCalledWith("001xx000003DGbY");
    });

    it("uses jsforce standard object destroy with multiple ids for bulk deletes", async () => {
        getSessionMock.mockResolvedValue(session);
        jsforceMocks.destroy.mockResolvedValue([
            { id: "001xx000003DGbY", success: true, errors: [] },
            { id: "001xx000003DGbZ", success: true, errors: [] }
        ]);

        await expect(deleteAccounts(["001xx000003DGbY", "001xx000003DGbZ"])).resolves.toEqual({
            data: {
                results: [
                    { id: "001xx000003DGbY", success: true, errors: [] },
                    { id: "001xx000003DGbZ", success: true, errors: [] }
                ]
            },
            session
        });

        expect(jsforceMocks.destroy).toHaveBeenCalledWith(["001xx000003DGbY", "001xx000003DGbZ"]);
    });

    it("searches accounts and contacts with SOSL", async () => {
        getSessionMock.mockResolvedValue(session);
        jsforceMocks.search.mockResolvedValue({
            searchRecords: [
                {
                    attributes: { type: "Account" },
                    Id: "001xx000003DGbY",
                    Name: "Acme",
                    BillingCity: "Tokyo"
                },
                {
                    attributes: { type: "Contact" },
                    Id: "003xx000004TmiQ",
                    FirstName: "Taro",
                    LastName: "Yamada",
                    Email: "taro@example.test",
                    Account: { Name: "Acme" }
                }
            ]
        });

        await expect(searchAccountsAndContacts("Acme")).resolves.toEqual({
            data: {
                results: [
                    {
                        type: "account",
                        record: {
                            Id: "001xx000003DGbY",
                            Name: "Acme",
                            BillingCity: "Tokyo"
                        }
                    },
                    {
                        type: "contact",
                        record: {
                            Id: "003xx000004TmiQ",
                            FirstName: "Taro",
                            LastName: "Yamada",
                            Email: "taro@example.test",
                            Account: { Name: "Acme" }
                        }
                    }
                ]
            },
            session
        });
        expect(jsforceMocks.search).toHaveBeenCalledWith(
            "FIND {Acme*} IN ALL FIELDS RETURNING Account(Id, Name, Phone, Website, Industry, Type, BillingCity, BillingCountry, LastModifiedDate LIMIT 5), Contact(Id, FirstName, LastName, Email, Phone, Title, AccountId, Account.Name, LastModifiedDate LIMIT 5)"
        );
    });

    it("escapes SOSL reserved characters in search terms", () => {
        expect(buildGlobalSearchSosl("Acme + Tokyo")).toContain("FIND {Acme \\+ Tokyo*}");
    });

    it("uses client credentials for integration account creates", async () => {
        jsforceMocks.create.mockResolvedValue({ id: "001xx000003DGbY", success: true });

        await expect(createIntegrationAccount({ Name: "Integration Acme" })).resolves.toEqual({
            data: { id: "001xx000003DGbY", success: true }
        });

        expect(exchangeClientCredentialsForTokenMock).toHaveBeenCalledWith();
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
        expect(jsforceMocks.create).toHaveBeenCalledWith({ Name: "Integration Acme" });
    });

    it("uses client credentials for integration account updates", async () => {
        jsforceMocks.update.mockResolvedValue({ success: true });

        await expect(updateIntegrationAccount("001xx000003DGbY", { Phone: "03-1234-5678" })).resolves.toEqual({
            data: {}
        });

        expect(jsforceMocks.update).toHaveBeenCalledWith({
            Id: "001xx000003DGbY",
            Phone: "03-1234-5678"
        });
    });
});
