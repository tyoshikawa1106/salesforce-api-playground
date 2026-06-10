import type { RecycleBinUndeleteItem } from "@/lib/salesforce/records";
import {
    getRecycleBinObjectApiNames,
    type RecycleBinObjectApiName
} from "@/lib/salesforce/recycle-bin";
import { withStandardObjectConnection } from "./client";
import {
    assertRecycleBinQueryPermission,
    assertRecycleBinRestorePermission,
    assertRecycleBinResultsSucceeded,
    groupUndeleteItems,
    queryDeletedRecords,
    requireSessionUserId,
    sortRecycleBinItems,
    type UndeleteConnection,
    type UndeleteResultItem
} from "./recycle-bin-helpers";

type UndeleteResult = {
    objectApiName: RecycleBinObjectApiName;
    results: UndeleteResultItem[];
};

export async function listRecycleBinItems() {
    return withStandardObjectConnection(async (connection, session) => {
        const deletedByUserId = requireSessionUserId(session);
        const objectApiNames = getRecycleBinObjectApiNames();

        for (const objectApiName of objectApiNames) {
            await assertRecycleBinQueryPermission(connection, objectApiName);
        }

        const itemGroups = await Promise.all(
            objectApiNames.map((objectApiName) => queryDeletedRecords(connection, objectApiName, deletedByUserId))
        );

        return {
            items: sortRecycleBinItems(itemGroups.flat())
        };
    });
}

export async function undeleteRecycleBinItems(items: RecycleBinUndeleteItem[]) {
    return withStandardObjectConnection(async (connection) => {
        const groups = groupUndeleteItems(items);
        const restoreResults: UndeleteResult[] = [];

        for (const [objectApiName, ids] of groups) {
            await assertRecycleBinRestorePermission(connection, objectApiName);
            const result = await (connection as UndeleteConnection).soap.undelete(ids);
            assertRecycleBinResultsSucceeded(result);
            restoreResults.push({
                objectApiName,
                results: result
            });
        }

        return {
            restoreResults
        };
    });
}
