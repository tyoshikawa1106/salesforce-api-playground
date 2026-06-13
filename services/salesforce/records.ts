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
import { withStandardObjectConnection } from "./client";
import {
    createStandardObjectOperations
} from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";
import {
    buildAccountListQuery,
    buildGlobalSearchSosl,
    contactListQuery,
    toSearchResultItem,
    type SalesforceSearchRecord
} from "./record-queries";

function hasDescribeField(describe: { fields?: Array<{ name: string }> }, fieldName: string): boolean {
    return describe.fields?.some((field) => field.name === fieldName) ?? false;
}

const accountRecords = createStandardObjectOperations<AccountInput, AccountUpdateInput>("Account");
const contactRecords = createStandardObjectOperations<ContactInput, ContactUpdateInput>("Contact");

export async function listAccounts() {
    return withStandardObjectConnection(async (connection) => {
        const describe = await assertObjectPermission(connection, "Account", "queryable");
        const response = await connection.query<AccountRecord>(buildAccountListQuery(hasDescribeField(describe, "RecordTypeId")));
        return { accounts: response.records };
    });
}

export async function createAccount(input: AccountInput) {
    return accountRecords.create(input);
}

export async function updateAccount(id: string, input: AccountUpdateInput) {
    return accountRecords.update(id, input);
}

export async function deleteAccount(id: string) {
    return accountRecords.deleteOne(id);
}

export async function deleteAccounts(ids: string[]) {
    return accountRecords.deleteMany(ids);
}

export async function createIntegrationAccount(input: AccountInput) {
    return accountRecords.createIntegration(input);
}

export async function updateIntegrationAccount(id: string, input: AccountUpdateInput) {
    return accountRecords.updateIntegration(id, input);
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
        const accountDescribe = await assertObjectPermission(connection, "Account", "searchable");
        await assertObjectPermission(connection, "Contact", "searchable");
        const response = await connection.search(buildGlobalSearchSosl(query, hasDescribeField(accountDescribe, "RecordTypeId")));
        return {
            results: response.searchRecords
                .map((record) => toSearchResultItem(record as SalesforceSearchRecord))
                .filter((record): record is SearchResultItem => record !== null)
        };
    });
}

export async function createContact(input: ContactInput) {
    return contactRecords.create(input);
}

export async function updateContact(id: string, input: ContactUpdateInput) {
    return contactRecords.update(id, input);
}

export async function deleteContact(id: string) {
    return contactRecords.deleteOne(id);
}

export async function deleteContacts(ids: string[]) {
    return contactRecords.deleteMany(ids);
}

export type { SalesforceQueryResponse, SaveResult };
