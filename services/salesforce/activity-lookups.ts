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

type LookupRecord = AccountLookupRecord | ContactLookupRecord | UserLookupRecord;
type LookupObjectConfig = {
    objectApiName: "Account" | "Contact" | "User";
    selectFields: string;
    searchFields: readonly string[];
    emptyWhereClause?: string;
    searchWhereSuffix?: string;
};

const lookupObjectConfigs: Record<ActivityLookupObject, LookupObjectConfig> = {
    account: {
        objectApiName: "Account",
        selectFields: "Id, Name",
        searchFields: ["Name"]
    },
    contact: {
        objectApiName: "Contact",
        selectFields: "Id, Name, Account.Name",
        searchFields: ["Name", "Account.Name"]
    },
    user: {
        objectApiName: "User",
        selectFields: "Id, Name",
        searchFields: ["Name"],
        emptyWhereClause: "WHERE IsActive = true",
        searchWhereSuffix: "AND IsActive = true"
    }
};

const maxQueryLength = 80;

function escapeSoqlLikeValue(value: string): string {
    return Array.from(value, (character) => {
        if (character === "\\" || character === "'" || character === "%" || character === "_") {
            return `\\${character}`;
        }

        return character;
    }).join("");
}

function isActivityLookupObject(value: string): value is ActivityLookupObject {
    return value in lookupObjectConfigs;
}

function readLookupObject(value: string): ActivityLookupObject {
    if (isActivityLookupObject(value)) {
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
    const config = lookupObjectConfigs[object];

    if (!query) {
        return config.emptyWhereClause ?? "";
    }

    const likeValue = `%${escapeSoqlLikeValue(query)}%`;
    const searchConditions = config.searchFields
        .map((field) => `${field} LIKE '${likeValue}' ESCAPE '\\\\'`)
        .join(" OR ");

    return ["WHERE", searchConditions, config.searchWhereSuffix].filter(Boolean).join(" ");
}

function buildLookupQuery(object: ActivityLookupObject, query: string): string {
    const config = lookupObjectConfigs[object];
    const whereClause = buildLookupWhereClause(object, query);
    const orderBy = query
        ? "ORDER BY Name ASC"
        : "ORDER BY LastViewedDate DESC NULLS LAST, LastModifiedDate DESC";

    return [
        `SELECT ${config.selectFields}`,
        `FROM ${config.objectApiName}`,
        whereClause,
        orderBy,
        "LIMIT 5"
    ].filter(Boolean).join(" ");
}

function mapLookupRecords(
    object: ActivityLookupObject,
    records: LookupRecord[]
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
        const config = lookupObjectConfigs[object];

        await assertObjectPermission(connection, config.objectApiName, "queryable");
        const response = await connection.query<LookupRecord>(buildLookupQuery(object, query));

        return { options: mapLookupRecords(object, response.records) };
    });
}
