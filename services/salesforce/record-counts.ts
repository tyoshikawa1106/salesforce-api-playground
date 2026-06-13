import type { HomeRecordCounts } from "@/lib/playground-record-counts";
import { homeRecordCountObjectConfigs } from "@/lib/playground-record-counts";
import { withStandardObjectConnection } from "./client";
import { countQueryableRecords } from "./count-results";

export async function countRecordObjects() {
    return withStandardObjectConnection(async (connection) => {
        const countResults = await Promise.all(
            homeRecordCountObjectConfigs.map(async ({ key, objectApiName }) => {
                return [key, await countQueryableRecords(connection, objectApiName)] as const;
            })
        );

        return {
            recordCounts: Object.fromEntries(countResults) as HomeRecordCounts
        };
    });
}
