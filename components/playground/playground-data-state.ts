import type { SearchResultItem } from "@/lib/salesforce/records";
import type { Account, ActiveTab, Contact } from "./types";

export type SearchResultStatePatch =
    | {
        type: "account";
        accounts: Account[];
        activeTab: Extract<ActiveTab, "accounts">;
        selectedAccountId: string;
        selectedContactId: null;
    }
    | {
        type: "contact";
        contacts: Contact[];
        activeTab: Extract<ActiveTab, "contacts">;
        selectedAccountId: null;
        selectedContactId: string;
    };

export function keepSelectedRecordId<Record extends { Id: string }>(
    currentId: string | null,
    records: Record[]
) {
    return currentId && records.some((record) => record.Id === currentId) ? currentId : null;
}

export function upsertRecordById<Record extends { Id: string }>(records: Record[], nextRecord: Record) {
    return [
        nextRecord,
        ...records.filter((record) => record.Id !== nextRecord.Id)
    ];
}

export function getSearchResultStatePatch(
    result: SearchResultItem,
    currentAccounts: Account[],
    currentContacts: Contact[]
): SearchResultStatePatch {
    if (result.type === "account") {
        return {
            type: "account",
            accounts: upsertRecordById(currentAccounts, result.record),
            activeTab: "accounts",
            selectedAccountId: result.record.Id,
            selectedContactId: null
        };
    }

    return {
        type: "contact",
        contacts: upsertRecordById(currentContacts, result.record),
        activeTab: "contacts",
        selectedAccountId: null,
        selectedContactId: result.record.Id
    };
}
