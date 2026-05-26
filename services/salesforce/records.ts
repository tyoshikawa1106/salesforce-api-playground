import type { SaveResult } from "jsforce";
import type {
    AccountInput,
    AccountRecord,
    AccountUpdateInput,
    ContactInput,
    ContactRecord,
    ContactUpdateInput,
    SalesforceQueryResponse
} from "@/lib/salesforce/records";
import {
    emptySalesforceResult,
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

type CreateResult = {
    id: string;
    success: boolean;
};

async function createStandardObject<TInput extends object>(objectName: string, input: TInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject(objectName).create(input);
        return { id: result.id, success: result.success } as CreateResult;
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

export async function listContacts() {
    return withStandardObjectConnection(async (connection) => {
        const response = await connection.query<ContactRecord>(contactListQuery);
        return { contacts: response.records };
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
