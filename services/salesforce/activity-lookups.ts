import { SalesforceApiError } from "@/lib/salesforce/client";
import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";

export type ActivityLookupObject = "account" | "contact" | "user";

export type ActivityLookupResult = {
    id: string;
    label: string;
    meta?: string;
    object: ActivityLookupObject;
};

type AccountLookupRecord = {
    Id: string;
    Name?: string;
};

type ContactLookupRecord = {
    Id: string;
    Name?: string;
    Account?: {
        Name?: string;
    };
};

type UserLookupRecord = {
    Id: string;
    Name?: string;
};

const lookupObjectToSalesforceObject = {
    account: "Account",
    contact: "Contact",
    user: "User"
} as const satisfies Record<ActivityLookupObject, string>;

const maxQueryLength = 80;

function escapeSoqlStringLiteral(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function escapeSoqlLikeValue(value: string): string {
    return escapeSoqlStringLiteral(value)
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
}

function readLookupObject(value: string): ActivityLookupObject {
    if (value === "account" || value === "contact" || value === "user") {
        return value;
    }

    throw new SalesforceApiError("Lookup 対象が不正です。", 400);
}

export function readActivityLookupParams(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const object = readLookupObject(searchParams.get("object") ?? "");
    const query = (searchParams.get("q") ?? "").trim().slice(0, maxQueryLength);

    return { object, query };
}

function buildLookupWhereClause(object: ActivityLookupObject, query: string): string {
    if (!query) {
        return "";
    }

    const likeValue = `%${escapeSoqlLikeValue(query)}%`;
    const nameCondition = `Name LIKE '${likeValue}' ESCAPE '\\\\'`;

    if (object === "contact") {
        return `WHERE ${nameCondition} OR Account.Name LIKE '${likeValue}' ESCAPE '\\\\'`;
    }

    return `WHERE ${nameCondition}`;
}

function buildLookupQuery(object: ActivityLookupObject, query: string): string {
    const whereClause = buildLookupWhereClause(object, query);
    const orderBy = query
        ? "ORDER BY Name ASC"
        : "ORDER BY LastViewedDate DESC NULLS LAST, LastModifiedDate DESC";

    if (object === "account") {
        return [
            "SELECT Id, Name",
            "FROM Account",
            whereClause,
            orderBy,
            "LIMIT 5"
        ].filter(Boolean).join(" ");
    }

    if (object === "contact") {
        return [
            "SELECT Id, Name, Account.Name",
            "FROM Contact",
            whereClause,
            orderBy,
            "LIMIT 5"
        ].filter(Boolean).join(" ");
    }

    return [
        "SELECT Id, Name",
        "FROM User",
        whereClause || "WHERE IsActive = true",
        whereClause ? "AND IsActive = true" : "",
        orderBy,
        "LIMIT 5"
    ].filter(Boolean).join(" ");
}

function mapLookupRecords(
    object: "account",
    records: AccountLookupRecord[]
): ActivityLookupResult[];
function mapLookupRecords(
    object: "contact",
    records: ContactLookupRecord[]
): ActivityLookupResult[];
function mapLookupRecords(
    object: "user",
    records: UserLookupRecord[]
): ActivityLookupResult[];
function mapLookupRecords(
    object: ActivityLookupObject,
    records: Array<AccountLookupRecord | ContactLookupRecord | UserLookupRecord>
): ActivityLookupResult[] {
    return records
        .map((record): ActivityLookupResult | null => {
            if (!record.Name) {
                return null;
            }

            return {
                id: record.Id,
                label: record.Name,
                meta: object === "contact" ? (record as ContactLookupRecord).Account?.Name : undefined,
                object
            };
        })
        .filter((record): record is ActivityLookupResult => record !== null);
}

export async function listActivityLookupOptions({
    object,
    query
}: {
    object: ActivityLookupObject;
    query: string;
}) {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, lookupObjectToSalesforceObject[object], "queryable");

        if (object === "account") {
            const response = await connection.query<AccountLookupRecord>(buildLookupQuery(object, query));
            return { options: mapLookupRecords(object, response.records) };
        }

        if (object === "contact") {
            const response = await connection.query<ContactLookupRecord>(buildLookupQuery(object, query));
            return { options: mapLookupRecords(object, response.records) };
        }

        const response = await connection.query<UserLookupRecord>(buildLookupQuery(object, query));
        return { options: mapLookupRecords(object, response.records) };
    });
}
