import type { Connection } from "jsforce";
import { describe, expect, it, vi } from "vitest";
import { SalesforceApiError } from "@/lib/salesforce/client";
import { assertObjectPermission } from "./object-permissions";

function createConnectionWithDescribe(describeResult: Record<string, boolean>) {
    const describe = vi.fn().mockResolvedValue(describeResult);
    const sobject = vi.fn(() => ({ describe }));

    return {
        connection: { sobject },
        describe,
        sobject
    };
}

describe("Salesforce object permission checks", () => {
    it("returns describe metadata when the requested permission is available", async () => {
        const { connection, describe, sobject } = createConnectionWithDescribe({
            createable: true
        });

        await expect(
            assertObjectPermission(connection as unknown as Connection, "Account", "createable")
        ).resolves.toEqual({
            createable: true
        });

        expect(sobject).toHaveBeenCalledWith("Account");
        expect(describe).toHaveBeenCalledWith();
    });

    it("throws a 403 Salesforce API error when the requested permission is unavailable", async () => {
        const { connection } = createConnectionWithDescribe({
            updateable: false
        });

        const promise = assertObjectPermission(
            connection as unknown as Connection,
            "Contact",
            "updateable"
        );

        await expect(promise).rejects.toMatchObject({
            message: "Contact の更新権限がありません。",
            status: 403
        });
        await expect(promise).rejects.toBeInstanceOf(SalesforceApiError);
    });

    it("supports recycle bin restore permission errors", async () => {
        const { connection } = createConnectionWithDescribe({
            undeletable: false
        });

        const promise = assertObjectPermission(
            connection as unknown as Connection,
            "Account",
            "undeletable"
        );

        await expect(promise).rejects.toMatchObject({
            message: "Account の復元権限がありません。",
            status: 403
        });
    });
});
