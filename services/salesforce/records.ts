import type { Connection, SaveResult } from "jsforce";
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
import { assertObjectPermission } from "./object-permissions";

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

type CreatedRecordResult = ReturnType<typeof createdSalesforceResult>;
type EmptyRecordResult = ReturnType<typeof emptySalesforceResult>;
type BulkDeleteResult = {
    results: SaveResult[];
};
type SalesforceRecordConnectionRunner<TData, TResult> = (
    operation: (connection: Connection) => Promise<TData>
) => Promise<TResult>;

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

function createObject<TInput extends object, TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<CreatedRecordResult, TResult>,
    objectName: string,
    input: TInput
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "createable");
        const result = await connection.sobject(objectName).create(input);
        return createdSalesforceResult(result);
    });
}

function updateObject<TInput extends object, TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<EmptyRecordResult, TResult>,
    objectName: string,
    id: string,
    input: TInput
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "updateable");
        const result = await connection.sobject(objectName).update({ Id: id, ...input });
        return emptySalesforceResult(result);
    });
}

function deleteObject<TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<EmptyRecordResult, TResult>,
    objectName: string,
    id: string
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "deletable");
        const result = await connection.sobject(objectName).destroy(id);
        return emptySalesforceResult(result);
    });
}

function deleteObjects<TResult>(
    runWithConnection: SalesforceRecordConnectionRunner<BulkDeleteResult, TResult>,
    objectName: string,
    ids: string[]
) {
    return runWithConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "deletable");
        const results = await connection.sobject(objectName).destroy(ids);
        return {
            results: Array.isArray(results) ? results : [results]
        };
    });
}

function createStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return createObject(withStandardObjectConnection, objectName, input);
}

function updateStandardObject<TInput extends object>(objectName: string, id: string, input: TInput) {
    return updateObject(withStandardObjectConnection, objectName, id, input);
}

function deleteStandardObject(objectName: string, id: string) {
    return deleteObject(withStandardObjectConnection, objectName, id);
}

function deleteStandardObjects(objectName: string, ids: string[]) {
    return deleteObjects(withStandardObjectConnection, objectName, ids);
}

function createIntegrationStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return createObject(withIntegrationConnection, objectName, input);
}

function updateIntegrationStandardObject<TInput extends object>(objectName: string, id: string, input: TInput) {
    return updateObject(withIntegrationConnection, objectName, id, input);
}

export async function listAccounts() {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, "Account", "queryable");
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

export async function deleteAccounts(ids: string[]) {
    return deleteStandardObjects("Account", ids);
}

export async function createIntegrationAccount(input: AccountInput) {
    return createIntegrationStandardObject("Account", input);
}

export async function updateIntegrationAccount(id: string, input: AccountUpdateInput) {
    return updateIntegrationStandardObject("Account", id, input);
}

export async function listContacts() {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, "Contact", "queryable");
        const response = await connection.query<ContactRecord>(contactListQuery);
        return { contacts: response.records };
    });
}

export async function searchAccountsAndContacts(query: string) {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, "Account", "searchable");
        await assertObjectPermission(connection, "Contact", "searchable");
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

export async function deleteContacts(ids: string[]) {
    return deleteStandardObjects("Contact", ids);
}

export type { SalesforceQueryResponse, SaveResult };
