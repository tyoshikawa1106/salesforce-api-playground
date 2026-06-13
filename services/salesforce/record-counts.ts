import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";

type RecordCountKey =
    | "campaigns"
    | "cases"
    | "emailMessages"
    | "leads"
    | "opportunities"
    | "products";

type CountableObject = {
    key: RecordCountKey;
    objectApiName: string;
};

const countableObjects: CountableObject[] = [
    { key: "leads", objectApiName: "Lead" },
    { key: "opportunities", objectApiName: "Opportunity" },
    { key: "products", objectApiName: "Product2" },
    { key: "campaigns", objectApiName: "Campaign" },
    { key: "cases", objectApiName: "Case" },
    { key: "emailMessages", objectApiName: "EmailMessage" }
];

function readCountResult(result: { totalSize?: number; records?: Array<{ expr0?: number }> }) {
    return result.records?.[0]?.expr0 ?? result.totalSize ?? 0;
}

export async function countRecordObjects() {
    return withStandardObjectConnection(async (connection) => {
        await Promise.all(
            countableObjects.map(({ objectApiName }) =>
                assertObjectPermission(connection, objectApiName, "queryable")
            )
        );

        const countResults = await Promise.all(
            countableObjects.map(async ({ key, objectApiName }) => {
                const result = await connection.query<{ expr0?: number }>(`SELECT COUNT() FROM ${objectApiName}`);

                return [key, readCountResult(result)] as const;
            })
        );

        return {
            recordCounts: Object.fromEntries(countResults) as Record<RecordCountKey, number>
        };
    });
}
