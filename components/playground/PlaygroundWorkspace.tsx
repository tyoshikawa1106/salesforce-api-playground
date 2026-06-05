import type { FormEvent } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
import { HomePanel } from "./HomePanel";
import { IntegrationPanel } from "./IntegrationPanel";
import {
    AccountDetailWorkspace,
    AccountListWorkspace,
    ContactDetailWorkspace,
    ContactListWorkspace
} from "./RecordWorkspacePanels";
import { RecycleBinPanel } from "./RecycleBinPanel";
import type { Account, ActiveTab, Contact, DeleteState, RecycleBinItem } from "./types";

type PlaygroundWorkspaceProps = {
    accountForm: AccountForm;
    accounts: Account[];
    activeTab: ActiveTab;
    connected: boolean;
    contacts: Contact[];
    recycleBinItems: RecycleBinItem[];
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
    onBulkDeleteEmpty: () => void;
    onRestoreRecycleBinItems: (items: RecycleBinItem[]) => void;
    onRestoreRecycleBinEmpty: () => void;
    onRefresh: () => void;
};

export function PlaygroundWorkspace({
    accountForm,
    accounts,
    activeTab,
    connected,
    contacts,
    recycleBinItems,
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
    onBulkDeleteEmpty,
    onRestoreRecycleBinItems,
    onRestoreRecycleBinEmpty,
    onRefresh
}: PlaygroundWorkspaceProps) {
    const sectionClassName = activeTab === "home" ? "slds-card" : "playground-workspace";

    return (
        <main className="slds-template_default">
            <section className={sectionClassName}>
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
                    <AccountListWorkspace
                        accounts={accounts}
                        connected={connected}
                        loading={loading}
                        onBulkDeleteEmpty={onBulkDeleteEmpty}
                        onCreate={onCreateAccount}
                        onDeleteRecord={onDeleteRecord}
                        onEdit={onEditAccount}
                        onOpen={onOpenAccount}
                        onRefresh={onRefresh}
                    />
                ) : null}

                {activeTab === "accounts" && connected && selectedAccount ? (
                    <AccountDetailWorkspace
                        account={selectedAccount}
                        contacts={contacts}
                        loading={loading}
                        onDeleteRecord={onDeleteRecord}
                        onEdit={onEditAccount}
                        onRefresh={onRefresh}
                    />
                ) : null}

                {activeTab === "contacts" && connected && !selectedContact ? (
                    <ContactListWorkspace
                        connected={connected}
                        contacts={contacts}
                        loading={loading}
                        onBulkDeleteEmpty={onBulkDeleteEmpty}
                        onCreate={onCreateContact}
                        onDeleteRecord={onDeleteRecord}
                        onEdit={onEditContact}
                        onOpen={onOpenContact}
                        onRefresh={onRefresh}
                    />
                ) : null}

                {activeTab === "contacts" && connected && selectedContact ? (
                    <ContactDetailWorkspace
                        contact={selectedContact}
                        loading={loading}
                        onDeleteRecord={onDeleteRecord}
                        onEdit={onEditContact}
                        onRefresh={onRefresh}
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

                {activeTab === "recycleBin" && connected ? (
                    <RecycleBinPanel
                        items={recycleBinItems}
                        loading={loading}
                        onRestore={onRestoreRecycleBinItems}
                        onRestoreEmpty={onRestoreRecycleBinEmpty}
                    />
                ) : null}
            </section>
        </main>
    );
}
