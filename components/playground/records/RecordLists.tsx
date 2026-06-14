"use client";

import type { Account, Contact } from "../utils/types";
import { getAccountBilling, getContactName, formatDate } from "../utils/formatting";
import { RecordListPanel } from "./RecordListPanel";
import { filterAndSortRecords } from "./record-list-state";
import { renderEmailLink, renderPhoneLink, renderWebsiteLink } from "./RecordValueLinks";
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
    getRecordPath: (record: Record) => string;
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
    onRefresh: () => void;
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
        { label: "業種", getValue: (account) => account.Industry },
        { label: "電話", hideOnMobile: true, getValue: (account) => renderPhoneLink(account.Phone) },
        { label: "Web サイト", hideOnMobile: true, getValue: (account) => renderWebsiteLink(account.Website) },
        { label: "請求先", hideOnMobile: true, getValue: getAccountBilling },
        { label: "最終更新日", hideOnMobile: true, getValue: (account) => formatDate(account.LastModifiedDate) },
        { label: "最終更新者", hideOnMobile: true, getValue: (account) => account.LastModifiedBy?.Name }
    ],
    filterListRecords: filterAccounts,
    getRecordLabel: (account) => account.Name,
    getRecordPath: (account) => `/accounts/${encodeURIComponent(account.Id)}`
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
        { label: "役職", hideOnMobile: true, getValue: (contact) => contact.Title },
        { label: "メール", hideOnMobile: true, getValue: (contact) => renderEmailLink(contact.Email) },
        { label: "電話", hideOnMobile: true, getValue: (contact) => renderPhoneLink(contact.Phone) },
        { label: "最終更新日", hideOnMobile: true, getValue: (contact) => formatDate(contact.LastModifiedDate) },
        { label: "最終更新者", hideOnMobile: true, getValue: (contact) => contact.LastModifiedBy?.Name }
    ],
    filterListRecords: filterContacts,
    getRecordLabel: getContactName,
    getRecordPath: (contact) => `/contacts/${encodeURIComponent(contact.Id)}`
};

function renderAccountNameLink(contact: Contact, onOpenAccountById: (accountId: string) => void) {
    const accountId = contact.AccountId;

    if (!accountId) {
        return contact.Account?.Name;
    }

    return (
        <a
            className="slds-text-link"
            href={`/accounts/${encodeURIComponent(accountId)}`}
            onClick={(event) => {
                if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                    return;
                }
                event.preventDefault();
                onOpenAccountById(accountId);
            }}
        >
            {contact.Account?.Name || accountId}
        </a>
    );
}

function RecordPanel<Record extends { Id: string }>({
    config,
    records,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onBulkDelete,
    onBulkDeleteEmpty,
    onRefresh
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
            getRecordPath={config.getRecordPath}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onBulkDelete={onBulkDelete}
            onBulkDeleteEmpty={onBulkDeleteEmpty}
            onRefresh={onRefresh}
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
    onOpenAccountById,
    ...props
}: Omit<RecordPanelProps<Contact>, "records"> & {
    contacts: Contact[];
    onOpenAccountById: (accountId: string) => void;
}) {
    return (
        <RecordPanel
            config={{
                ...contactListConfig,
                columns: [
                    { label: "取引先名", getValue: (contact) => renderAccountNameLink(contact, onOpenAccountById) },
                    ...contactListConfig.columns
                ]
            }}
            records={contacts}
            {...props}
        />
    );
}

export function filterAccounts(accounts: Account[], searchTerm: string) {
    return filterAndSortRecords(
        accounts,
        searchTerm,
        (account) => [
            account.Name,
            account.Phone,
            account.Website,
            account.Industry,
            getAccountBilling(account)
        ],
        (account) => account.Name
    );
}

export function filterContacts(contacts: Contact[], searchTerm: string) {
    return filterAndSortRecords(
        contacts,
        searchTerm,
        (contact) => [
            getContactName(contact),
            contact.Title,
            contact.Account?.Name,
            contact.Email,
            contact.Phone
        ],
        getContactName
    );
}
