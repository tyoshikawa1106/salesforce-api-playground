import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as recycleBinRoute from "./recycle-bin/route";
import * as recycleBinUndeleteRoute from "./recycle-bin/undelete/route";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import { readRecycleBinUndeletePayload } from "@/lib/salesforce/request-payloads";
import {
    listRecycleBinItems,
    undeleteRecycleBinItems
} from "@/services/salesforce/recycle-bin";
import { dummySalesforceSession, expectJson, jsonRequest } from "./test-helpers";

vi.mock("@/lib/salesforce/client", () => ({
    SalesforceApiError: class SalesforceApiError extends Error {
        constructor(
            message: string,
            public status: number
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
    readRecycleBinUndeletePayload: vi.fn()
}));

vi.mock("@/services/salesforce/recycle-bin", () => ({
    listRecycleBinItems: vi.fn(),
    undeleteRecycleBinItems: vi.fn()
}));

const jsonWithSessionMock = vi.mocked(jsonWithSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const readRecycleBinUndeletePayloadMock = vi.mocked(readRecycleBinUndeletePayload);
const listRecycleBinItemsMock = vi.mocked(listRecycleBinItems);
const undeleteRecycleBinItemsMock = vi.mocked(undeleteRecycleBinItems);
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

describe("Recycle Bin API routes", () => {
    it("lists recycle bin items through the Salesforce service", async () => {
        const data = {
            items: [
                {
                    objectApiName: "Account" as const,
                    objectLabel: "取引先",
                    id: "001xx000003DGbY",
                    name: "Deleted Acme"
                }
            ]
        };
        listRecycleBinItemsMock.mockResolvedValue({ data, session });

        const response = await recycleBinRoute.GET();

        expect(listRecycleBinItemsMock).toHaveBeenCalledWith();
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session);
        await expectJson(response, data);
    });

    it("undeletes recycle bin items with the request payload", async () => {
        const request = jsonRequest({
            items: [{ objectApiName: "Account", id: "001xx000003DGbY" }]
        });
        const payload = {
            items: [{ objectApiName: "Account", id: "001xx000003DGbY" }]
        };
        const data = {
            restoreResults: [
                {
                    objectApiName: "Account" as const,
                    results: [{ id: "001xx000003DGbY", success: true as const, errors: [] }]
                }
            ]
        };
        readRecycleBinUndeletePayloadMock.mockResolvedValue(payload);
        undeleteRecycleBinItemsMock.mockResolvedValue({ data, session });

        const response = await recycleBinUndeleteRoute.POST(request);

        expect(readRecycleBinUndeletePayloadMock).toHaveBeenCalledWith(request);
        expect(undeleteRecycleBinItemsMock).toHaveBeenCalledWith(payload.items);
        await expectJson(response, data);
    });

    it("rejects undelete requests from another origin before reading payload", async () => {
        const request = new Request("https://app.example.test/api/recycle-bin/undelete", {
            method: "POST",
            headers: {
                origin: "https://evil.example.test",
                "content-type": "application/json"
            },
            body: JSON.stringify({ items: [{ objectApiName: "Account", id: "001xx000003DGbY" }] })
        });

        const response = await recycleBinUndeleteRoute.POST(request);

        expect(readRecycleBinUndeletePayloadMock).not.toHaveBeenCalled();
        expect(undeleteRecycleBinItemsMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });

    it("delegates recycle bin route errors to salesforceErrorResponse", async () => {
        const error = new Error("Salesforce failed");
        listRecycleBinItemsMock.mockRejectedValue(error);

        const response = await recycleBinRoute.GET();

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Salesforce failed" });
    });
});
