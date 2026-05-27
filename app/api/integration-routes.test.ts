import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as integrationAccountRoute from "./integration/accounts/route";
import * as integrationAccountRecordRoute from "./integration/accounts/[id]/route";
import {
    readAccountCreatePayload,
    readAccountUpdatePayload
} from "@/lib/salesforce/request-payloads";
import {
    createIntegrationAccount,
    updateIntegrationAccount
} from "@/services/salesforce/records";
import { expectJson } from "./test-helpers";

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
    readAccountUpdatePayload: vi.fn()
}));

vi.mock("@/services/salesforce/records", () => ({
    createIntegrationAccount: vi.fn(),
    updateIntegrationAccount: vi.fn()
}));

const readAccountCreatePayloadMock = vi.mocked(readAccountCreatePayload);
const readAccountUpdatePayloadMock = vi.mocked(readAccountUpdatePayload);
const createIntegrationAccountMock = vi.mocked(createIntegrationAccount);
const updateIntegrationAccountMock = vi.mocked(updateIntegrationAccount);

function integrationRequest(body: unknown, method = "POST", apiKey = "test-integration-api-key"): Request {
    return new Request("https://app.example.test/api/integration/accounts", {
        method,
        headers: {
            "content-type": "application/json",
            "x-integration-api-key": apiKey
        },
        body: JSON.stringify(body)
    });
}

beforeEach(() => {
    vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_ID", "integration-client-id");
    vi.stubEnv("SALESFORCE_INTEGRATION_CLIENT_SECRET", "integration-client-secret");
    vi.stubEnv("INTEGRATION_API_KEY", "test-integration-api-key");
});

afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
});

describe("Integration Account API route", () => {
    it("creates an account as the integration user", async () => {
        const request = integrationRequest({ Name: "Integration Acme" });
        const payload = { Name: "Integration Acme" };
        const data = { id: "001xx000003DGbY", success: true } as const;
        readAccountCreatePayloadMock.mockResolvedValue(payload);
        createIntegrationAccountMock.mockResolvedValue({ data });

        const response = await integrationAccountRoute.POST(request);

        expect(readAccountCreatePayloadMock).toHaveBeenCalledWith(request);
        expect(createIntegrationAccountMock).toHaveBeenCalledWith(payload);
        expect(response.status).toBe(201);
        await expectJson(response, data);
    });

    it("updates an account as the integration user", async () => {
        const request = integrationRequest({ Phone: "03-1234-5678" }, "PATCH");
        const payload = { Phone: "03-1234-5678" };
        readAccountUpdatePayloadMock.mockResolvedValue(payload);
        updateIntegrationAccountMock.mockResolvedValue({ data: {} });

        const response = await integrationAccountRecordRoute.PATCH(request, {
            params: Promise.resolve({ id: "001xx000003DGbY" })
        });

        expect(readAccountUpdatePayloadMock).toHaveBeenCalledWith(request);
        expect(updateIntegrationAccountMock).toHaveBeenCalledWith("001xx000003DGbY", payload);
        await expectJson(response, {});
    });

    it("rejects requests with an invalid integration API key before reading the payload", async () => {
        const request = integrationRequest({ Name: "Integration Acme" }, "POST", "wrong-key");

        const response = await integrationAccountRoute.POST(request);

        expect(readAccountCreatePayloadMock).not.toHaveBeenCalled();
        expect(createIntegrationAccountMock).not.toHaveBeenCalled();
        expect(response.status).toBe(401);
        await expectJson(response, { error: "Invalid integration API key." });
    });

    it("rejects invalid account ids before calling Salesforce", async () => {
        const request = integrationRequest({ Phone: "03-1234-5678" }, "PATCH");

        const response = await integrationAccountRecordRoute.PATCH(request, {
            params: Promise.resolve({ id: "003xx000004TmiQ" })
        });

        expect(readAccountUpdatePayloadMock).not.toHaveBeenCalled();
        expect(updateIntegrationAccountMock).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expectJson(response, { error: "Invalid Account id." });
    });
});
