import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as accountRoute from "./accounts/route";
import * as accountRecordRoute from "./accounts/[id]/route";
import * as contactRoute from "./contacts/route";
import * as contactRecordRoute from "./contacts/[id]/route";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import {
    readAccountCreatePayload,
    readAccountUpdatePayload,
    readContactCreatePayload,
    readContactUpdatePayload
} from "@/lib/salesforce/request-payloads";
import {
    createAccount,
    createContact,
    deleteAccount,
    deleteContact,
    listAccounts,
    listContacts,
    updateAccount,
    updateContact
} from "@/services/salesforce/records";
import { dummySalesforceSession, expectJson, jsonRequest } from "./test-helpers";

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
    readContactCreatePayload: vi.fn(),
    readContactUpdatePayload: vi.fn()
}));

vi.mock("@/services/salesforce/records", () => ({
    createAccount: vi.fn(),
    createContact: vi.fn(),
    deleteAccount: vi.fn(),
    deleteContact: vi.fn(),
    listAccounts: vi.fn(),
    listContacts: vi.fn(),
    updateAccount: vi.fn(),
    updateContact: vi.fn()
}));

const jsonWithSessionMock = vi.mocked(jsonWithSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const readAccountCreatePayloadMock = vi.mocked(readAccountCreatePayload);
const readAccountUpdatePayloadMock = vi.mocked(readAccountUpdatePayload);
const readContactCreatePayloadMock = vi.mocked(readContactCreatePayload);
const readContactUpdatePayloadMock = vi.mocked(readContactUpdatePayload);
const createAccountMock = vi.mocked(createAccount);
const createContactMock = vi.mocked(createContact);
const deleteAccountMock = vi.mocked(deleteAccount);
const deleteContactMock = vi.mocked(deleteContact);
const listAccountsMock = vi.mocked(listAccounts);
const listContactsMock = vi.mocked(listContacts);
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

        const response = await accountRecordRoute.PATCH(request, {
            params: Promise.resolve({ id: "001xx000003DGbY" })
        });

        expect(readAccountUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateAccountMock).toHaveBeenCalledWith("001xx000003DGbY", payload);
        await expectJson(response, data);
    });

    it("deletes an account with DELETE /sobjects/Account/{id} and no body", async () => {
        const request = new Request("https://app.example.test/api/accounts/001xx000003DGbY", {
            method: "DELETE",
            headers: {
                origin: "https://app.example.test"
            }
        });
        const data = {};
        deleteAccountMock.mockResolvedValue({ data, session });

        const response = await accountRecordRoute.DELETE(request, {
            params: Promise.resolve({ id: "001xx000003DGbY" })
        });

        expect(deleteAccountMock).toHaveBeenCalledWith("001xx000003DGbY");
        await expectJson(response, data);
    });

    it("rejects account mutations from another origin before calling Salesforce", async () => {
        const request = new Request("https://app.example.test/api/accounts", {
            method: "POST",
            headers: {
                origin: "https://evil.example.test",
                "content-type": "application/json"
            },
            body: JSON.stringify({ Name: "Acme" })
        });

        const response = await accountRoute.POST(request);

        expect(readAccountCreatePayloadMock).not.toHaveBeenCalled();
        expect(createAccountMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });

    it("rejects invalid account ids before calling Salesforce", async () => {
        const request = jsonRequest({ Phone: "03-1234-5678" }, "PATCH");

        const response = await accountRecordRoute.PATCH(request, {
            params: Promise.resolve({ id: "003xx000004TmiQ" })
        });

        expect(readAccountUpdatePayloadMock).not.toHaveBeenCalled();
        expect(updateAccountMock).not.toHaveBeenCalled();
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

        const response = await contactRecordRoute.PATCH(request, {
            params: Promise.resolve({ id: "003xx000004TmiQ" })
        });

        expect(readContactUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateContactMock).toHaveBeenCalledWith("003xx000004TmiQ", payload);
        await expectJson(response, data);
    });

    it("deletes a contact with DELETE /sobjects/Contact/{id} and no body", async () => {
        const request = new Request("https://app.example.test/api/contacts/003xx000004TmiQ", {
            method: "DELETE",
            headers: {
                origin: "https://app.example.test"
            }
        });
        const data = {};
        deleteContactMock.mockResolvedValue({ data, session });

        const response = await contactRecordRoute.DELETE(request, {
            params: Promise.resolve({ id: "003xx000004TmiQ" })
        });

        expect(deleteContactMock).toHaveBeenCalledWith("003xx000004TmiQ");
        await expectJson(response, data);
    });

    it("rejects contact mutations from another origin before calling Salesforce", async () => {
        const request = new Request("https://app.example.test/api/contacts", {
            method: "POST",
            headers: {
                origin: "https://evil.example.test",
                "content-type": "application/json"
            },
            body: JSON.stringify({ LastName: "Yamada" })
        });

        const response = await contactRoute.POST(request);

        expect(readContactCreatePayloadMock).not.toHaveBeenCalled();
        expect(createContactMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });

    it("rejects invalid contact ids before calling Salesforce", async () => {
        const request = jsonRequest({ Title: "Manager" }, "PATCH");

        const response = await contactRecordRoute.PATCH(request, {
            params: Promise.resolve({ id: "001xx000003DGbY" })
        });

        expect(readContactUpdatePayloadMock).not.toHaveBeenCalled();
        expect(updateContactMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "Invalid Contact id." });
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

        const response = await contactRecordRoute.PATCH(jsonRequest({ Title: "Manager" }, "PATCH"), {
            params: Promise.resolve({ id: "003xx000004TmiQ" })
        });

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Salesforce failed" });
    });
});
