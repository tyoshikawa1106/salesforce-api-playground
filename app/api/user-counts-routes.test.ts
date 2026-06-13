import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as userCountsRoute from "./user-counts/route";
import { jsonWithSession } from "@/lib/salesforce/client";
import { countActiveUsers } from "@/services/salesforce/users";
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

vi.mock("@/services/salesforce/users", () => ({
    countActiveUsers: vi.fn()
}));

const countActiveUsersMock = vi.mocked(countActiveUsers);
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

describe("User count API route", () => {
    it("counts active users", async () => {
        const data = {
            userCounts: {
                active: 8
            }
        };

        countActiveUsersMock.mockResolvedValue({
            data,
            session: dummySalesforceSession
        });

        const response = await userCountsRoute.GET();

        expect(countActiveUsersMock).toHaveBeenCalledWith();
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, dummySalesforceSession);
        await expectJson(response, data);
    });
});
