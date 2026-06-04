import type { AccountRecord, ContactRecord } from "./records";

const salesforceUserIdPattern = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;

export type RecycleBinObjectApiName = keyof typeof recycleBinObjectConfig;

export type RecycleBinItem = {
    objectApiName: RecycleBinObjectApiName;
    objectLabel: string;
    id: string;
    name: string;
    deletedAt?: string;
    deletedByName?: string;
};

type DeletedAccountRecord = AccountRecord & {
    IsDeleted?: boolean;
    LastModifiedBy?: {
        Name?: string;
    };
};

type DeletedContactRecord = ContactRecord & {
    IsDeleted?: boolean;
    LastModifiedBy?: {
        Name?: string;
    };
};

type RecycleBinObjectConfig = {
    fields: string[];
    idPrefix: string;
    label: string;
    getDeletedAt: (record: unknown) => string | undefined;
    getName: (record: unknown) => string;
};

export const recycleBinObjectConfig = {
    Account: {
        fields: ["Id", "Name", "LastModifiedDate", "LastModifiedBy.Name"],
        idPrefix: "001",
        label: "取引先",
        getDeletedAt: (record) => (record as DeletedAccountRecord).LastModifiedDate,
        getName: (record) => (record as DeletedAccountRecord).Name
    },
    Contact: {
        fields: ["Id", "FirstName", "LastName", "LastModifiedDate", "LastModifiedBy.Name"],
        idPrefix: "003",
        label: "取引先責任者",
        getDeletedAt: (record) => (record as DeletedContactRecord).LastModifiedDate,
        getName: (record) => {
            const contact = record as DeletedContactRecord;
            return [contact.FirstName, contact.LastName].filter(Boolean).join(" ") || contact.LastName;
        }
    }
} as const satisfies Record<string, RecycleBinObjectConfig>;

export function isRecycleBinObjectApiName(value: string): value is RecycleBinObjectApiName {
    return value in recycleBinObjectConfig;
}

export function getRecycleBinObjectConfig(objectApiName: RecycleBinObjectApiName) {
    return recycleBinObjectConfig[objectApiName];
}

export function getRecycleBinObjectApiNames(): RecycleBinObjectApiName[] {
    return Object.keys(recycleBinObjectConfig) as RecycleBinObjectApiName[];
}

function getDeletedByName(record: DeletedAccountRecord | DeletedContactRecord) {
    return record.LastModifiedBy?.Name;
}

export function normalizeRecycleBinRecord(
    objectApiName: RecycleBinObjectApiName,
    record: DeletedAccountRecord | DeletedContactRecord
): RecycleBinItem {
    const config = getRecycleBinObjectConfig(objectApiName);

    return {
        objectApiName,
        objectLabel: config.label,
        id: record.Id,
        name: config.getName(record),
        deletedAt: config.getDeletedAt(record),
        deletedByName: getDeletedByName(record)
    };
}

export function buildRecycleBinQuery(objectApiName: RecycleBinObjectApiName, deletedByUserId: string): string {
    const config = getRecycleBinObjectConfig(objectApiName);

    if (!salesforceUserIdPattern.test(deletedByUserId) || !deletedByUserId.startsWith("005")) {
        throw new Error("Invalid Salesforce user id.");
    }

    return [
        `SELECT ${config.fields.join(", ")}`,
        `FROM ${objectApiName}`,
        `WHERE IsDeleted = true AND LastModifiedById = '${deletedByUserId}'`,
        "ORDER BY LastModifiedDate DESC",
        "LIMIT 100"
    ].join(" ");
}
