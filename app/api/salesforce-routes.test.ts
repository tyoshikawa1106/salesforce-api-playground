import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as accountRoute from "./accounts/route";
import * as accountRecordRoute from "./accounts/[id]/route";
import * as contactRoute from "./contacts/route";
import * as contactRecordRoute from "./contacts/[id]/route";
import * as searchRoute from "./search/route";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import type { SearchResultItem } from "@/lib/salesforce/records";
import {
    readAccountCreatePayload,
    readAccountUpdatePayload,
    readBulkDeletePayload,
    readContactCreatePayload,
    readContactUpdatePayload
} from "@/lib/salesforce/request-payloads";
import {
    createAccount,
    createContact,
    deleteAccount,
    deleteAccounts,
    deleteContact,
    deleteContacts,
    listAccounts,
    listContacts,
    searchAccountsAndContacts,
    updateAccount,
    updateContact
} from "@/services/salesforce/records";
import { apiRequest, dummySalesforceSession, expectJson, jsonRequest, routeParams } from "./test-helpers";

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
    jsonWithSession: vi.fn((data: unknown, _session: unknown, status = 200) =>
        Response.json(data, { status })
    ),
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

vi.mock("@/lib/salesforce/request-payloads", () => ({
    readAccountCreatePayload: vi.fn(),
    readAccountUpdatePayload: vi.fn(),
    readBulkDeletePayload: vi.fn(),
    readContactCreatePayload: vi.fn(),
    readContactUpdatePayload: vi.fn()
}));

vi.mock("@/services/salesforce/records", () => ({
    createAccount: vi.fn(),
    createContact: vi.fn(),
    deleteAccount: vi.fn(),
    deleteAccounts: vi.fn(),
    deleteContact: vi.fn(),
    deleteContacts: vi.fn(),
    listAccounts: vi.fn(),
    listContacts: vi.fn(),
    searchAccountsAndContacts: vi.fn(),
    updateAccount: vi.fn(),
    updateContact: vi.fn()
}));

const jsonWithSessionMock = vi.mocked(jsonWithSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const readAccountCreatePayloadMock = vi.mocked(readAccountCreatePayload);
const readAccountUpdatePayloadMock = vi.mocked(readAccountUpdatePayload);
const readBulkDeletePayloadMock = vi.mocked(readBulkDeletePayload);
const readContactCreatePayloadMock = vi.mocked(readContactCreatePayload);
const readContactUpdatePayloadMock = vi.mocked(readContactUpdatePayload);
const createAccountMock = vi.mocked(createAccount);
const createContactMock = vi.mocked(createContact);
const deleteAccountMock = vi.mocked(deleteAccount);
const deleteAccountsMock = vi.mocked(deleteAccounts);
const deleteContactMock = vi.mocked(deleteContact);
const deleteContactsMock = vi.mocked(deleteContacts);
const listAccountsMock = vi.mocked(listAccounts);
const listContactsMock = vi.mocked(listContacts);
const searchAccountsAndContactsMock = vi.mocked(searchAccountsAndContacts);
const updateAccountMock = vi.mocked(updateAccount);
const updateContactMock = vi.mocked(updateContact);

const session = dummySalesforceSession;

beforeEach(() => {
    vi.stubEnv("SALESFORCE_CLIENT_ID", "test-client-id");
    vi.stubEnv("SALESFORCE_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("SALESFORCE_REDIRECT_URI", "https://app.example.test/api/auth/callback");
    vi.stubEnv("SESSION_SECRET", "test-session-secret-with-32-chars");
});

afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
});

