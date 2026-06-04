import type { AccountRecord, ContactRecord } from "./records";

export type RecycleBinObjectApiName = keyof typeof recycleBinObjectConfig;

export type RecycleBinItem = {
    objectApiName: RecycleBinObjectApiName;
    objectLabel: string;
    id: string;
    name: string;
    deletedAt?: string;
    displayText?: string;
};

type DeletedAccountRecord = AccountRecord & {
    IsDeleted?: boolean;
};

type DeletedContactRecord = ContactRecord & {
    IsDeleted?: boolean;
};

type RecycleBinObjectConfig = {
    fields: string[];
    idPrefix: string;
    label: string;
    getDeletedAt: (record: unknown) => string | undefined;
    getDisplayText: (record: unknown) => string | undefined;
    getName: (record: unknown) => string;
};

export const recycleBinObjectConfig = {
    Account: {
        fields: ["Id", "Name", "Phone", "Website", "Industry", "Type", "BillingCity", "BillingCountry", "LastModifiedDate"],
        idPrefix: "001",
        label: "取引先",
        getDeletedAt: (record) => (record as DeletedAccountRecord).LastModifiedDate,
        getDisplayText: (record) => {
            const account = record as DeletedAccountRecord;
            return [account.Phone, account.Industry, account.BillingCity].filter(Boolean).join(" / ") || undefined;
        },
        getName: (record) => (record as DeletedAccountRecord).Name
    },
    Contact: {
        fields: ["Id", "FirstName", "LastName", "Email", "Phone", "Title", "AccountId", "Account.Name", "LastModifiedDate"],
        idPrefix: "003",
        label: "取引先責任者",
        getDeletedAt: (record) => (record as DeletedContactRecord).LastModifiedDate,
        getDisplayText: (record) => {
            const contact = record as DeletedContactRecord;
            return [contact.Email, contact.Title, contact.Account?.Name].filter(Boolean).join(" / ") || undefined;
        },
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
        displayText: config.getDisplayText(record)
    };
}

export function buildRecycleBinQuery(objectApiName: RecycleBinObjectApiName): string {
    const config = getRecycleBinObjectConfig(objectApiName);

    return [
        `SELECT ${config.fields.join(", ")}`,
        `FROM ${objectApiName}`,
        "WHERE IsDeleted = true",
        "ORDER BY LastModifiedDate DESC",
        "LIMIT 100"
    ].join(" ");
}
