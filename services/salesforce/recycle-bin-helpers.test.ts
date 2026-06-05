import { describe, expect, it } from "vitest";
import { SalesforceApiError } from "@/lib/salesforce/client";
import {
    assertRecycleBinResultsSucceeded,
    groupUndeleteItems,
    requireSessionUserId,
    sortRecycleBinItems
} from "./recycle-bin-helpers";

describe("Salesforce recycle bin helpers", () => {
    it("sorts recycle bin items by deleted date descending without mutating the input", () => {
        const items = [
            {
                objectApiName: "Account",
                objectLabel: "取引先",
                id: "001xx000003DGbY",
                name: "Old Account",
                deletedAt: "2026-06-04T10:00:00.000Z"
            },
            {
                objectApiName: "Contact",
                objectLabel: "取引先責任者",
                id: "003xx000004TmiQ",
                name: "New Contact",
                deletedAt: "2026-06-04T11:00:00.000Z"
            }
        ] as const;

        expect(sortRecycleBinItems([...items]).map((item) => item.id)).toEqual([
            "003xx000004TmiQ",
            "001xx000003DGbY"
        ]);
        expect(items.map((item) => item.id)).toEqual([
            "001xx000003DGbY",
            "003xx000004TmiQ"
        ]);
    });

    it("groups undelete ids by object type in selection order", () => {
        const groups = groupUndeleteItems([
            { objectApiName: "Account", id: "001xx000003DGbY" },
            { objectApiName: "Contact", id: "003xx000004TmiQ" },
            { objectApiName: "Account", id: "001xx000003DGbZ" }
        ]);

        expect([...groups]).toEqual([
            ["Account", ["001xx000003DGbY", "001xx000003DGbZ"]],
            ["Contact", ["003xx000004TmiQ"]]
        ]);
    });

    it("requires a Salesforce session user id", () => {
        expect(requireSessionUserId({
            accessToken: "access-token",
            instanceUrl: "https://example.my.salesforce.com",
            issuedAt: 1700000000000,
            userId: "005xx0000012345"
        })).toBe("005xx0000012345");

        expect(() => requireSessionUserId({
            accessToken: "access-token",
            instanceUrl: "https://example.my.salesforce.com",
            issuedAt: 1700000000000
        })).toThrow("Salesforce user id is unavailable.");
    });

    it("throws a Salesforce API error with unique restore failure messages", () => {
        const errors = [
            { statusCode: "ENTITY_IS_DELETED", message: "Record is deleted" },
            { statusCode: "ENTITY_IS_DELETED", message: "Record is deleted" }
        ];

        const promise = () => assertRecycleBinResultsSucceeded([
            { id: "001xx000003DGbY", success: false, errors },
            { id: "003xx000004TmiQ", success: false, errors: [{ message: "Access denied" }] }
        ]);

        expect(promise).toThrow("ENTITY_IS_DELETED: Record is deleted / Access denied");
        expect(promise).toThrow(SalesforceApiError);
    });
});