describe("Account API route", () => {
    it("fetches accounts through the Salesforce service", async () => {
        const records = [{ Id: "001xx000003DGbY", Name: "Acme" }];
        listAccountsMock.mockResolvedValue({ data: { accounts: records }, session });

        const response = await accountRoute.GET();

        expect(listAccountsMock).toHaveBeenCalledWith();
        expect(jsonWithSessionMock).toHaveBeenCalledWith({ accounts: records }, session);
        await expectJson(response, { accounts: records });
    });

    it("creates an account with the request payload and keeps status 201", async () => {
        const request = jsonRequest({ Name: "Acme" });
        const payload = { Name: "Acme" };
        const data = { id: "001xx000003DGbY", success: true } as const;
        readAccountCreatePayloadMock.mockResolvedValue(payload);
        createAccountMock.mockResolvedValue({ data, session });

        const response = await accountRoute.POST(request);

        expect(readAccountCreatePayloadMock).toHaveBeenCalledWith(request);
        expect(createAccountMock).toHaveBeenCalledWith(payload);
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session, 201);
        expect(response.status).toBe(201);
        await expectJson(response, data);
    });

    it("updates an account with PATCH /sobjects/Account/{id}", async () => {
        const request = jsonRequest({ Phone: "03-1234-5678" }, "PATCH");
        const payload = { Phone: "03-1234-5678" };
        const data = {};
        readAccountUpdatePayloadMock.mockResolvedValue(payload);
        updateAccountMock.mockResolvedValue({ data, session });

        const response = await accountRecordRoute.PATCH(request, routeParams("001xx000003DGbY"));

        expect(readAccountUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateAccountMock).toHaveBeenCalledWith("001xx000003DGbY", payload);
        await expectJson(response, data);
    });

    it("deletes an account with DELETE /sobjects/Account/{id} and no body", async () => {
        const request = apiRequest("/api/accounts/001xx000003DGbY", { method: "DELETE" });
        const data = {};
        deleteAccountMock.mockResolvedValue({ data, session });

        const response = await accountRecordRoute.DELETE(request, routeParams("001xx000003DGbY"));

        expect(deleteAccountMock).toHaveBeenCalledWith("001xx000003DGbY");
        await expectJson(response, data);
    });

    it("deletes multiple accounts with DELETE /api/accounts and ids body", async () => {
        const request = jsonRequest({ ids: ["001xx000003DGbY", "001xx000003DGbZ"] }, "DELETE");
        const payload = { ids: ["001xx000003DGbY", "001xx000003DGbZ"] };
        const data = {
            results: [
                { id: "001xx000003DGbY", success: true as const, errors: [] },
                { id: "001xx000003DGbZ", success: true as const, errors: [] }
            ]
        };
        readBulkDeletePayloadMock.mockResolvedValue(payload);
        deleteAccountsMock.mockResolvedValue({ data, session });

        const response = await accountRoute.DELETE(request);

        expect(readBulkDeletePayloadMock).toHaveBeenCalledWith(request);
        expect(deleteAccountsMock).toHaveBeenCalledWith(payload.ids);
        await expectJson(response, data);
    });

    it("rejects account mutations from another origin before calling Salesforce", async () => {
        const request = apiRequest("/api/accounts", {
            method: "POST",
            origin: "https://evil.example.test",
            body: { Name: "Acme" }
        });

        const response = await accountRoute.POST(request);

        expect(readAccountCreatePayloadMock).not.toHaveBeenCalled();
        expect(createAccountMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });

    it("rejects invalid account ids before calling Salesforce", async () => {
        const request = jsonRequest({ Phone: "03-1234-5678" }, "PATCH");

        const response = await accountRecordRoute.PATCH(request, routeParams("003xx000004TmiQ"));

        expect(readAccountUpdatePayloadMock).not.toHaveBeenCalled();
        expect(updateAccountMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "Invalid Account id." });
    });

    it("rejects invalid bulk account ids before calling Salesforce", async () => {
        const request = jsonRequest({ ids: ["001xx000003DGbY", "003xx000004TmiQ"] }, "DELETE");
        readBulkDeletePayloadMock.mockResolvedValue({ ids: ["001xx000003DGbY", "003xx000004TmiQ"] });

        const response = await accountRoute.DELETE(request);

        expect(deleteAccountsMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "Invalid Account id." });
    });
});

