import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";

function readCountResult(result: { totalSize?: number; records?: Array<{ expr0?: number }> }) {
    return result.records?.[0]?.expr0 ?? result.totalSize ?? 0;
}

export async function countActiveUsers() {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, "User", "queryable");
        const users = await connection.query<{ expr0?: number }>("SELECT COUNT() FROM User WHERE IsActive = true");

        return {
            userCounts: {
                active: readCountResult(users)
            }
        };
    });
}
