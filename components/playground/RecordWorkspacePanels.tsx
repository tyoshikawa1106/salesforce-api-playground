import type { ReactNode } from "react";
import { ObjectHomeHeader } from "./ObjectHome";
import {
    accountBulkDeleteLabel,
    accountDeleteState,
    contactBulkDeleteLabel,
    contactDeleteLabel,
    contactDeleteState
} from "./record-actions";
import { AccountPanel, ContactPanel } from "./RecordLists";
import { AccountRecordPage, ActivityRecordPage, ContactRecordPage } from "./RecordPages";
import type { Account, ActiveTab, Activity, Contact, DeleteState } from "./types";

function RecordListWorkspaceFrame({
    activeTab,
    children,
    loading,
    onCreate,
    onRefresh
}: {
    activeTab: Extract<ActiveTab, "accounts" | "contacts">;
    children: ReactNode;
    loading: boolean;
    onCreate: () => void;
    onRefresh: () => void;
}) {
    return (
        <>
            <ObjectHomeHeader
                activeTab={activeTab}
                loading={loading}
                onCreate={onCreate}
                onRefresh={onRefresh}
            />
            {children}
        </>
    );
}

export function AccountListWorkspace({
    accounts,
    connected,
    loading,
    onBulkDeleteEmpty,
    onCreate,
    onDeleteRecord,
    onEdit,
    onOpen,
    onRefresh
}: {
    accounts: Account[];
    connected: boolean;
    loading: boolean;
    onBulkDeleteEmpty: () => void;
    onCreate: () => void;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Account) => void;
    onOpen: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <RecordListWorkspaceFrame
            activeTab="accounts"
            loading={loading}
            onCreate={onCreate}
            onRefresh={onRefresh}
        >
            <AccountPanel
                accounts={accounts}
                loading={loading}
                connected={connected}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={(record) => onDeleteRecord(accountDeleteState([record], record.Name))}
                onBulkDelete={(records) => onDeleteRecord(accountDeleteState(records, accountBulkDeleteLabel(records)))}
                onBulkDeleteEmpty={onBulkDeleteEmpty}
            />
        </RecordListWorkspaceFrame>
    );
}

export function AccountDetailWorkspace({
    account,
    assignedUserId,
    assignedUserName,
    contacts,
    loading,
    onDeleteRecord,
    onEdit,
    onOpenActivity,
    onOpenContact,
    onRefresh
}: {
    account: Account;
    assignedUserId?: string;
    assignedUserName?: string;
    contacts: Contact[];
    loading: boolean;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Account) => void;
    onOpenActivity: (activity: Activity) => void;
    onOpenContact: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <AccountRecordPage
            account={account}
            assignedUserId={assignedUserId}
            assignedUserName={assignedUserName}
            contacts={contacts.filter((contact) => contact.AccountId === account.Id)}
            onDelete={(record) => onDeleteRecord(accountDeleteState([record], record.Name))}
            onEdit={onEdit}
            onOpenActivity={onOpenActivity}
            onOpenContact={onOpenContact}
            onRefresh={onRefresh}
            loading={loading}
        />
    );
}

export function ContactListWorkspace({
    connected,
    contacts,
    loading,
    onBulkDeleteEmpty,
    onCreate,
    onDeleteRecord,
    onEdit,
    onOpenAccount,
    onOpen,
    onRefresh
}: {
    connected: boolean;
    contacts: Contact[];
    loading: boolean;
    onBulkDeleteEmpty: () => void;
    onCreate: () => void;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Contact) => void;
    onOpenAccount: (accountId: string) => void;
    onOpen: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <RecordListWorkspaceFrame
            activeTab="contacts"
            loading={loading}
            onCreate={onCreate}
            onRefresh={onRefresh}
        >
            <ContactPanel
                contacts={contacts}
                loading={loading}
                connected={connected}
                onOpen={onOpen}
                onOpenAccountById={onOpenAccount}
                onEdit={onEdit}
                onDelete={(record) => onDeleteRecord(contactDeleteState([record], contactDeleteLabel(record)))}
                onBulkDelete={(records) => onDeleteRecord(contactDeleteState(records, contactBulkDeleteLabel(records)))}
                onBulkDeleteEmpty={onBulkDeleteEmpty}
            />
        </RecordListWorkspaceFrame>
    );
}

export function ContactDetailWorkspace({
    assignedUserId,
    assignedUserName,
    contact,
    loading,
    onDeleteRecord,
    onEdit,
    onOpenAccount,
    onOpenActivity,
    onRefresh
}: {
    assignedUserId?: string;
    assignedUserName?: string;
    contact: Contact;
    loading: boolean;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Contact) => void;
    onOpenAccount: (accountId: string) => void;
    onOpenActivity: (activity: Activity) => void;
    onRefresh: () => void;
}) {
    return (
        <ContactRecordPage
            assignedUserId={assignedUserId}
            assignedUserName={assignedUserName}
            contact={contact}
            onDelete={(record) => onDeleteRecord(contactDeleteState([record], contactDeleteLabel(record)))}
            onEdit={onEdit}
            onOpenAccount={onOpenAccount}
            onOpenActivity={onOpenActivity}
            onRefresh={onRefresh}
            loading={loading}
        />
    );
}

export function ActivityDetailWorkspace({
    activity,
    loading,
    onDeleteRecord,
    onEdit,
    onRefresh
}: {
    activity: Activity;
    loading: boolean;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Activity) => void;
    onRefresh: () => void;
}) {
    const objectLabel = activity.type === "task" ? "ToDo" : "行動";

    return (
        <ActivityRecordPage
            activity={activity}
            loading={loading}
            onDelete={(record) => onDeleteRecord({
                type: "activity",
                activityType: record.type,
                ids: [record.id],
                label: `${objectLabel} ${record.subject || record.id}`
            })}
            onEdit={onEdit}
            onRefresh={onRefresh}
        />
    );
}
