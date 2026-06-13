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
    it("counts active users after checking query permission", async () => {
        const query = vi.fn().mockResolvedValueOnce({ records: [{ expr0: 8 }] });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(countActiveUsers()).resolves.toEqual({
            data: {
                userCounts: {
                    active: 8
                }
            },
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "User", "queryable");
        expect(query).toHaveBeenCalledWith("SELECT COUNT() FROM User WHERE IsActive = true");
    });

    it("falls back to totalSize when the count expression is unavailable", async () => {
        const query = vi.fn().mockResolvedValueOnce({ totalSize: 3 });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(countActiveUsers()).resolves.toMatchObject({
            data: {
                userCounts: {
                    active: 3
                }
            }
        });
    });
});
