import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    listActivityLookupOptions,
    readActivityLookupParams
} from "./activity-lookups";
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

describe("Salesforce activity lookup services", () => {
    it("lists recently viewed account candidates when the query is empty", async () => {
        const query = vi.fn().mockResolvedValue({
            records: [
                { Id: "001xx000003DGbY", Name: "Edge Communications" }
            ]
        });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(listActivityLookupOptions({
            object: "account",
            query: ""
        })).resolves.toEqual({
            data: {
                options: [
                    {
                        id: "001xx000003DGbY",
                        label: "Edge Communications",
                        object: "account"
                    }
                ]
            },
            session
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Account", "queryable");
        expect(query).toHaveBeenCalledWith(
            "SELECT Id, Name FROM Account ORDER BY LastViewedDate DESC NULLS LAST, LastModifiedDate DESC LIMIT 5"
        );
    });

    it("searches contacts by name and account name", async () => {
        const query = vi.fn().mockResolvedValue({
            records: [
                {
                    Id: "003xx000004TmiQ",
                    Name: "Gonzalez Rose",
                    Account: { Name: "Edge Communications" }
                }
            ]
        });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(listActivityLookupOptions({
            object: "contact",
            query: "Edge"
        })).resolves.toMatchObject({
            data: {
                options: [
                    {
                        id: "003xx000004TmiQ",
                        label: "Gonzalez Rose",
                        meta: "Edge Communications",
                        object: "contact"
                    }
                ]
            }
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "Contact", "queryable");
        expect(query).toHaveBeenCalledWith(
            "SELECT Id, Name, Account.Name FROM Contact WHERE Name LIKE '%Edge%' OR Account.Name LIKE '%Edge%' ORDER BY Name ASC LIMIT 5"
        );
    });

    it("escapes LIKE wildcards and single quotes in search text", async () => {
        const query = vi.fn().mockResolvedValue({ records: [] });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await listActivityLookupOptions({
            object: "account",
            query: "O'Hara\\_100%"
        });

        expect(query).toHaveBeenCalledWith(
            "SELECT Id, Name FROM Account WHERE Name LIKE '%O\\'Hara\\\\\\_100\\%%' ORDER BY Name ASC LIMIT 5"
        );
    });

    it("limits user candidates to active users", async () => {
        const query = vi.fn().mockResolvedValue({
            records: [
                { Id: "005xx0000012345", Name: "Yoshikawa Taiki" }
            ]
        });
        const connection = { query };

        withStandardObjectConnectionMock.mockImplementation(async (operation) => ({
            data: await operation(connection as never, session),
            session
        }));

        await expect(listActivityLookupOptions({
            object: "user",
            query: "Yoshikawa"
        })).resolves.toMatchObject({
            data: {
                options: [
                    {
                        id: "005xx0000012345",
                        label: "Yoshikawa Taiki",
                        object: "user"
                    }
                ]
            }
        });

        expect(assertObjectPermissionMock).toHaveBeenCalledWith(connection, "User", "queryable");
        expect(query).toHaveBeenCalledWith(
            "SELECT Id, Name FROM User WHERE Name LIKE '%Yoshikawa%' AND IsActive = true ORDER BY Name ASC LIMIT 5"
        );
    });

    it("reads and trims lookup request params", () => {
        const request = new Request("https://app.example.test/api/activity-lookups?object=contact&q=%20Gonzalez%20");

        expect(readActivityLookupParams(request)).toEqual({
            object: "contact",
            query: "Gonzalez"
        });
    });
});
