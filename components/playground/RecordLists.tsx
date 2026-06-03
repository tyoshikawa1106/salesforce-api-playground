"use client";

import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { RecordListPanel } from "./RecordListPanel";
import { filterRecords } from "./record-list-state";
import type { RecordListColumn } from "./record-list-types";

export { getSelectionState } from "./record-list-state";

export function AccountPanel({
    accounts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete
}: {
    accounts: Account[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Account) => void;
    onEdit: (record: Account) => void;
    onDelete: (record: Account) => void;
}) {
    const columns: Array<RecordListColumn<Account>> = [
        { label: "電話", getValue: (account) => account.Phone },
        { label: "Web サイト", getValue: (account) => account.Website },
        { label: "業種", getValue: (account) => account.Industry },
        { label: "請求先", getValue: getAccountBilling },
        { label: "最終更新日", getValue: (account) => formatDate(account.LastModifiedDate) }
    ];

    return (
        <RecordListPanel
            records={accounts}
            loading={loading}
            connected={connected}
            searchId="account-list-search"
            ariaLabel="取引先一覧"
            primaryColumnLabel="取引先名"
            selectAllLabel="表示中の取引先をすべて選択"
            messages={{
                loading: "取引先を読み込んでいます...",
                empty: "取引先が見つかりません。",
                disconnected: "Salesforce に接続すると取引先を読み込めます。",
                filteredEmpty: "検索条件に一致する取引先が見つかりません。"
            }}
            columns={columns}
            filterListRecords={filterAccounts}
            getRecordLabel={(account) => account.Name}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
}

export function ContactPanel({
    contacts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete
}: {
    contacts: Contact[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onDelete: (record: Contact) => void;
}) {
    const columns: Array<RecordListColumn<Contact>> = [
        { label: "役職", getValue: (contact) => contact.Title },
        { label: "取引先名", getValue: (contact) => contact.Account?.Name },
        { label: "メール", getValue: (contact) => contact.Email },
        { label: "電話", getValue: (contact) => contact.Phone },
        { label: "最終更新日", getValue: (contact) => formatDate(contact.LastModifiedDate) }
    ];

    return (
        <RecordListPanel
            records={contacts}
            loading={loading}
            connected={connected}
            searchId="contact-list-search"
            ariaLabel="取引先責任者一覧"
            primaryColumnLabel="氏名"
            selectAllLabel="表示中の取引先責任者をすべて選択"
            messages={{
                loading: "取引先責任者を読み込んでいます...",
                empty: "取引先責任者が見つかりません。",
                disconnected: "Salesforce に接続すると取引先責任者を読み込めます。",
                filteredEmpty: "検索条件に一致する取引先責任者が見つかりません。"
            }}
            columns={columns}
            filterListRecords={filterContacts}
            getRecordLabel={getContactName}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
}

export function filterAccounts(accounts: Account[], searchTerm: string) {
    return filterRecords(accounts, searchTerm, (account) => [
        account.Name,
        account.Phone,
        account.Website,
        account.Industry,
        getAccountBilling(account)
    ]);
}

export function filterContacts(contacts: Contact[], searchTerm: string) {
    return filterRecords(contacts, searchTerm, (contact) => [
        getContactName(contact),
        contact.Title,
        contact.Account?.Name,
        contact.Email,
        contact.Phone
    ]);
}
