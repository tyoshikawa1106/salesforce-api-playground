import type { FormEvent } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
import { getContactName } from "./formatting";
import { HomePanel, IntegrationPanel, ObjectHomeHeader } from "./ObjectHome";
import { AccountPanel, ContactPanel } from "./RecordLists";
import { AccountRecordPage, ContactRecordPage } from "./RecordPages";
import type { Account, ActiveTab, Contact, DeleteState } from "./types";

type PlaygroundWorkspaceProps = {
    accountForm: AccountForm;
    accounts: Account[];
    activeTab: ActiveTab;
    connected: boolean;
    contacts: Contact[];
    instanceUrl?: string;
    loading: boolean;
    saving: boolean;
    selectedAccount: Account | null;
    selectedContact: Contact | null;
    onAccountFormChange: (value: AccountForm) => void;
    onCreateAccount: () => void;
    onCreateContact: () => void;
    onCreateIntegrationAccount: (event: FormEvent<HTMLFormElement>) => void;
    onDeleteRecord: (deleteState: DeleteState) => void;
    onEditAccount: (record: Account) => void;
    onEditContact: (record: Contact) => void;
    onOpenAccount: (record: Account) => void;
    onOpenContact: (record: Contact) => void;
    onRefresh: () => void;
};

export function PlaygroundWorkspace({
    accountForm,
    accounts,
    activeTab,
    connected,
    contacts,
    instanceUrl,
    loading,
    saving,
    selectedAccount,
    selectedContact,
    onAccountFormChange,
    onCreateAccount,
    onCreateContact,
    onCreateIntegrationAccount,
    onDeleteRecord,
    onEditAccount,
    onEditContact,
    onOpenAccount,
    onOpenContact,
    onRefresh
}: PlaygroundWorkspaceProps) {
    return (
        <main className="slds-template_default">
            <section className={activeTab === "home" ? "slds-card" : "playground-workspace"}>
                {activeTab === "home" ? (
                    <HomePanel
                        accountsCount={accounts.length}
                        contactsCount={contacts.length}
                        connected={connected}
                        instanceUrl={instanceUrl}
                        loading={loading}
                        onRefresh={onRefresh}
                    />
                ) : null}

                {activeTab === "accounts" && connected && !selectedAccount ? (
                    <>
                        <ObjectHomeHeader
                            activeTab="accounts"
                            loading={loading}
                            onCreate={onCreateAccount}
                            onRefresh={onRefresh}
                        />
                        <AccountPanel
                            accounts={accounts}
                            loading={loading}
                            connected={connected}
                            onOpen={onOpenAccount}
                            onEdit={onEditAccount}
                            onDelete={(record) => onDeleteRecord({ type: "account", id: record.Id, label: record.Name })}
                        />
                    </>
                ) : null}

                {activeTab === "accounts" && connected && selectedAccount ? (
                    <AccountRecordPage
                        account={selectedAccount}
                        contacts={contacts.filter((contact) => contact.AccountId === selectedAccount.Id)}
                        onDelete={(record) => onDeleteRecord({ type: "account", id: record.Id, label: record.Name })}
                        onEdit={onEditAccount}
                        onRefresh={onRefresh}
                        loading={loading}
                    />
                ) : null}

                {activeTab === "contacts" && connected && !selectedContact ? (
                    <>
                        <ObjectHomeHeader
                            activeTab="contacts"
                            loading={loading}
                            onCreate={onCreateContact}
                            onRefresh={onRefresh}
                        />
                        <ContactPanel
                            contacts={contacts}
                            loading={loading}
                            connected={connected}
                            onOpen={onOpenContact}
                            onEdit={onEditContact}
                            onDelete={(record) => onDeleteRecord({ type: "contact", id: record.Id, label: getContactName(record) })}
                        />
                    </>
                ) : null}

                {activeTab === "contacts" && connected && selectedContact ? (
                    <ContactRecordPage
                        contact={selectedContact}
                        onDelete={(record) => onDeleteRecord({ type: "contact", id: record.Id, label: getContactName(record) })}
                        onEdit={onEditContact}
                        onRefresh={onRefresh}
                        loading={loading}
                    />
                ) : null}

                {activeTab === "integration" && connected ? (
                    <IntegrationPanel
                        accountForm={accountForm}
                        loading={loading}
                        saving={saving}
                        onAccountFormChange={onAccountFormChange}
                        onCreateAccount={onCreateIntegrationAccount}
                        onRefresh={onRefresh}
                    />
                ) : null}
            </section>
        </main>
    );
}
