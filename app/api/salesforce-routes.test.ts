import { afterEach, describe, expect, it, vi } from "vitest";
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
    jsonWithSession: vi.fn((data: unknown, _session: unknown, status = 200) =>
        Response.json(data, { status })
    ),
    salesforceErrorResponse: vi.fn((error: unknown) =>
        Response.json(
            { error: error instanceof Error ? error.message : "Unexpected server error." },
            { status: 500 }
        )
    )
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

afterEach(() => {
    vi.clearAllMocks();
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
        const data = { id: "001xx000003DGbY", success: true };
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
            params: { id: "001xx000003DGbY" }
        });

        expect(readAccountUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateAccountMock).toHaveBeenCalledWith("001xx000003DGbY", payload);
        await expectJson(response, data);
    });

    it("deletes an account with DELETE /sobjects/Account/{id} and no body", async () => {
        const request = new Request("https://app.example.test/api/accounts/001xx000003DGbY", {
            method: "DELETE"
        });
        const data = {};
        deleteAccountMock.mockResolvedValue({ data, session });

        const response = await accountRecordRoute.DELETE(request, {
            params: { id: "001xx000003DGbY" }
        });

        expect(deleteAccountMock).toHaveBeenCalledWith("001xx000003DGbY");
        await expectJson(response, data);
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
        const data = { id: "003xx000004TmiQ", success: true };
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
            params: { id: "003xx000004TmiQ" }
        });

        expect(readContactUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateContactMock).toHaveBeenCalledWith("003xx000004TmiQ", payload);
        await expectJson(response, data);
    });

    it("deletes a contact with DELETE /sobjects/Contact/{id} and no body", async () => {
        const request = new Request("https://app.example.test/api/contacts/003xx000004TmiQ", {
            method: "DELETE"
        });
        const data = {};
        deleteContactMock.mockResolvedValue({ data, session });

        const response = await contactRecordRoute.DELETE(request, {
            params: { id: "003xx000004TmiQ" }
        });

        expect(deleteContactMock).toHaveBeenCalledWith("003xx000004TmiQ");
        await expectJson(response, data);
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
            params: { id: "003xx000004TmiQ" }
        });

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Salesforce failed" });
    });
});
