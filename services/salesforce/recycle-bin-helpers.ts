import type { Connection } from "jsforce";
import { SalesforceApiError } from "@/lib/salesforce/client";
import type {
    RecycleBinUndeleteItem,
    SalesforceQueryResponse
} from "@/lib/salesforce/records";
import type { SalesforceSession } from "@/lib/salesforce/session";
import {
    buildRecycleBinQuery,
    normalizeRecycleBinRecord,
    type RecycleBinItem,
    type RecycleBinObjectApiName
} from "@/lib/salesforce/recycle-bin";
import { assertObjectPermission } from "./object-permissions";

type QueryAllConnection = Connection & {
    query<T>(soql: string, options: { scanAll: true }): Promise<SalesforceQueryResponse<T>>;
};

export type UndeleteResultItem = {
    id?: string | null;
    success: boolean;
    errors: unknown[];
};

export type UndeleteConnection = Connection & {
    soap: {
        undelete(ids: string[]): Promise<UndeleteResultItem[]>;
    };
};

type RecycleBinRecord = {
    Id: string;
    [key: string]: unknown;
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

export function sortRecycleBinItems(items: RecycleBinItem[]) {
    return [...items].sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));
}

export function requireSessionUserId(session: SalesforceSession): string {
    if (!session.userId) {
        throw new SalesforceApiError("Salesforce user id is unavailable.", 500);
    }

    return session.userId;
}

export async function queryDeletedRecords(
    connection: Connection,
    objectApiName: RecycleBinObjectApiName,
    deletedByUserId: string
) {
    const response = await (connection as QueryAllConnection).query<RecycleBinRecord>(
        buildRecycleBinQuery(objectApiName, deletedByUserId),
        { scanAll: true }
    );

    return response.records.map((record) => normalizeRecycleBinRecord(objectApiName, record as never));
}

export function groupUndeleteItems(items: RecycleBinUndeleteItem[]) {
    return items.reduce((groups, item) => {
        const objectApiName = item.objectApiName as RecycleBinObjectApiName;
        const currentIds = groups.get(objectApiName) ?? [];
        currentIds.push(item.id);
        groups.set(objectApiName, currentIds);
        return groups;
    }, new Map<RecycleBinObjectApiName, string[]>());
}

export async function assertRecycleBinQueryPermission(
    connection: Connection,
    objectApiName: RecycleBinObjectApiName
) {
    await assertObjectPermission(connection, objectApiName, "queryable");
}

export async function assertRecycleBinRestorePermission(
    connection: Connection,
    objectApiName: RecycleBinObjectApiName
) {
    await assertObjectPermission(connection, objectApiName, "undeletable");
}

export function assertRecycleBinResultsSucceeded(results: UndeleteResultItem[]) {
    const failedResults = results.filter((result) => !result.success);

    if (failedResults.length > 0) {
        throw new SalesforceApiError(
            buildRecycleBinFailureMessage(failedResults),
            400,
            failedResults.flatMap((result) => result.errors)
        );
    }
}
