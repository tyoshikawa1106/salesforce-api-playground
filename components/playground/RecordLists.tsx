"use client";

import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { RecordListPanel } from "./RecordListPanel";
import { filterRecords } from "./record-list-state";
import type { RecordListColumn } from "./record-list-types";
import type { RecordListMessages } from "./record-list-types";

export { getSelectedVisibleRecords, getSelectionState } from "./record-list-state";

type RecordListConfig<Record extends { Id: string }> = {
    searchId: string;
    ariaLabel: string;
    primaryColumnLabel: string;
    bulkDeleteLabel: string;
    selectAllLabel: string;
    messages: RecordListMessages;
    columns: Array<RecordListColumn<Record>>;
    filterListRecords: (records: Record[], searchTerm: string) => Record[];
    getRecordLabel: (record: Record) => string;
};

type RecordPanelProps<Record extends { Id: string }> = {
    records: Record[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Record) => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
    onBulkDelete: (records: Record[]) => void;
    onBulkDeleteEmpty: () => void;
};

const accountListConfig: RecordListConfig<Account> = {
    searchId: "account-list-search",
    ariaLabel: "取引先一覧",
    primaryColumnLabel: "取引先名",
    bulkDeleteLabel: "選択した取引先を削除",
    selectAllLabel: "表示中の取引先をすべて選択",
    messages: {
        loading: "取引先を読み込んでいます...",
        empty: "取引先が見つかりません。",
        disconnected: "Salesforce に接続すると取引先を読み込めます。",
        filteredEmpty: "検索条件に一致する取引先が見つかりません。"
    },
    columns: [
        { label: "電話", getValue: (account) => account.Phone },
        { label: "Web サイト", getValue: (account) => account.Website },
        { label: "業種", getValue: (account) => account.Industry },
        { label: "請求先", getValue: getAccountBilling },
        { label: "最終更新日", getValue: (account) => formatDate(account.LastModifiedDate) }
    ],
    filterListRecords: filterAccounts,
    getRecordLabel: (account) => account.Name
};

const contactListConfig: RecordListConfig<Contact> = {
    searchId: "contact-list-search",
    ariaLabel: "取引先責任者一覧",
    primaryColumnLabel: "氏名",
    bulkDeleteLabel: "選択した取引先責任者を削除",
    selectAllLabel: "表示中の取引先責任者をすべて選択",
    messages: {
        loading: "取引先責任者を読み込んでいます...",
        empty: "取引先責任者が見つかりません。",
        disconnected: "Salesforce に接続すると取引先責任者を読み込めます。",
        filteredEmpty: "検索条件に一致する取引先責任者が見つかりません。"
    },
    columns: [
        { label: "役職", getValue: (contact) => contact.Title },
        { label: "取引先名", getValue: (contact) => contact.Account?.Name },
        { label: "メール", getValue: (contact) => contact.Email },
        { label: "電話", getValue: (contact) => contact.Phone },
        { label: "最終更新日", getValue: (contact) => formatDate(contact.LastModifiedDate) }
    ],
    filterListRecords: filterContacts,
    getRecordLabel: getContactName
};

function RecordPanel<Record extends { Id: string }>({
    config,
    records,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onBulkDelete,
    onBulkDeleteEmpty
}: RecordPanelProps<Record> & { config: RecordListConfig<Record> }) {
    return (
        <RecordListPanel
            records={records}
            loading={loading}
            connected={connected}
            searchId={config.searchId}
            ariaLabel={config.ariaLabel}
            primaryColumnLabel={config.primaryColumnLabel}
            bulkDeleteLabel={config.bulkDeleteLabel}
            selectAllLabel={config.selectAllLabel}
            messages={config.messages}
            columns={config.columns}
            filterListRecords={config.filterListRecords}
            getRecordLabel={config.getRecordLabel}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onBulkDelete={onBulkDelete}
            onBulkDeleteEmpty={onBulkDeleteEmpty}
        />
    );
}

export function AccountPanel({
    accounts,
    ...props
}: Omit<RecordPanelProps<Account>, "records"> & {
    accounts: Account[];
}) {
    return <RecordPanel config={accountListConfig} records={accounts} {...props} />;
}

export function ContactPanel({
    contacts,
    ...props
}: Omit<RecordPanelProps<Contact>, "records"> & {
    contacts: Contact[];
}) {
    return <RecordPanel config={contactListConfig} records={contacts} {...props} />;
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
