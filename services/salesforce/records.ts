import type { SaveResult } from "jsforce";
import type {
    AccountInput,
    AccountRecord,
    AccountUpdateInput,
    ContactInput,
    ContactRecord,
    ContactUpdateInput,
    SearchResultItem,
    SalesforceQueryResponse
} from "@/lib/salesforce/records";
import {
    createdSalesforceResult,
    emptySalesforceResult,
    withIntegrationConnection,
    withStandardObjectConnection
} from "./client";

const accountListQuery = [
    "SELECT Id, Name, Phone, Website, Industry, Type, BillingCity, BillingCountry, LastModifiedDate",
    "FROM Account",
    "ORDER BY LastModifiedDate DESC",
    "LIMIT 100"
].join(" ");

const contactListQuery = [
    "SELECT Id, FirstName, LastName, Email, Phone, Title, AccountId, Account.Name, LastModifiedDate",
    "FROM Contact",
    "ORDER BY LastModifiedDate DESC",
    "LIMIT 100"
].join(" ");

const soslReservedCharacters = /[?&|!{}[\]()^~*:\\"'+-]/g;

type SalesforceSearchRecord = Partial<AccountRecord & ContactRecord> & {
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
        "Account(Id, Name, Phone, Website, Industry, Type, BillingCity, BillingCountry, LastModifiedDate LIMIT 5),",
        "Contact(Id, FirstName, LastName, Email, Phone, Title, AccountId, Account.Name, LastModifiedDate LIMIT 5)"
    ].join(" ");
}

function toSearchResultItem(record: SalesforceSearchRecord): SearchResultItem | null {
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

async function createStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject(objectName).create(input);
        return createdSalesforceResult(result);
    });
}

async function updateStandardObject<TInput extends object>(objectName: string, id: string, input: TInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject(objectName).update({ Id: id, ...input });
        return emptySalesforceResult(result);
    });
}

async function deleteStandardObject(objectName: string, id: string) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject(objectName).destroy(id);
        return emptySalesforceResult(result);
    });
}

async function createIntegrationStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return withIntegrationConnection(async (connection) => {
        const result = await connection.sobject(objectName).create(input);
        return createdSalesforceResult(result);
    });
}

async function updateIntegrationStandardObject<TInput extends object>(objectName: string, id: string, input: TInput) {
    return withIntegrationConnection(async (connection) => {
        const result = await connection.sobject(objectName).update({ Id: id, ...input });
        return emptySalesforceResult(result);
    });
}

export async function listAccounts() {
    return withStandardObjectConnection(async (connection) => {
        const response = await connection.query<AccountRecord>(accountListQuery);
        return { accounts: response.records };
    });
}

export async function createAccount(input: AccountInput) {
    return createStandardObject("Account", input);
}

export async function updateAccount(id: string, input: AccountUpdateInput) {
    return updateStandardObject("Account", id, input);
}

export async function deleteAccount(id: string) {
    return deleteStandardObject("Account", id);
}

export async function createIntegrationAccount(input: AccountInput) {
    return createIntegrationStandardObject("Account", input);
}

export async function updateIntegrationAccount(id: string, input: AccountUpdateInput) {
    return updateIntegrationStandardObject("Account", id, input);
}

export async function listContacts() {
    return withStandardObjectConnection(async (connection) => {
        const response = await connection.query<ContactRecord>(contactListQuery);
        return { contacts: response.records };
    });
}

export async function searchAccountsAndContacts(query: string) {
    return withStandardObjectConnection(async (connection) => {
        const response = await connection.search(buildGlobalSearchSosl(query));
        return {
            results: response.searchRecords
                .map((record) => toSearchResultItem(record as SalesforceSearchRecord))
                .filter((record): record is SearchResultItem => record !== null)
        };
    });
}

export async function createContact(input: ContactInput) {
    return createStandardObject("Contact", input);
}

export async function updateContact(id: string, input: ContactUpdateInput) {
    return updateStandardObject("Contact", id, input);
}

export async function deleteContact(id: string) {
    return deleteStandardObject("Contact", id);
}

export type { SalesforceQueryResponse, SaveResult };
