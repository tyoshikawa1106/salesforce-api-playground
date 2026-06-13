import { afterEach, describe, expect, it, vi } from "vitest";
import { countQueryableRecords, readCountResult } from "./count-results";
import { assertObjectPermission } from "./object-permissions";

vi.mock("./object-permissions", () => ({
    assertObjectPermission: vi.fn()
}));

const assertObjectPermissionMock = vi.mocked(assertObjectPermission);

afterEach(() => {
    vi.clearAllMocks();
});

describe("Salesforce count result helpers", () => {
    it.each([
        ["COUNT() expression", { totalSize: 99, records: [{ expr0: 12 }] }, 12],
        ["totalSize fallback", { totalSize: 7 }, 7],
        ["missing count value", { records: [] }, 0]
    ] as const)("reads %s", (_label, result, expected) => {
        expect(readCountResult(result)).toBe(expected);
    });

    it("counts queryable object records after checking permission", async () => {
        const query = vi.fn().mockResolvedValueOnce({ records: [{ expr0: 4 }] });
        const connection = { query };

        await expect(countQueryableRecords(connection as never, "Account")).resolves.toBe(4);

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Account", "queryable");
        expect(query).toHaveBeenCalledWith("SELECT COUNT() FROM Account");
    });

    it("supports custom count queries", async () => {
        const query = vi.fn().mockResolvedValueOnce({ totalSize: 2 });
        const connection = { query };

        await expect(
            countQueryableRecords(connection as never, "User", "SELECT COUNT() FROM User WHERE IsActive = true")
        ).resolves.toBe(2);

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "User", "queryable");
        expect(query).toHaveBeenCalledWith("SELECT COUNT() FROM User WHERE IsActive = true");
    });
});
