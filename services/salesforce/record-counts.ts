import { withStandardObjectConnection } from "./client";
import { countQueryableRecords } from "./count-results";

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

export async function countRecordObjects() {
    return withStandardObjectConnection(async (connection) => {
        const countResults = await Promise.all(
            countableObjects.map(async ({ key, objectApiName }) => {
                return [key, await countQueryableRecords(connection, objectApiName)] as const;
            })
        );

        return {
            recordCounts: Object.fromEntries(countResults) as Record<RecordCountKey, number>
        };
    });
}
