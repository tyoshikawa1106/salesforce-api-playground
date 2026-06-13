import { afterEach, describe, expect, it, vi } from "vitest";
import { homeRecordCountObjectConfigs } from "@/lib/playground-record-counts";
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

const countValues = [3, 4, 5, 6, 7, 8];

function mockCountQueryResults(values: number[], resultKey: "expr0" | "totalSize") {
    return vi.fn().mockImplementation(async () => {
        const value = values.shift() ?? 0;

        return resultKey === "expr0"
            ? { records: [{ expr0: value }] }
            : { totalSize: value };
    });
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("Salesforce record count services", () => {
    it("counts configured home record objects after checking query permission", async () => {
        const query = mockCountQueryResults([...countValues], "expr0");
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

        homeRecordCountObjectConfigs.forEach(({ objectApiName }, index) => {
            expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, objectApiName, "queryable");
            expect(query).toHaveBeenNthCalledWith(index + 1, `SELECT COUNT() FROM ${objectApiName}`);
        });
    });

    it("falls back to totalSize when the count expression is unavailable", async () => {
        const query = mockCountQueryResults([1, 2, 3, 4, 5, 6], "totalSize");
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
