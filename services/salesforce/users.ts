import { withStandardObjectConnection } from "./client";
import { countQueryableRecords } from "./count-results";

export async function countActiveUsers() {
    return withStandardObjectConnection(async (connection) => {
        return {
            userCounts: {
                active: await countQueryableRecords(connection, "User", "SELECT COUNT() FROM User WHERE IsActive = true")
            }
        };
    });
}
