import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";
import { countActiveUsers } from "./users";

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

describe("Salesforce user services", () => {
    it.each([
        ["COUNT() expression", { records: [{ expr0: 8 }] }, 8],
        ["totalSize fallback", { totalSize: 3 }, 3]
    ] as const)("counts active users from %s", async (_label, countResult, expectedCount) => {
        const query = vi.fn().mockResolvedValueOnce(countResult);
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(countActiveUsers()).resolves.toEqual({
            data: {
                userCounts: {
                    active: expectedCount
                }
            },
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "User", "queryable");
        expect(query).toHaveBeenCalledWith("SELECT COUNT() FROM User WHERE IsActive = true");
    });
});
