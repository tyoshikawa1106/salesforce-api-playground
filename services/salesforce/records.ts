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
    createIntegrationStandardObject,
    createStandardObject,
    deleteStandardObject,
    deleteStandardObjects,
    updateIntegrationStandardObject,
    updateStandardObject
} from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";
import {
    accountListQuery,
    buildGlobalSearchSosl,
    contactListQuery,
    toSearchResultItem,
    type SalesforceSearchRecord
} from "./record-queries";

function createRecordOperations<TCreateInput extends object, TUpdateInput extends object>(objectName: string) {
    return {
        create(input: TCreateInput) {
            return createStandardObject(objectName, input);
        },
        update(id: string, input: TUpdateInput) {
            return updateStandardObject(objectName, id, input);
        },
        deleteOne(id: string) {
            return deleteStandardObject(objectName, id);
        },
        deleteMany(ids: string[]) {
            return deleteStandardObjects(objectName, ids);
        },
        createIntegration(input: TCreateInput) {
            return createIntegrationStandardObject(objectName, input);
        },
        updateIntegration(id: string, input: TUpdateInput) {
            return updateIntegrationStandardObject(objectName, id, input);
        }
    };
}

const accountRecords = createRecordOperations<AccountInput, AccountUpdateInput>("Account");
const contactRecords = createRecordOperations<ContactInput, ContactUpdateInput>("Contact");

export async function listAccounts() {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, "Account", "queryable");
        const response = await connection.query<AccountRecord>(accountListQuery);
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
