import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    createEventActivity,
    createTaskActivity,
    deleteEventActivity,
    deleteTaskActivity,
    getEventActivity,
    getTaskActivity,
    listActivities,
    updateEventActivity,
    updateTaskActivity
} from "./activities";
import { withStandardObjectConnection } from "./client";
import { createStandardObject, deleteStandardObject, updateStandardObject } from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";

vi.mock("./client", () => ({
    withStandardObjectConnection: vi.fn()
}));

vi.mock("./object-mutations", () => ({
    createStandardObject: vi.fn(),
    deleteStandardObject: vi.fn(),
    updateStandardObject: vi.fn()
}));

vi.mock("./object-permissions", () => ({
    assertObjectPermission: vi.fn()
}));

const withStandardObjectConnectionMock = vi.mocked(withStandardObjectConnection);
const createStandardObjectMock = vi.mocked(createStandardObject);
const deleteStandardObjectMock = vi.mocked(deleteStandardObject);
const updateStandardObjectMock = vi.mocked(updateStandardObject);
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
                        WhoId: "003xx000004TmiQ",
                        Who: { Name: "Gonzalez Rose" },
                        OwnerId: "005xx0000012345",
                        Owner: { Name: "Taro Admin" },
                        WhatId: "001xx000003DGbY",
                        What: { Name: "Edge Communications" },
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
                        WhoId: "003xx000004TmiQ",
                        Who: { Name: "Gonzalez Rose" },
                        OwnerId: "005xx0000012345",
                        Owner: { Name: "Taro Admin" },
                        WhatId: "001xx000003DGbY",
                        What: { Name: "Edge Communications" },
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
                        ownerName: "Taro Admin",
                        whatName: "Edge Communications",
                        location: "Online"
                    },
                    {
                        type: "task",
                        id: "00Txx0000012345",
                        subject: "Call",
                        ownerName: "Taro Admin",
                        whoName: "Gonzalez Rose",
                        whatName: "Edge Communications",
                        status: "Not Started"
                    }
                ]
            },
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Task", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Event", "queryable");
        expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE WhatId = '001xx000003DGbY'"));
        expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining("LIMIT 200"));
        expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining("WHERE WhatId = '001xx000003DGbY'"));
        expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining("LIMIT 200"));
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

    it("creates contact tasks with selected task lookups", async () => {
        createStandardObjectMock.mockResolvedValue({
            data: { id: "00Txx0000012345", success: true },
            session
        });

        await createTaskActivity({
            parentType: "contact",
            parentId: "003xx000004TmiQ",
            Subject: "Call",
            ActivityDate: "2026-06-08",
            OwnerId: "005xx0000012345",
            WhatId: "001xx000003DGbY",
            Status: "Not Started"
        });

        expect(createStandardObjectMock).toHaveBeenCalledWith("Task", {
            Subject: "Call",
            ActivityDate: "2026-06-08",
            OwnerId: "005xx0000012345",
            Status: "Not Started",
            WhoId: "003xx000004TmiQ",
            WhatId: "001xx000003DGbY"
        });
    });

    it("updates task status", async () => {
        updateStandardObjectMock.mockResolvedValue({
            data: {},
            session
        });

        await updateTaskActivity("00Txx0000012345", {
            Status: "Completed"
        });

        expect(updateStandardObjectMock).toHaveBeenCalledWith("Task", "00Txx0000012345", {
            Status: "Completed"
        });
    });

    it("gets a task activity by id", async () => {
        const query = vi.fn().mockResolvedValueOnce({
            records: [{
                Id: "00Txx0000012345",
                Subject: "Call",
                OwnerId: "005xx0000012345",
                Owner: { Name: "Taro Admin" }
            }]
        });
        const connection = { query };
        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(getTaskActivity("00Txx0000012345")).resolves.toMatchObject({
            data: {
                activity: {
                    type: "task",
                    id: "00Txx0000012345",
                    ownerName: "Taro Admin"
                }
            },
            session
        });
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Task", "queryable");
        expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE Id = '00Txx0000012345'"));
    });

    it("updates and deletes event activities", async () => {
        updateStandardObjectMock.mockResolvedValue({ data: {}, session });
        deleteStandardObjectMock.mockResolvedValue({ data: {}, session });

        await updateEventActivity("00Uxx0000012345", { Location: "Online" });
        await deleteEventActivity("00Uxx0000012345");
        await deleteTaskActivity("00Txx0000012345");

        expect(updateStandardObjectMock).toHaveBeenCalledWith("Event", "00Uxx0000012345", {
            Location: "Online"
        });
        expect(deleteStandardObjectMock).toHaveBeenCalledWith("Event", "00Uxx0000012345");
        expect(deleteStandardObjectMock).toHaveBeenCalledWith("Task", "00Txx0000012345");
    });

    it("creates contact events with WhoId", async () => {
        createStandardObjectMock.mockResolvedValue({
            data: { id: "00Uxx0000012345", success: true },
            session
        });

        await createEventActivity({
            parentType: "contact",
            parentId: "003xx000004TmiQ",
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00:00.000Z",
            EndDateTime: "2026-06-08T11:00:00.000Z",
            OwnerId: "005xx0000012345",
            WhatId: "001xx000003DGbY",
            Location: "Online"
        });

        expect(createStandardObjectMock).toHaveBeenCalledWith("Event", {
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00:00.000Z",
            EndDateTime: "2026-06-08T11:00:00.000Z",
            OwnerId: "005xx0000012345",
            Location: "Online",
            WhoId: "003xx000004TmiQ",
            WhatId: "001xx000003DGbY"
        });
    });

    it("gets an event activity by id", async () => {
        const query = vi.fn().mockResolvedValueOnce({
            records: [{
                Id: "00Uxx0000012345",
                Subject: "Meeting",
                OwnerId: "005xx0000012345",
                Owner: { Name: "Taro Admin" }
            }]
        });
        const connection = { query };
        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(getEventActivity("00Uxx0000012345")).resolves.toMatchObject({
            data: {
                activity: {
                    type: "event",
                    id: "00Uxx0000012345",
                    ownerName: "Taro Admin"
                }
            },
            session
        });
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Event", "queryable");
    });

});