describe("Contact API route", () => {
    it("fetches contacts through the Salesforce service", async () => {
        const records = [{ Id: "003xx000004TmiQ", LastName: "Yamada" }];
        listContactsMock.mockResolvedValue({ data: { contacts: records }, session });

        const response = await contactRoute.GET();

        expect(listContactsMock).toHaveBeenCalledWith();
        expect(jsonWithSessionMock).toHaveBeenCalledWith({ contacts: records }, session);
        await expectJson(response, { contacts: records });
    });

    it("creates a contact with the request payload and keeps status 201", async () => {
        const request = jsonRequest({ LastName: "Yamada" });
        const payload = { LastName: "Yamada" };
        const data = { id: "003xx000004TmiQ", success: true } as const;
        readContactCreatePayloadMock.mockResolvedValue(payload);
        createContactMock.mockResolvedValue({ data, session });

        const response = await contactRoute.POST(request);

        expect(readContactCreatePayloadMock).toHaveBeenCalledWith(request);
        expect(createContactMock).toHaveBeenCalledWith(payload);
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session, 201);
        expect(response.status).toBe(201);
        await expectJson(response, data);
    });

    it("updates a contact with PATCH /sobjects/Contact/{id}", async () => {
        const request = jsonRequest({ Title: "Manager" }, "PATCH");
        const payload = { Title: "Manager" };
        const data = {};
        readContactUpdatePayloadMock.mockResolvedValue(payload);
        updateContactMock.mockResolvedValue({ data, session });

        const response = await contactRecordRoute.PATCH(request, routeParams("003xx000004TmiQ"));

        expect(readContactUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateContactMock).toHaveBeenCalledWith("003xx000004TmiQ", payload);
        await expectJson(response, data);
    });

    it("deletes a contact with DELETE /sobjects/Contact/{id} and no body", async () => {
        const request = apiRequest("/api/contacts/003xx000004TmiQ", { method: "DELETE" });
        const data = {};
        deleteContactMock.mockResolvedValue({ data, session });

        const response = await contactRecordRoute.DELETE(request, routeParams("003xx000004TmiQ"));

        expect(deleteContactMock).toHaveBeenCalledWith("003xx000004TmiQ");
        await expectJson(response, data);
    });

    it("deletes multiple contacts with DELETE /api/contacts and ids body", async () => {
        const request = jsonRequest({ ids: ["003xx000004TmiQ", "003xx000004TmiR"] }, "DELETE");
        const payload = { ids: ["003xx000004TmiQ", "003xx000004TmiR"] };
        const data = {
            results: [
                { id: "003xx000004TmiQ", success: true as const, errors: [] },
                { id: "003xx000004TmiR", success: true as const, errors: [] }
            ]
        };
        readBulkDeletePayloadMock.mockResolvedValue(payload);
        deleteContactsMock.mockResolvedValue({ data, session });

        const response = await contactRoute.DELETE(request);

        expect(readBulkDeletePayloadMock).toHaveBeenCalledWith(request);
        expect(deleteContactsMock).toHaveBeenCalledWith(payload.ids);
        await expectJson(response, data);
    });

    it("rejects contact mutations from another origin before calling Salesforce", async () => {
        const request = apiRequest("/api/contacts", {
            method: "POST",
            origin: "https://evil.example.test",
            body: { LastName: "Yamada" }
        });

        const response = await contactRoute.POST(request);

        expect(readContactCreatePayloadMock).not.toHaveBeenCalled();
        expect(createContactMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });

    it("rejects invalid contact ids before calling Salesforce", async () => {
        const request = jsonRequest({ Title: "Manager" }, "PATCH");

        const response = await contactRecordRoute.PATCH(request, routeParams("001xx000003DGbY"));

        expect(readContactUpdatePayloadMock).not.toHaveBeenCalled();
        expect(updateContactMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "Invalid Contact id." });
    });
});

describe("Global search API route", () => {
    it("searches accounts and contacts through the Salesforce service", async () => {
        const results = [
            {
                type: "account" as const,
                record: { Id: "001xx000003DGbY", Name: "Acme" }
            }
        ];
        searchAccountsAndContactsMock.mockResolvedValue({ data: { results }, session });

        const response = await searchRoute.GET(
            apiRequest("/api/search?q=Acme")
        );

        expect(searchAccountsAndContactsMock).toHaveBeenCalledWith("Acme");
        expect(jsonWithSessionMock).toHaveBeenCalledWith({ results }, session);
        await expectJson(response, { results });
    });

    it("rejects short search queries before calling Salesforce", async () => {
        const response = await searchRoute.GET(
            apiRequest("/api/search?q=A")
        );

        expect(searchAccountsAndContactsMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "検索キーワードは 2 文字以上で入力してください。" });
    });

    it("rejects missing search queries before calling Salesforce", async () => {
        const response = await searchRoute.GET(
            apiRequest("/api/search")
        );

        expect(searchAccountsAndContactsMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "検索キーワードを入力してください。" });
    });

    it("trims and truncates search queries before calling Salesforce", async () => {
        const longQuery = `${"A".repeat(90)}  `;
        const results: SearchResultItem[] = [];
        searchAccountsAndContactsMock.mockResolvedValue({ data: { results }, session });

        const response = await searchRoute.GET(
            apiRequest(`/api/search?q=${encodeURIComponent(longQuery)}`)
        );

        expect(searchAccountsAndContactsMock).toHaveBeenCalledWith("A".repeat(80));
        await expectJson(response, { results });
    });
});

describe("Salesforce API route error handling", () => {
    it("delegates account route errors to salesforceErrorResponse", async () => {
        const error = new Error("Salesforce failed");
        listAccountsMock.mockRejectedValue(error);

        const response = await accountRoute.GET();

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Salesforce failed" });
    });

    it("delegates contact record route errors to salesforceErrorResponse", async () => {
        const error = new Error("Salesforce failed");
        readContactUpdatePayloadMock.mockResolvedValue({ Title: "Manager" });
        updateContactMock.mockRejectedValue(error);

        const response = await contactRecordRoute.PATCH(
            jsonRequest({ Title: "Manager" }, "PATCH"),
            routeParams("003xx000004TmiQ")
        );

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Salesforce failed" });
    });
});
