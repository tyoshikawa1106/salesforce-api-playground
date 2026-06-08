import { withStandardObjectConnection } from "./client";

type UserRecord = {
    Id: string;
    Name?: string;
};

function isSalesforceId(value: string): boolean {
    return /^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/.test(value);
}

export async function getCurrentUserName() {
    return withStandardObjectConnection(async (connection, session) => {
        if (!session.userId || !isSalesforceId(session.userId)) {
            return undefined;
        }

        const response = await connection.query<UserRecord>(
            `SELECT Id, Name FROM User WHERE Id = '${session.userId}' LIMIT 1`
        );

        return response.records[0]?.Name;
    });
}
