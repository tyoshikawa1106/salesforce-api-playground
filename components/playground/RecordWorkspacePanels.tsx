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
    onEditActivity,
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
    onEditActivity: (record: Activity) => void;
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
            onDeleteActivity={(record, afterDelete) => onDeleteRecord(activityDeleteState(record, afterDelete))}
            onEdit={onEdit}
            onEditActivity={onEditActivity}
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
    onEditActivity,
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
    onEditActivity: (record: Activity) => void;
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
            onDeleteActivity={(record, afterDelete) => onDeleteRecord(activityDeleteState(record, afterDelete))}
            onEdit={onEdit}
            onEditActivity={onEditActivity}
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
    return (
        <ActivityRecordPage
            activity={activity}
            loading={loading}
            onDelete={(record) => onDeleteRecord(activityDeleteState(record))}
            onEdit={onEdit}
            onRefresh={onRefresh}
        />
    );
}

function activityDeleteState(activity: Activity, afterDelete?: () => Promise<void>): DeleteState {
    const objectLabel = activity.type === "task" ? "ToDo" : "行動";

    return {
        type: "activity",
        activityType: activity.type,
        ids: [activity.id],
        label: `${objectLabel} ${activity.subject || activity.id}`,
        ...(afterDelete ? { afterDelete } : {})
    };
}
