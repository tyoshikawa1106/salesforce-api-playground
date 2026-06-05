import type { FormEvent } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
import { getContactName } from "./formatting";
import { HomePanel } from "./HomePanel";
import { IntegrationPanel } from "./IntegrationPanel";
import { ObjectHomeHeader } from "./ObjectHome";
import { AccountPanel, ContactPanel } from "./RecordLists";
import { AccountRecordPage, ContactRecordPage } from "./RecordPages";
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
                            onDelete={(record) => onDeleteRecord({ type: "account", ids: [record.Id], label: record.Name })}
                            onBulkDelete={(records) =>
                                onDeleteRecord({
                                    type: "account",
                                    ids: records.map((record) => record.Id),
                                    label: `選択した取引先 ${records.length} 件`
                                })
                            }
                            onBulkDeleteEmpty={onBulkDeleteEmpty}
                        />
                    </>
                ) : null}

                {activeTab === "accounts" && connected && selectedAccount ? (
                    <AccountRecordPage
                        account={selectedAccount}
                        contacts={contacts.filter((contact) => contact.AccountId === selectedAccount.Id)}
                        onDelete={(record) => onDeleteRecord({ type: "account", ids: [record.Id], label: record.Name })}
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
                            onDelete={(record) => onDeleteRecord({ type: "contact", ids: [record.Id], label: getContactName(record) })}
                            onBulkDelete={(records) =>
                                onDeleteRecord({
                                    type: "contact",
                                    ids: records.map((record) => record.Id),
                                    label: `選択した取引先責任者 ${records.length} 件`
                                })
                            }
                            onBulkDeleteEmpty={onBulkDeleteEmpty}
                        />
                    </>
                ) : null}

                {activeTab === "contacts" && connected && selectedContact ? (
                    <ContactRecordPage
                        contact={selectedContact}
                        onDelete={(record) => onDeleteRecord({ type: "contact", ids: [record.Id], label: getContactName(record) })}
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
