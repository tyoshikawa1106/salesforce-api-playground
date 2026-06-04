import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    listRecycleBinItems,
    undeleteRecycleBinItems
} from "./recycle-bin";
import { withStandardObjectConnection } from "./client";

const connectionMocks = vi.hoisted(() => ({
    query: vi.fn(),
    undelete: vi.fn()
}));

vi.mock("./client", () => ({
    withStandardObjectConnection: vi.fn(async (operation: (connection: unknown, session: SalesforceSession) => Promise<unknown>) => {
        const session = {
            accessToken: "access-token",
            instanceUrl: "https://example.my.salesforce.com",
            issuedAt: 1700000000000,
            userId: "005xx0000012345"
        } satisfies SalesforceSession;

        return {
            data: await operation({
                query: connectionMocks.query,
                soap: {
                    undelete: connectionMocks.undelete
                }
            }, session),
            session
        };
    })
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
                        LastModifiedDate: "2026-06-04T10:00:00.000Z",
                        LastModifiedBy: {
                            Name: "Taro Admin"
                        }
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
                        LastModifiedDate: "2026-06-04T11:00:00.000Z",
                        LastModifiedBy: {
                            Name: "Taro Admin"
                        }
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
                        name: "Taro Yamada",
                        deletedByName: "Taro Admin"
                    },
                    {
                        objectApiName: "Account",
                        objectLabel: "取引先",
                        id: "001xx000003DGbY",
                        name: "Deleted Acme",
                        deletedByName: "Taro Admin"
                    }
                ]
            }
        });
        expect(connectionMocks.query).toHaveBeenCalledWith(expect.stringContaining("FROM Account"), { scanAll: true });
        expect(connectionMocks.query).toHaveBeenCalledWith(expect.stringContaining("FROM Contact"), { scanAll: true });
        expect(connectionMocks.query).toHaveBeenCalledWith(expect.stringContaining("LastModifiedById = '005xx0000012345'"), { scanAll: true });
        expect(connectionMocks.query).not.toHaveBeenCalledWith(expect.stringContaining("ALL ROWS"), expect.anything());
    });

    it("groups selected recycle bin items by object before SOAP undelete", async () => {
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
        expect(connectionMocks.undelete).toHaveBeenNthCalledWith(1, ["001xx000003DGbY"]);
        expect(connectionMocks.undelete).toHaveBeenNthCalledWith(2, ["003xx000004TmiQ"]);
        expect(withStandardObjectConnection).toHaveBeenCalledWith(expect.any(Function));
    });

});
