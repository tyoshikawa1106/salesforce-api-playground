import type { Connection, SaveResult } from "jsforce";
import {
    createdSalesforceResult,
    emptySalesforceResult,
    withIntegrationConnection,
    withStandardObjectConnection
} from "./client";
import { assertObjectPermission } from "./object-permissions";

type CreatedRecordResult = ReturnType<typeof createdSalesforceResult>;
type EmptyRecordResult = ReturnType<typeof emptySalesforceResult>;
type BulkDeleteResult = {
    results: SaveResult[];
};
type SalesforceRecordConnectionRunner<TData, TResult> = (
    operation: (connection: Connection) => Promise<TData>
) => Promise<TResult>;

function createObject<TInput extends object, TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<CreatedRecordResult, TResult>,
    objectName: string,
    input: TInput
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "createable");
        const result = await connection.sobject(objectName).create(input);
        return createdSalesforceResult(result);
    });
}

function updateObject<TInput extends object, TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<EmptyRecordResult, TResult>,
    objectName: string,
    id: string,
    input: TInput
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "updateable");
        const result = await connection.sobject(objectName).update({ Id: id, ...input });
        return emptySalesforceResult(result);
    });
}

function deleteObject<TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<EmptyRecordResult, TResult>,
    objectName: string,
    id: string
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "deletable");
        const result = await connection.sobject(objectName).destroy(id);
        return emptySalesforceResult(result);
    });
}

function deleteObjects<TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<BulkDeleteResult, TResult>,
    objectName: string,
    ids: string[]
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "deletable");
        const results = await connection.sobject(objectName).destroy(ids);
        return {
            results: Array.isArray(results) ? results : [results]
        };
    });
}

export function createStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return createObject(withStandardObjectConnection, objectName, input);
}

export function updateStandardObject<TInput extends object>(objectName: string, id: string, input: TInput) {
    return updateObject(withStandardObjectConnection, objectName, id, input);
}

export function deleteStandardObject(objectName: string, id: string) {
    return deleteObject(withStandardObjectConnection, objectName, id);
}

export function deleteStandardObjects(objectName: string, ids: string[]) {
    return deleteObjects(withStandardObjectConnection, objectName, ids);
}

export function createIntegrationStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return createObject(withIntegrationConnection, objectName, input);
}

export function updateIntegrationStandardObject<TInput extends object>(objectName: string, id: string, input: TInput) {
    return updateObject(withIntegrationConnection, objectName, id, input);
}
