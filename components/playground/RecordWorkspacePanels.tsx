import { getContactName } from "./formatting";
import { ObjectHomeHeader } from "./ObjectHome";
import { AccountPanel, ContactPanel } from "./RecordLists";
import { AccountRecordPage, ContactRecordPage } from "./RecordPages";
import type { Account, Contact, DeleteState } from "./types";

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
        <>
            <ObjectHomeHeader
                activeTab="accounts"
                loading={loading}
                onCreate={onCreate}
                onRefresh={onRefresh}
            />
            <AccountPanel
                accounts={accounts}
                loading={loading}
                connected={connected}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={(record) => onDeleteRecord(accountDeleteState([record], record.Name))}
                onBulkDelete={(records) => onDeleteRecord(accountDeleteState(records, `選択した取引先 ${records.length} 件`))}
                onBulkDeleteEmpty={onBulkDeleteEmpty}
            />
        </>
    );
}

export function AccountDetailWorkspace({
    account,
    contacts,
    loading,
    onDeleteRecord,
    onEdit,
    onRefresh
}: {
    account: Account;
    contacts: Contact[];
    loading: boolean;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <AccountRecordPage
            account={account}
            contacts={contacts.filter((contact) => contact.AccountId === account.Id)}
            onDelete={(record) => onDeleteRecord(accountDeleteState([record], record.Name))}
            onEdit={onEdit}
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
    onOpen: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <>
            <ObjectHomeHeader
                activeTab="contacts"
                loading={loading}
                onCreate={onCreate}
                onRefresh={onRefresh}
            />
            <ContactPanel
                contacts={contacts}
                loading={loading}
                connected={connected}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={(record) => onDeleteRecord(contactDeleteState([record], getContactName(record)))}
                onBulkDelete={(records) => onDeleteRecord(contactDeleteState(records, `選択した取引先責任者 ${records.length} 件`))}
                onBulkDeleteEmpty={onBulkDeleteEmpty}
            />
        </>
    );
}

export function ContactDetailWorkspace({
    contact,
    loading,
    onDeleteRecord,
    onEdit,
    onRefresh
}: {
    contact: Contact;
    loading: boolean;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEdit: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <ContactRecordPage
            contact={contact}
            onDelete={(record) => onDeleteRecord(contactDeleteState([record], getContactName(record)))}
            onEdit={onEdit}
            onRefresh={onRefresh}
            loading={loading}
        />
    );
}

function accountDeleteState(records: Account[], label: string): DeleteState {
    return {
        type: "account",
        ids: records.map((record) => record.Id),
        label
    };
}

function contactDeleteState(records: Contact[], label: string): DeleteState {
    return {
        type: "contact",
        ids: records.map((record) => record.Id),
        label
    };
}
