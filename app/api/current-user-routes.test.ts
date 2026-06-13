import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as currentUserRoute from "./current-user/route";
import { jsonWithSession } from "@/lib/salesforce/client";
import { getCurrentUserName } from "@/services/salesforce/current-user";
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

vi.mock("@/services/salesforce/current-user", () => ({
    getCurrentUserName: vi.fn()
}));

const getCurrentUserNameMock = vi.mocked(getCurrentUserName);
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

describe("Current user API route", () => {
    it("returns the current Salesforce user name", async () => {
        const data = { userName: "Admin User" };

        getCurrentUserNameMock.mockResolvedValue({
            data: data.userName,
            session: dummySalesforceSession
        });

        const response = await currentUserRoute.GET();

        expect(getCurrentUserNameMock).toHaveBeenCalledWith();
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, dummySalesforceSession);
        await expectJson(response, data);
    });
});
