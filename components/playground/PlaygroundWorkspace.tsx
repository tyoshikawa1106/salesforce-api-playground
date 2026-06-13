import type { FormEvent } from "react";
import type { HomeRecordCounts } from "@/lib/playground-record-counts";
import type { AccountForm } from "@/lib/salesforce/records";
import { HomeCounts, HomePanel } from "./home/HomePanel";
import type { HomeCountValues } from "./home/HomePanel";
import { IntegrationPanel } from "./integration/IntegrationPanel";
import {
    AccountDetailWorkspace,
    AccountListWorkspace,
    ActivityDetailWorkspace,
    ContactDetailWorkspace,
    ContactListWorkspace
} from "./records/RecordWorkspacePanels";
import { RecycleBinPanel } from "./recycle-bin/RecycleBinPanel";
import type { PicklistOption, PicklistOptionsByField } from "./utils/picklist-options";
import type { Account, ActiveTab, Activity, Contact, DeleteState, RecycleBinItem } from "./utils/types";

type PlaygroundWorkspaceProps = {
    view: {
        activeTab: ActiveTab;
        activityCounts: {
            events: number;
            tasks: number;
        };
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
        recordCounts: HomeRecordCounts;
        selectedAccount: Account | null;
        selectedActivity: Activity | null;
        selectedContact: Contact | null;
        userCounts: {
            active: number;
        };
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
        onOpenContactById: (contactId: string) => void;
        onBulkDeleteEmpty: () => void;
        onRefresh: () => void;
    };
    integrationForm: {
        accountForm: AccountForm;
        accountPicklistError?: string;
        accountPicklistLoading?: boolean;
        accountPicklistOptions?: PicklistOptionsByField<"Industry" | "Type">;
        saving: boolean;
        onAccountFormChange: (value: AccountForm) => void;
        onCreateAccount: (event: FormEvent<HTMLFormElement>) => void;
    };
    picklists?: {
        taskStatusOptions?: PicklistOption[];
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
    picklists,
    recycleBinActions
}: PlaygroundWorkspaceProps) {
    const { activeTab, activityCounts, loading } = view;
    const { connected, userId, userName } = session;
    const { accounts, contacts, recordCounts, selectedAccount, selectedActivity, selectedContact, userCounts } = recordSelection;
    const homeCounts: HomeCountValues = {
        ...recordCounts,
        accounts: accounts.length,
        contacts: contacts.length,
        events: activityCounts.events,
        recycleBinItems: recycleBinActions.items.length,
        tasks: activityCounts.tasks,
        users: userCounts.active
    };
    const sectionClassName = activeTab === "home" ? "slds-card" : "playground-workspace";
    const recordListActive =
        (activeTab === "accounts" && connected && !selectedAccount)
        || (activeTab === "contacts" && connected && !selectedContact)
        || (activeTab === "recycleBin" && connected);
    const mainClassName = [
        "slds-template_default",
        recordListActive ? "playground-main-content_flush-record-list" : ""
    ].filter(Boolean).join(" ");

    return (
        <main id="main-content" className={mainClassName}>
            <section className={sectionClassName}>
                {activeTab === "home" ? (
                    <HomePanel userName={userName} />
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
                        taskStatusOptions={picklists?.taskStatusOptions}
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
                        taskStatusOptions={picklists?.taskStatusOptions}
                    />
                ) : null}

                {activeTab === "activities" && connected && selectedActivity ? (
                    <ActivityDetailWorkspace
                        activity={selectedActivity}
                        loading={loading}
                        onDeleteRecord={recordActions.onDeleteRecord}
                        onEdit={recordActions.onEditActivity}
                        onOpenAccountById={recordActions.onOpenAccountById}
                        onOpenContactById={recordActions.onOpenContactById}
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}

                {activeTab === "integration" && connected ? (
                    <IntegrationPanel
                        accountForm={integrationForm.accountForm}
                        picklistError={integrationForm.accountPicklistError}
                        picklistLoading={integrationForm.accountPicklistLoading}
                        picklistOptions={integrationForm.accountPicklistOptions}
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
                        onRefresh={recordActions.onRefresh}
                    />
                ) : null}
            </section>
            {activeTab === "home" ? (
                <HomeCounts
                    counts={homeCounts}
                    loading={loading}
                />
            ) : null}
        </main>
    );
}
