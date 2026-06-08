import { afterEach, describe, expect, it, vi } from "vitest";
import * as activityLookupsRoute from "./activity-lookups/route";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import {
    listActivityLookupOptions,
    readActivityLookupParams
} from "@/services/salesforce/activity-lookups";
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

vi.mock("@/services/salesforce/activity-lookups", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/services/salesforce/activity-lookups")>();

    return {
        ...actual,
        listActivityLookupOptions: vi.fn()
    };
});

const jsonWithSessionMock = vi.mocked(jsonWithSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const listActivityLookupOptionsMock = vi.mocked(listActivityLookupOptions);
const session = dummySalesforceSession;

afterEach(() => {
    vi.clearAllMocks();
});

describe("Activity lookup API route", () => {
    it("lists lookup candidates for the requested object and query", async () => {
        const data = {
            options: [
                {
                    id: "003xx000004TmiQ",
                    label: "Gonzalez Rose",
                    meta: "Edge Communications",
                    object: "contact" as const
                }
            ]
        };
        const request = apiRequest("/api/activity-lookups?object=contact&q=Gonzalez");

        listActivityLookupOptionsMock.mockResolvedValue({ data, session });

        const response = await activityLookupsRoute.GET(request);

        expect(listActivityLookupOptionsMock).toHaveBeenCalledWith({
            object: "contact",
            query: "Gonzalez"
        });
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session);
        await expectJson(response, data);
    });

    it("rejects unsupported lookup objects before querying Salesforce", async () => {
        const request = apiRequest("/api/activity-lookups?object=case");

        const response = await activityLookupsRoute.GET(request);

        expect(listActivityLookupOptionsMock).not.toHaveBeenCalled();
        expect(salesforceErrorResponseMock).toHaveBeenCalled();
        expect(response.status).toBe(400);
    });

    it("can read route params directly", () => {
        const request = apiRequest("/api/activity-lookups?object=user&q=%20Yoshikawa%20");

        expect(readActivityLookupParams(request)).toEqual({
            object: "user",
            query: "Yoshikawa"
        });
    });
});
