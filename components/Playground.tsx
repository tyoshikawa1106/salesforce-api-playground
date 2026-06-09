"use client";

import type { ComponentProps } from "react";
import type { EnvironmentLabel } from "@/lib/environment-label";
import { EnvironmentLabelBanner } from "./playground/EnvironmentLabelBanner";
import { AppNavigation } from "./playground/Navigation";
import { GlobalHeader } from "./playground/GlobalHeader";
import { LoginPage, SessionLoadingPage } from "./playground/LoginPage";
import { NoticeBanner } from "./playground/NoticeBanner";
import { PlaygroundWorkspace } from "./playground/PlaygroundWorkspace";
import { RecordModals } from "./playground/RecordModals";
import { useNotice } from "./playground/useNotice";
import { usePlaygroundData } from "./playground/usePlaygroundData";
import { useRecordMutations } from "./playground/useRecordMutations";

export default function Playground({ environmentLabel = null }: { environmentLabel?: EnvironmentLabel | null }) {
    const { notice, showNotice } = useNotice();
    const {
        accountOptions,
        accounts,
        activeTab,
        changeTab,
        closeActivity,
        contacts,
        loading,
        loadAll,
        openSearchResult,
        openActivity,
        openAccount,
        openContact,
        refreshActivity,
        recycleBinItems,
        selectedAccount,
        selectedActivity,
        selectedContact,
        session,
    } = usePlaygroundData({ showNotice });
    const recordMutations = useRecordMutations({
        loadAll,
        onActivityDeleted: closeActivity,
        onActivitySaved: refreshActivity,
        showNotice
    });

    if (session === null) {
        return (
            <div>
                <EnvironmentLabelBanner environmentLabel={environmentLabel} />
                {notice ? <NoticeBanner notice={notice} /> : null}
                <SessionLoadingPage />
            </div>
        );
    }

    if (!session.connected) {
        return (
            <div>
                <EnvironmentLabelBanner environmentLabel={environmentLabel} />
                {notice ? <NoticeBanner notice={notice} /> : null}
                <LoginPage />
            </div>
        );
    }

    const workspaceProps = {
        view: {
            activeTab,
            loading
        },
        session: {
            connected: session.connected,
            instanceUrl: session.instanceUrl,
            userId: session.userId,
            userName: session.userName
        },
        recordSelection: {
            accounts,
            contacts,
            selectedAccount,
            selectedActivity,
            selectedContact
        },
        recordActions: {
            onCreateAccount: () => recordMutations.openAccountModal(),
            onCreateContact: () => recordMutations.openContactModal(),
            onDeleteRecord: recordMutations.setDeleteState,
            onEditActivity: recordMutations.openActivityModal,
            onEditAccount: recordMutations.openAccountModal,
            onEditContact: recordMutations.openContactModal,
            onOpenActivity: openActivity,
            onOpenAccount: (record) => openAccount(record.Id),
            onOpenAccountById: openAccount,
            onOpenContact: (record) => openContact(record.Id),
            onBulkDeleteEmpty: () => showNotice({ tone: "info", message: "削除対象がチェックされていません。" }),
            onRefresh: selectedActivity ? () => void refreshActivity(selectedActivity) : loadAll
        },
        integrationForm: {
            accountForm: recordMutations.integrationAccountForm,
            saving: recordMutations.saving,
            onAccountFormChange: recordMutations.setIntegrationAccountForm,
            onCreateAccount: recordMutations.createIntegrationAccount
        },
        recycleBinActions: {
            items: recycleBinItems,
            onRestoreItems: recordMutations.openRestoreModal,
            onRestoreEmpty: () => showNotice({ tone: "info", message: "復元対象がチェックされていません。" })
        }
    } satisfies ComponentProps<typeof PlaygroundWorkspace>;

    const recordModalProps = {
        forms: {
            accountForm: recordMutations.accountForm,
            accountOptions,
            activityLookups: recordMutations.activityLookups,
            contactForm: recordMutations.contactForm,
            eventForm: recordMutations.eventForm,
            taskForm: recordMutations.taskForm,
            onAccountFormChange: recordMutations.setAccountForm,
            onActivityLookupsChange: recordMutations.setActivityLookups,
            onContactFormChange: recordMutations.setContactForm,
            onEventFormChange: recordMutations.setEventForm,
            onTaskFormChange: recordMutations.setTaskForm
        },
        state: {
            deleteState: recordMutations.deleteState,
            modal: recordMutations.modal,
            restoreState: recordMutations.restoreState,
            saving: recordMutations.saving
        },
        actions: {
            onCancelDelete: recordMutations.closeDeleteModal,
            onCancelRestore: recordMutations.closeRestoreModal,
            onCloseRecordModal: recordMutations.closeRecordModal,
            onConfirmDelete: recordMutations.confirmDelete,
            onConfirmRestore: recordMutations.confirmRestore,
            onSaveAccount: recordMutations.saveAccount,
            onSaveActivity: recordMutations.saveActivity,
            onSaveContact: recordMutations.saveContact
        }
    } satisfies ComponentProps<typeof RecordModals>;

    return (
        <div>
            <EnvironmentLabelBanner environmentLabel={environmentLabel} />
            {notice ? <NoticeBanner notice={notice} /> : null}
            <GlobalHeader connected={session.connected} onSelectSearchResult={openSearchResult} />
            <AppNavigation activeTab={activeTab} connected={session.connected} onChange={changeTab} />

            <PlaygroundWorkspace {...workspaceProps} />

            <RecordModals {...recordModalProps} />
        </div>
    );
}
