import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    createTaskActivity,
    listActivities
} from "./activities";
import { withStandardObjectConnection } from "./client";
import { createStandardObject } from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";

vi.mock("./client", () => ({
    withStandardObjectConnection: vi.fn()
}));

vi.mock("./object-mutations", () => ({
    createStandardObject: vi.fn()
}));

vi.mock("./object-permissions", () => ({
    assertObjectPermission: vi.fn()
}));

const withStandardObjectConnectionMock = vi.mocked(withStandardObjectConnection);
const createStandardObjectMock = vi.mocked(createStandardObject);
const assertObjectPermissionMock = vi.mocked(assertObjectPermission);

const session: SalesforceSession = {
    accessToken: "access-token",
    instanceUrl: "https://example.my.salesforce.com",
    issuedAt: 1700000000000,
    refreshToken: "refresh-token",
    userId: "005xx0000012345"
};

afterEach(() => {
    vi.clearAllMocks();
});

describe("Salesforce activity services", () => {
    it("lists account tasks and events through WhatId and sorts the timeline", async () => {
        const query = vi.fn()
            .mockResolvedValueOnce({
                records: [
                    {
                        Id: "00Txx0000012345",
                        Subject: "Call",
                        ActivityDate: "2026-06-07",
                        Status: "Not Started",
                        Priority: "Normal",
                        Description: "Follow up",
                        CreatedDate: "2026-06-06T00:00:00.000Z",
                        LastModifiedDate: "2026-06-07T00:00:00.000Z"
                    }
                ]
            })
            .mockResolvedValueOnce({
                records: [
                    {
                        Id: "00Uxx0000012345",
                        Subject: "Meeting",
                        StartDateTime: "2026-06-08T10:00:00.000Z",
                        EndDateTime: "2026-06-08T11:00:00.000Z",
                        Location: "Online",
                        Description: "Discuss plan",
                        CreatedDate: "2026-06-06T00:00:00.000Z",
                        LastModifiedDate: "2026-06-08T00:00:00.000Z"
                    }
                ]
            });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(listActivities({
            parentType: "account",
            parentId: "001xx000003DGbY"
        })).resolves.toMatchObject({
            data: {
                activities: [
                    {
                        type: "event",
                        id: "00Uxx0000012345",
                        subject: "Meeting",
                        location: "Online"
                    },
                    {
                        type: "task",
                        id: "00Txx0000012345",
                        subject: "Call",
                        status: "Not Started"
                    }
                ]
            },
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Task", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Event", "queryable");
        expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE WhatId = '001xx000003DGbY'"));
        expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining("WHERE WhatId = '001xx000003DGbY'"));
    });

    it("lists contact activities through WhoId", async () => {
        const query = vi.fn()
            .mockResolvedValueOnce({ records: [] })
            .mockResolvedValueOnce({ records: [] });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(listActivities({
            parentType: "contact",
            parentId: "003xx000004TmiQ"
        })).resolves.toEqual({
            data: {
                activities: []
            },
            session
        });

        expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE WhoId = '003xx000004TmiQ'"));
        expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining("WHERE WhoId = '003xx000004TmiQ'"));
    });

    it("creates account tasks with WhatId", async () => {
        createStandardObjectMock.mockResolvedValue({
            data: { id: "00Txx0000012345", success: true },
            session
        });

        await createTaskActivity({
            parentType: "account",
            parentId: "001xx000003DGbY",
            Subject: "Call",
            Status: "Not Started"
        });

        expect(createStandardObjectMock).toHaveBeenCalledWith("Task", {
            Subject: "Call",
            Status: "Not Started",
            WhatId: "001xx000003DGbY"
        });
    });

});
