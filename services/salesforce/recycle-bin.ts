import type { Connection } from "jsforce";
import { SalesforceApiError } from "@/lib/salesforce/client";
import type { SalesforceQueryResponse } from "@/lib/salesforce/records";
import type { RecycleBinUndeleteItem } from "@/lib/salesforce/records";
import type { SalesforceSession } from "@/lib/salesforce/session";
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

type UndeleteResultItem = {
    id?: string | null;
    success: boolean;
    errors: unknown[];
};

type UndeleteConnection = Connection & {
    soap: {
        undelete(ids: string[]): Promise<UndeleteResultItem[]>;
    };
};

type RecycleBinRecord = {
    Id: string;
    [key: string]: unknown;
};

type UndeleteResult = {
    objectApiName: RecycleBinObjectApiName;
    results: UndeleteResultItem[];
};

function getSalesforceResultErrorMessage(error: unknown): string | null {
    if (typeof error === "object" && error !== null) {
        const candidate = error as { message?: unknown; statusCode?: unknown };
        if (typeof candidate.message === "string" && candidate.message.trim()) {
            return typeof candidate.statusCode === "string" && candidate.statusCode.trim()
                ? `${candidate.statusCode}: ${candidate.message}`
                : candidate.message;
        }
    }

    return null;
}

function buildRecycleBinFailureMessage(results: UndeleteResultItem[]) {
    const messages = results
        .flatMap((result) => result.errors)
        .map(getSalesforceResultErrorMessage)
        .filter((message): message is string => Boolean(message));

    if (messages.length === 0) {
        return "Recycle Bin operation failed.";
    }

    return [...new Set(messages)].join(" / ");
}

function sortRecycleBinItems(items: RecycleBinItem[]) {
    return [...items].sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));
}

function requireSessionUserId(session: SalesforceSession): string {
    if (!session.userId) {
        throw new SalesforceApiError("Salesforce user id is unavailable.", 500);
    }

    return session.userId;
}

async function queryDeletedRecords(connection: Connection, objectApiName: RecycleBinObjectApiName, deletedByUserId: string) {
    const response = await (connection as QueryAllConnection).query<RecycleBinRecord>(buildRecycleBinQuery(objectApiName, deletedByUserId), {
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

function assertRecycleBinResultsSucceeded(results: UndeleteResultItem[]) {
    const failedResults = results.filter((result) => !result.success);

    if (failedResults.length > 0) {
        throw new SalesforceApiError(buildRecycleBinFailureMessage(failedResults), 400, failedResults.flatMap((result) => result.errors));
    }
}

export async function listRecycleBinItems() {
    return withStandardObjectConnection(async (connection, session) => {
        const deletedByUserId = requireSessionUserId(session);
        const itemGroups = await Promise.all(
            getRecycleBinObjectApiNames().map((objectApiName) => queryDeletedRecords(connection, objectApiName, deletedByUserId))
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
