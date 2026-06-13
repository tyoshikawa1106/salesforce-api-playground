import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as recordCountsRoute from "./record-counts/route";
import { jsonWithSession } from "@/lib/salesforce/client";
import { countRecordObjects } from "@/services/salesforce/record-counts";
import { dummySalesforceSession, expectJson } from "./test-helpers";

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

vi.mock("@/services/salesforce/record-counts", () => ({
    countRecordObjects: vi.fn()
}));

const countRecordObjectsMock = vi.mocked(countRecordObjects);
const jsonWithSessionMock = vi.mocked(jsonWithSession);

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

describe("Record count API route", () => {
    it("counts additional home record objects", async () => {
        const data = {
            recordCounts: {
                campaigns: 6,
                cases: 7,
                emailMessages: 8,
                leads: 3,
                opportunities: 4,
                products: 5
            }
        };

        countRecordObjectsMock.mockResolvedValue({
            data,
            session: dummySalesforceSession
        });

        const response = await recordCountsRoute.GET();

        expect(countRecordObjectsMock).toHaveBeenCalledWith();
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, dummySalesforceSession);
        await expectJson(response, data);
    });
});
