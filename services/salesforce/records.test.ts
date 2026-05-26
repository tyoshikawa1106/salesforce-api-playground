import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_SALESFORCE_API_VERSION,
    toJsforceApiVersion
} from "@/lib/salesforce/api-version";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import type { SalesforceSession } from "@/lib/salesforce/session";
import { SalesforceApiError } from "@/lib/salesforce/client";
import { getSession } from "@/lib/salesforce/session";
import {
    createAccount,
    deleteAccount,
    listAccounts,
    updateContact
} from "./records";

const jsforceMocks = vi.hoisted(() => ({
    query: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    connection: vi.fn(function Connection(this: unknown) {
        return {
            query: jsforceMocks.query,
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
    getSalesforceConfig: vi.fn()
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
        refreshAccessToken: vi.fn()
    };
});

vi.mock("@/lib/salesforce/session", () => ({
    getSession: vi.fn()
}));

const getSessionMock = vi.mocked(getSession);
const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);

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
});
