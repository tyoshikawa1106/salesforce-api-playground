import type { Connection } from "jsforce";
import { assertObjectPermission } from "./object-permissions";

export type SalesforceCountResult = {
    totalSize?: number;
    records?: ReadonlyArray<{ expr0?: number }>;
};

export function readCountResult(result: SalesforceCountResult) {
    return result.records?.[0]?.expr0 ?? result.totalSize ?? 0;
}

export async function countQueryableRecords(
    connection: Connection,
    objectApiName: string,
    soql = `SELECT COUNT() FROM ${objectApiName}`
) {
    await assertObjectPermission(connection, objectApiName, "queryable");
    const result = await connection.query<{ expr0?: number }>(soql);

    return readCountResult(result);
}
