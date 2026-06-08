import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as activitiesRoute from "./activities/route";
import * as activityEventsRoute from "./activities/events/route";
import * as activityTasksRoute from "./activities/tasks/route";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import {
    readActivityParentFromUrl,
    readEventActivityCreatePayload,
    readTaskActivityCreatePayload
} from "@/lib/salesforce/activity-payloads";
import {
    createEventActivity,
    createTaskActivity,
    listActivities
} from "@/services/salesforce/activities";
import { apiRequest, dummySalesforceSession, expectJson, jsonRequest } from "./test-helpers";

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

vi.mock("@/lib/salesforce/activity-payloads", () => ({
    readActivityParentFromUrl: vi.fn(),
    readEventActivityCreatePayload: vi.fn(),
    readTaskActivityCreatePayload: vi.fn()
}));

vi.mock("@/services/salesforce/activities", () => ({
    createEventActivity: vi.fn(),
    createTaskActivity: vi.fn(),
    listActivities: vi.fn()
}));

const jsonWithSessionMock = vi.mocked(jsonWithSession);
const salesforceErrorResponseMock = vi.mocked(salesforceErrorResponse);
const readActivityParentFromUrlMock = vi.mocked(readActivityParentFromUrl);
const readEventActivityCreatePayloadMock = vi.mocked(readEventActivityCreatePayload);
const readTaskActivityCreatePayloadMock = vi.mocked(readTaskActivityCreatePayload);
const createEventActivityMock = vi.mocked(createEventActivity);
const createTaskActivityMock = vi.mocked(createTaskActivity);
const listActivitiesMock = vi.mocked(listActivities);
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

describe("Activity API routes", () => {
    it("lists activities for the requested parent", async () => {
        const parent = {
            parentType: "account" as const,
            parentId: "001xx000003DGbY"
        };
        const data = {
            activities: [
                {
                    type: "task" as const,
                    id: "00Txx0000012345",
                    subject: "Call"
                }
            ]
        };
        const request = new Request("https://app.example.test/api/activities?parentType=account&parentId=001xx000003DGbY");

        readActivityParentFromUrlMock.mockReturnValue(parent);
        listActivitiesMock.mockResolvedValue({ data, session });

        const response = await activitiesRoute.GET(request);

        expect(readActivityParentFromUrlMock).toHaveBeenCalledWith(request);
        expect(listActivitiesMock).toHaveBeenCalledWith(parent);
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session);
        await expectJson(response, data);
    });

    it("creates tasks from the request payload", async () => {
        const request = jsonRequest({ Subject: "Call" });
        const payload = {
            parentType: "contact" as const,
            parentId: "003xx000004TmiQ",
            Subject: "Call"
        };
        const data = { id: "00Txx0000012345", success: true } as const;
        readTaskActivityCreatePayloadMock.mockResolvedValue(payload);
        createTaskActivityMock.mockResolvedValue({ data, session });

        const response = await activityTasksRoute.POST(request);

        expect(readTaskActivityCreatePayloadMock).toHaveBeenCalledWith(request);
        expect(createTaskActivityMock).toHaveBeenCalledWith(payload);
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session);
        await expectJson(response, data);
    });

    it("creates events from the request payload", async () => {
        const request = jsonRequest({ Subject: "Meeting" });
        const payload = {
            parentType: "account" as const,
            parentId: "001xx000003DGbY",
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00:00.000Z",
            EndDateTime: "2026-06-08T11:00:00.000Z"
        };
        const data = { id: "00Uxx0000012345", success: true } as const;
        readEventActivityCreatePayloadMock.mockResolvedValue(payload);
        createEventActivityMock.mockResolvedValue({ data, session });

        const response = await activityEventsRoute.POST(request);

        expect(readEventActivityCreatePayloadMock).toHaveBeenCalledWith(request);
        expect(createEventActivityMock).toHaveBeenCalledWith(payload);
        expect(jsonWithSessionMock).toHaveBeenCalledWith(data, session);
        await expectJson(response, data);
    });

    it("rejects activity mutations from another origin before reading payload", async () => {
        const request = apiRequest("/api/activities/tasks", {
            method: "POST",
            origin: "https://evil.example.test",
            body: { Subject: "Call" }
        });

        const response = await activityTasksRoute.POST(request);

        expect(readTaskActivityCreatePayloadMock).not.toHaveBeenCalled();
        expect(createTaskActivityMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expectJson(response, { error: "Invalid request origin." });
    });

    it("delegates list errors to salesforceErrorResponse", async () => {
        const error = new Error("Salesforce failed");
        readActivityParentFromUrlMock.mockReturnValue({
            parentType: "account",
            parentId: "001xx000003DGbY"
        });
        listActivitiesMock.mockRejectedValue(error);

        const response = await activitiesRoute.GET(new Request("https://app.example.test/api/activities"));

        expect(salesforceErrorResponseMock).toHaveBeenCalledWith(error);
        await expectJson(response, { error: "Salesforce failed" });
    });
});
