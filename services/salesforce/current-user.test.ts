import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import { getCurrentUserName } from "./current-user";
import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";

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

describe("Salesforce current user service", () => {
    it("loads the current user name from the session user id", async () => {
        const query = vi.fn().mockResolvedValue({
            records: [
                { Id: session.userId, Name: "Yoshikawa Taiki" }
            ]
        });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(getCurrentUserName()).resolves.toEqual({
            data: "Yoshikawa Taiki",
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "User", "queryable");
        expect(query).toHaveBeenCalledWith(
            "SELECT Id, Name FROM User WHERE Id = '005xx0000012345' LIMIT 1"
        );
    });

    it("does not query when the session user id is invalid", async () => {
        const query = vi.fn();
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, { ...session, userId: "not-a-salesforce-id" }),
            session
        }));

        await expect(getCurrentUserName()).resolves.toEqual({
            data: undefined,
            session
        });

        expect(query).not.toHaveBeenCalled();
        expect(assertObjectPermissionMock).not.toHaveBeenCalled();
    });

    it("does not query when current user read permission is unavailable", async () => {
        const query = vi.fn();
        const connection = { query };

        assertObjectPermissionMock.mockRejectedValueOnce(new Error("User の参照権限がありません。"));
        withStandardObjectConnectionMock.mockImplementationOnce(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(getCurrentUserName()).rejects.toThrow("User の参照権限がありません。");

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "User", "queryable");
        expect(query).not.toHaveBeenCalled();
    });
});
