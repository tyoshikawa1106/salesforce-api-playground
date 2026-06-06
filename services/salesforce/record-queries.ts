import type {
    AccountRecord,
    ContactRecord,
    SearchResultItem
} from "@/lib/salesforce/records";
import { accountFieldNames, contactFieldNames } from "@/lib/salesforce/record-fields";

export const accountQueryFields = [
    "Id",
    ...accountFieldNames,
    "LastModifiedDate"
] as const;

export const contactQueryFields = [
    "Id",
    ...contactFieldNames,
    "Account.Name",
    "LastModifiedDate"
] as const;

export const accountListQuery = [
    `SELECT ${accountQueryFields.join(", ")}`,
    "FROM Account",
    "ORDER BY LastModifiedDate DESC",
    "LIMIT 100"
].join(" ");

export const contactListQuery = [
    `SELECT ${contactQueryFields.join(", ")}`,
    "FROM Contact",
    "ORDER BY LastModifiedDate DESC",
    "LIMIT 100"
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

export function buildGlobalSearchSosl(query: string): string {
    const escapedTerms = query
        .trim()
        .split(/\s+/)
        .map(escapeSoslTerm)
        .filter(Boolean);
    const searchExpression = `${escapedTerms.join(" ")}*`;

    return [
        `FIND {${searchExpression}} IN ALL FIELDS RETURNING`,
        `Account(${accountQueryFields.join(", ")} LIMIT 5),`,
        `Contact(${contactQueryFields.join(", ")} LIMIT 5)`
    ].join(" ");
}

export function toSearchResultItem(record: SalesforceSearchRecord): SearchResultItem | null {
    if (record.attributes?.type === "Account" && record.Id && record.Name) {
        return {
            type: "account",
            record: {
                Id: record.Id,
                Name: record.Name,
                Phone: record.Phone,
                Website: record.Website,
                Industry: record.Industry,
                Type: record.Type,
                BillingCity: record.BillingCity,
                BillingCountry: record.BillingCountry,
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
                AccountId: record.AccountId,
                Account: record.Account,
                LastModifiedDate: record.LastModifiedDate
            }
        };
    }

    return null;
}
