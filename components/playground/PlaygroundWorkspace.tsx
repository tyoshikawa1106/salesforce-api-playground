import type { FormEvent } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
import { HomePanel } from "./HomePanel";
import { IntegrationPanel } from "./IntegrationPanel";
import {
    AccountDetailWorkspace,
    AccountListWorkspace,
    ActivityDetailWorkspace,
    ContactDetailWorkspace,
    ContactListWorkspace
} from "./RecordWorkspacePanels";
import { RecycleBinPanel } from "./RecycleBinPanel";
import type { Account, ActiveTab, Activity, Contact, DeleteState, RecycleBinItem } from "./types";

type PlaygroundWorkspaceProps = {
    view: {
        activeTab: ActiveTab;
        loading: boolean;
    };
    session: {
        connected: boolean;
        instanceUrl?: string;
        userId?: string;
        userName?: string;
    };
    recordSelection: {
        accounts: Account[];
        contacts: Contact[];
        selectedAccount: Account | null;
        selectedActivity: Activity | null;
        selectedContact: Contact | null;
    };
    recordActions: {
        onCreateAccount: () => void;
        onCreateContact: () => void;
        onDeleteRecord: (deleteState: DeleteState) => void;
        onEditActivity: (record: Activity) => void;
        onEditAccount: (record: Account) => void;
        onEditContact: (record: Contact) => void;
        onOpenActivity: (record: Activity) => void;
        onOpenAccount: (record: Account) => void;
        onOpenAccountById: (accountId: string) => void;
        onOpenContact: (record: Contact) => void;
        onBulkDeleteEmpty: () => void;
        onRefresh: () => void;
    };
    integrationForm: {
        accountForm: AccountForm;
        saving: boolean;
        onAccountFormChange: (value: AccountForm) => void;
        onCreateAccount: (event: FormEvent<HTMLFormElement>) => void;
    };
    recycleBinActions: {
        items: RecycleBinItem[];
        onRestoreItems: (items: RecycleBinItem[]) => void;
        onRestoreEmpty: () => void;
    };
};

export function PlaygroundWorkspace({
    view,
    session,
    recordSelection,
    recordActions,
    integrationForm,
    recycleBinActions
}: PlaygroundWorkspaceProps) {
    const { activeTab, loading } = view;
    const { connected, instanceUrl, userId, userName } = session;
    const { accounts, contacts, selectedAccount, selectedActivity, selectedContact } = recordSelection;
    const sectionClassName = activeTab === "home" ? "slds-card" : "playground-workspace";

    return (
        <main className="slds-template_default">
            <section className={sectionClassName}>
                {activeTab === "home" ? (
                    <HomePanel
                        connected={connected}
                        instanceUrl={instanceUrl}
                    />
                ) : null}

                {activeTab === "accounts" && connected && !selectedAccount ? (
                    <AccountListWorkspace
                        accounts={accounts}
                        connected={connected}
                        loading={loading}
                        onBulkDeleteEmpty={recordActions.onBulkDeleteEmpty}
                        onCreate={recordActions.onCreateAccount}
                        onDeleteRecord={recordActions.onDeleteRecord}
                        onEdit={recordActions.onEditAccount}
                        onOpen={recordActions.onOpenAccount}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "accounts" && connected && selectedAccount ? (
                    <AccountDetailWorkspace
                        account={selectedAccount}
                        assignedUserId={userId}
                        assignedUserName={userName}
                        contacts={contacts}
                        loading={loading}
                        onDeleteRecord={recordActions.onDeleteRecord}
                        onEdit={recordActions.onEditAccount}
                        onEditActivity={recordActions.onEditActivity}
                        onOpenActivity={recordActions.onOpenActivity}
                        onOpenContact={recordActions.onOpenContact}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "contacts" && connected && !selectedContact ? (
                    <ContactListWorkspace
                        connected={connected}
                        contacts={contacts}
                        loading={loading}
                        onBulkDeleteEmpty={recordActions.onBulkDeleteEmpty}
                        onCreate={recordActions.onCreateContact}
                        onDeleteRecord={recordActions.onDeleteRecord}
                        onEdit={recordActions.onEditContact}
                        onOpenAccount={recordActions.onOpenAccountById}
                        onOpen={recordActions.onOpenContact}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "contacts" && connected && selectedContact ? (
                    <ContactDetailWorkspace
                        assignedUserId={userId}
                        assignedUserName={userName}
                        contact={selectedContact}
                        loading={loading}
                        onDeleteRecord={recordActions.onDeleteRecord}
                        onEdit={recordActions.onEditContact}
                        onEditActivity={recordActions.onEditActivity}
                        onOpenAccount={recordActions.onOpenAccountById}
                        onOpenActivity={recordActions.onOpenActivity}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "activities" && connected && selectedActivity ? (
                    <ActivityDetailWorkspace
                        activity={selectedActivity}
                        loading={loading}
                        onDeleteRecord={recordActions.onDeleteRecord}
                        onEdit={recordActions.onEditActivity}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "integration" && connected ? (
                    <IntegrationPanel
                        accountForm={integrationForm.accountForm}
                        loading={loading}
                        saving={integrationForm.saving}
                        onAccountFormChange={integrationForm.onAccountFormChange}
                        onCreateAccount={integrationForm.onCreateAccount}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "recycleBin" && connected ? (
                    <RecycleBinPanel
                        items={recycleBinActions.items}
                        loading={loading}
                        onRestore={recycleBinActions.onRestoreItems}
                        onRestoreEmpty={recycleBinActions.onRestoreEmpty}
                    />
                ) : null}
            </section>
        </main>
    );
}
