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

export async function listAccounts() {
    return withStandardObjectConnection(async (connection) => {
        const response = await connection.query<AccountRecord>(accountListQuery);
        return { accounts: response.records };
    });
}

export async function createAccount(input: AccountInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject("Account").create(input);
        return { id: result.id, success: result.success } as CreateResult;
    });
}

export async function updateAccount(id: string, input: AccountUpdateInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject("Account").update({ Id: id, ...input });
        return emptySalesforceResult(result);
    });
}

export async function deleteAccount(id: string) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject("Account").destroy(id);
        return emptySalesforceResult(result);
    });
}

export async function listContacts() {
    return withStandardObjectConnection(async (connection) => {
        const response = await connection.query<ContactRecord>(contactListQuery);
        return { contacts: response.records };
    });
}

export async function createContact(input: ContactInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject("Contact").create(input);
        return { id: result.id, success: result.success } as CreateResult;
    });
}

export async function updateContact(id: string, input: ContactUpdateInput) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject("Contact").update({ Id: id, ...input });
        return emptySalesforceResult(result);
    });
}

export async function deleteContact(id: string) {
    return withStandardObjectConnection(async (connection) => {
        const result = await connection.sobject("Contact").destroy(id);
        return emptySalesforceResult(result);
    });
}

export type { SalesforceQueryResponse, SaveResult };
