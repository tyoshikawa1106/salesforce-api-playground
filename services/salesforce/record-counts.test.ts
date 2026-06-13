import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";
import { countRecordObjects } from "./record-counts";

vi.mock("./client", () => ({
    withStandardObjectConnection: vi.fn()
}));

vi.mock("./object-permissions", () => ({
    assertObjectPermission: vi.fn()
}));

const withStandardObjectConnectionMock = vi.mocked(withStandardObjectConnection);
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

describe("Salesforce record count services", () => {
    it("counts configured home record objects after checking query permission", async () => {
        const query = vi.fn()
            .mockResolvedValueOnce({ records: [{ expr0: 3 }] })
            .mockResolvedValueOnce({ records: [{ expr0: 4 }] })
            .mockResolvedValueOnce({ records: [{ expr0: 5 }] })
            .mockResolvedValueOnce({ records: [{ expr0: 6 }] })
            .mockResolvedValueOnce({ records: [{ expr0: 7 }] })
            .mockResolvedValueOnce({ records: [{ expr0: 8 }] });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(countRecordObjects()).resolves.toEqual({
            data: {
                recordCounts: {
                    campaigns: 6,
                    cases: 7,
                    emailMessages: 8,
                    leads: 3,
                    opportunities: 4,
                    products: 5
                }
            },
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Lead", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Opportunity", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Product2", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Campaign", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Case", "queryable");
        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "EmailMessage", "queryable");
        expect(query).toHaveBeenNthCalledWith(1, "SELECT COUNT() FROM Lead");
        expect(query).toHaveBeenNthCalledWith(2, "SELECT COUNT() FROM Opportunity");
        expect(query).toHaveBeenNthCalledWith(3, "SELECT COUNT() FROM Product2");
        expect(query).toHaveBeenNthCalledWith(4, "SELECT COUNT() FROM Campaign");
        expect(query).toHaveBeenNthCalledWith(5, "SELECT COUNT() FROM Case");
        expect(query).toHaveBeenNthCalledWith(6, "SELECT COUNT() FROM EmailMessage");
    });

    it("falls back to totalSize when the count expression is unavailable", async () => {
        const query = vi.fn()
            .mockResolvedValueOnce({ totalSize: 1 })
            .mockResolvedValueOnce({ totalSize: 2 })
            .mockResolvedValueOnce({ totalSize: 3 })
            .mockResolvedValueOnce({ totalSize: 4 })
            .mockResolvedValueOnce({ totalSize: 5 })
            .mockResolvedValueOnce({ totalSize: 6 });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(countRecordObjects()).resolves.toMatchObject({
            data: {
                recordCounts: {
                    campaigns: 4,
                    cases: 5,
                    emailMessages: 6,
                    leads: 1,
                    opportunities: 2,
                    products: 3
                }
            }
        });
    });
});
