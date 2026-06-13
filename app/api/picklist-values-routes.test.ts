import { afterEach, describe, expect, it, vi } from "vitest";
import * as picklistValuesRoute from "./picklist-values/route";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import { listPicklistValues } from "@/services/salesforce/picklist-values";
import { apiRequest, dummySalesforceSession, expectJson } from "./test-helpers";

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

vi.mock("@/services/salesforce/picklist-values", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/services/salesforce/picklist-values")>();

    return {
        ...actual,
        listPicklistValues: vi.fn()
    };
});

const jsonWithSessionMock = vi.mocked(jsonWithSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const listPicklistValuesMock = vi.mocked(listPicklistValues);
const session = dummySalesforceSession;

afterEach(() => {
    vi.clearAllMocks();
});

describe("Picklist values API route", () => {
    it("lists picklist values for supported object fields", async () => {
        const data = {
            fields: {
                Industry: [{ label: "Technology", value: "Technology" }],
                Type: [{ label: "Customer", value: "Customer" }]
            },
            recordTypeId: "012xx0000000001AAA"
        };
        const request = apiRequest("/api/picklist-values?object=Account&fields=Industry,Type&recordTypeId=012xx0000000001AAA");
        listPicklistValuesMock.mockResolvedValue({ data, session });

        const response = await picklistValuesRoute.GET(request);

        expect(listPicklistValuesMock).toHaveBeenCalledWith({
            objectApiName: "Account",
            fieldApiNames: ["Industry", "Type"],
            recordTypeId: "012xx0000000001AAA"
        });
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session);
        await expectJson(response, data);
    });

    it("rejects unsupported fields before querying Salesforce", async () => {
        const request = apiRequest("/api/picklist-values?object=Task&fields=Priority");

        const response = await picklistValuesRoute.GET(request);

        expect(listPicklistValuesMock).not.toHaveBeenCalled();
        expect(salesforceErrorResponseMock).toHaveBeenCalled();
        expect(response.status).toBe(400);
    });
});
