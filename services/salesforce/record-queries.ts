import type {
    AccountRecord,
    ContactRecord,
    SearchResultItem
} from "@/lib/salesforce/records";
import { accountFieldNames, contactFieldNames } from "@/lib/salesforce/record-fields";
import { DEFAULT_SALESFORCE_QUERY_LIMIT } from "@/lib/salesforce/query-limits";

const accountSearchFields = [
    "Id",
    ...accountFieldNames,
    "CreatedDate",
    "LastModifiedDate"
] as const;

const contactSearchFields = [
    "Id",
    ...contactFieldNames,
    "Account.Name",
    "CreatedDate",
    "LastModifiedDate"
] as const;

const accountListQueryFields = [
    ...accountSearchFields,
    "LastModifiedBy.Name"
] as const;

const contactListQueryFields = [
    ...contactSearchFields,
    "LastModifiedBy.Name"
] as const;

export const accountListQuery = [
    `SELECT ${accountListQueryFields.join(", ")}`,
    "FROM Account",
    "ORDER BY LastModifiedDate DESC",
    `LIMIT ${DEFAULT_SALESFORCE_QUERY_LIMIT}`
].join(" ");

export const contactListQuery = [
    `SELECT ${contactListQueryFields.join(", ")}`,
    "FROM Contact",
    "ORDER BY LastModifiedDate DESC",
    `LIMIT ${DEFAULT_SALESFORCE_QUERY_LIMIT}`
].join(" ");

const soslReservedCharacters = /[?&|!{}[\]()^~*:\\"'+-]/g;

export type SalesforceSearchRecord = Partial<AccountRecord & ContactRecord> & {
    attributes?: {
        type?: string;
    };
};

function escapeSoslTerm(term: string): string {
    return term.replace(soslReservedCharacters, "\\$&");
}

function withOptionalAccountRecordTypeId(fields: readonly string[], includeRecordTypeId: boolean) {
    return includeRecordTypeId
        ? fields.flatMap((field) => field === "Id" ? ["Id", "RecordTypeId"] : [field])
        : [...fields];
}

export function buildAccountListQuery(includeRecordTypeId = false): string {
    const fields = withOptionalAccountRecordTypeId(accountListQueryFields, includeRecordTypeId);

    return [
        `SELECT ${fields.join(", ")}`,
        "FROM Account",
        "ORDER BY LastModifiedDate DESC",
        `LIMIT ${DEFAULT_SALESFORCE_QUERY_LIMIT}`
    ].join(" ");
}

export function buildGlobalSearchSosl(query: string, includeAccountRecordTypeId = false): string {
    const escapedTerms = query
        .trim()
        .split(/\s+/)
        .map(escapeSoslTerm)
        .filter(Boolean);
    const searchExpression = `${escapedTerms.join(" ")}*`;

    const accountFields = withOptionalAccountRecordTypeId(accountSearchFields, includeAccountRecordTypeId);

    return [
        `FIND {${searchExpression}} IN ALL FIELDS RETURNING`,
        `Account(${accountFields.join(", ")} LIMIT 5),`,
        `Contact(${contactSearchFields.join(", ")} LIMIT 5)`
    ].join(" ");
}

export function toSearchResultItem(record: SalesforceSearchRecord): SearchResultItem | null {
    if (record.attributes?.type === "Account" && record.Id && record.Name) {
        return {
            type: "account",
            record: {
                Id: record.Id,
                Name: record.Name,
                RecordTypeId: record.RecordTypeId,
                Phone: record.Phone,
                Website: record.Website,
                Industry: record.Industry,
                Type: record.Type,
                BillingCity: record.BillingCity,
                BillingCountry: record.BillingCountry,
                CreatedDate: record.CreatedDate,
                LastModifiedDate: record.LastModifiedDate
            }
        };
    }

    if (record.attributes?.type === "Contact" && record.Id && record.LastName) {
        return {
            type: "contact",
            record: {
                Id: record.Id,
                FirstName: record.FirstName,
                LastName: record.LastName,
                Email: record.Email,
                Phone: record.Phone,
                Title: record.Title,
                Department: record.Department,
                AccountId: record.AccountId,
                Account: record.Account,
                CreatedDate: record.CreatedDate,
                LastModifiedDate: record.LastModifiedDate
            }
        };
    }

    return null;
}
