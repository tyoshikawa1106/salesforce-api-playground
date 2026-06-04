import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    listRecycleBinItems,
    undeleteRecycleBinItems
} from "./recycle-bin";
import { withStandardObjectConnection } from "./client";

const connectionMocks = vi.hoisted(() => ({
    query: vi.fn(),
    undelete: vi.fn(),
    sobject: vi.fn(() => ({
        undelete: connectionMocks.undelete
    }))
}));

vi.mock("./client", () => ({
    withStandardObjectConnection: vi.fn(async (operation: (connection: unknown) => Promise<unknown>) => ({
        data: await operation({
            query: connectionMocks.query,
            sobject: connectionMocks.sobject
        }),
        session: {
            accessToken: "access-token",
            instanceUrl: "https://example.my.salesforce.com",
            issuedAt: 1700000000000
        } satisfies SalesforceSession
    }))
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe("Salesforce recycle bin services", () => {
    it("lists deleted records across configured objects with scanAll query", async () => {
        connectionMocks.query
            .mockResolvedValueOnce({
                records: [
                    {
                        Id: "001xx000003DGbY",
                        Name: "Deleted Acme",
                        Industry: "Technology",
                        LastModifiedDate: "2026-06-04T10:00:00.000Z"
                    }
                ]
            })
            .mockResolvedValueOnce({
                records: [
                    {
                        Id: "003xx000004TmiQ",
                        FirstName: "Taro",
                        LastName: "Yamada",
                        Email: "taro@example.test",
                        LastModifiedDate: "2026-06-04T11:00:00.000Z"
                    }
                ]
            });

        await expect(listRecycleBinItems()).resolves.toMatchObject({
            data: {
                items: [
                    {
                        objectApiName: "Contact",
                        objectLabel: "取引先責任者",
                        id: "003xx000004TmiQ",
                        name: "Taro Yamada"
                    },
                    {
                        objectApiName: "Account",
                        objectLabel: "取引先",
                        id: "001xx000003DGbY",
                        name: "Deleted Acme"
                    }
                ]
            }
        });
        expect(connectionMocks.query).toHaveBeenCalledWith(expect.stringContaining("FROM Account"), { scanAll: true });
        expect(connectionMocks.query).toHaveBeenCalledWith(expect.stringContaining("FROM Contact"), { scanAll: true });
        expect(connectionMocks.query).not.toHaveBeenCalledWith(expect.stringContaining("ALL ROWS"), expect.anything());
    });

    it("groups selected recycle bin items by object before undelete", async () => {
        connectionMocks.undelete
            .mockResolvedValueOnce([{ id: "001xx000003DGbY", success: true, errors: [] }])
            .mockResolvedValueOnce([{ id: "003xx000004TmiQ", success: true, errors: [] }]);

        await expect(
            undeleteRecycleBinItems([
                { objectApiName: "Account", id: "001xx000003DGbY" },
                { objectApiName: "Contact", id: "003xx000004TmiQ" }
            ])
        ).resolves.toMatchObject({
            data: {
                restoreResults: [
                    { objectApiName: "Account" },
                    { objectApiName: "Contact" }
                ]
            }
        });
        expect(connectionMocks.sobject).toHaveBeenNthCalledWith(1, "Account");
        expect(connectionMocks.undelete).toHaveBeenNthCalledWith(1, ["001xx000003DGbY"]);
        expect(connectionMocks.sobject).toHaveBeenNthCalledWith(2, "Contact");
        expect(connectionMocks.undelete).toHaveBeenNthCalledWith(2, ["003xx000004TmiQ"]);
        expect(withStandardObjectConnection).toHaveBeenCalledWith(expect.any(Function));
    });
});
