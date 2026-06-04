import type { Connection, SaveResult } from "jsforce";
import type { SalesforceQueryResponse } from "@/lib/salesforce/records";
import type { RecycleBinUndeleteItem } from "@/lib/salesforce/records";
import {
    buildRecycleBinQuery,
    getRecycleBinObjectApiNames,
    normalizeRecycleBinRecord,
    type RecycleBinItem,
    type RecycleBinObjectApiName
} from "@/lib/salesforce/recycle-bin";
import { withStandardObjectConnection } from "./client";

type QueryAllConnection = Connection & {
    query<T>(soql: string, options: { scanAll: true }): Promise<SalesforceQueryResponse<T>>;
};

type UndeleteSObject = {
    undelete(ids: string[]): Promise<SaveResult | SaveResult[]>;
};

type RecycleBinRecord = {
    Id: string;
    [key: string]: unknown;
};

type UndeleteResult = {
    objectApiName: RecycleBinObjectApiName;
    results: SaveResult[];
};

function sortRecycleBinItems(items: RecycleBinItem[]) {
    return [...items].sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));
}

async function queryDeletedRecords(connection: Connection, objectApiName: RecycleBinObjectApiName) {
    const response = await (connection as QueryAllConnection).query<RecycleBinRecord>(buildRecycleBinQuery(objectApiName), {
        scanAll: true
    });

    return response.records.map((record) => normalizeRecycleBinRecord(objectApiName, record as never));
}

function groupUndeleteItems(items: RecycleBinUndeleteItem[]) {
    return items.reduce((groups, item) => {
        const objectApiName = item.objectApiName as RecycleBinObjectApiName;
        const currentIds = groups.get(objectApiName) ?? [];
        currentIds.push(item.id);
        groups.set(objectApiName, currentIds);
        return groups;
    }, new Map<RecycleBinObjectApiName, string[]>());
}

export async function listRecycleBinItems() {
    return withStandardObjectConnection(async (connection) => {
        const itemGroups = await Promise.all(
            getRecycleBinObjectApiNames().map((objectApiName) => queryDeletedRecords(connection, objectApiName))
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
            const result = await ((connection.sobject(objectApiName) as unknown) as UndeleteSObject).undelete(ids);
            restoreResults.push({
                objectApiName,
                results: Array.isArray(result) ? result : [result]
            });
        }

        return {
            restoreResults
        };
    });
}
