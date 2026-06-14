"use client";

import { useEffect, type ComponentProps } from "react";
import { usePathname } from "next/navigation";
import type { EnvironmentLabel } from "@/lib/environment-label";
import { getVisibleComponentLogGroups } from "./playground/component-logs";
import { EnvironmentLabelBanner } from "./playground/shell/EnvironmentLabelBanner";
import { AppNavigation } from "./playground/shell/Navigation";
import { GlobalHeader } from "./playground/shell/GlobalHeader";
import { LoginPage, SessionLoadingPage } from "./playground/shell/LoginPage";
import { NoticeBanner } from "./playground/shell/NoticeBanner";
import { PlaygroundWorkspace } from "./playground/PlaygroundWorkspace";
import { RecordModals } from "./playground/records/RecordModals";
import { UtilityBar } from "./playground/shell/UtilityBar";
import { useNotice } from "./playground/shell/useNotice";
import { usePlaygroundData } from "./playground/hooks/usePlaygroundData";
import { usePlaygroundPicklists } from "./playground/hooks/usePlaygroundPicklists";
import { useRecordMutations } from "./playground/records/useRecordMutations";

export default function Playground({ environmentLabel = null }: { environmentLabel?: EnvironmentLabel | null }) {
    const pathname = usePathname();
    const { notice, showNotice } = useNotice();
    const {
        accountOptions,
        accounts,
        activeTab,
        activityCounts,
        closeActivity,
        contacts,
        loading,
        loadAll,
        openSearchResult,
        openActivity,
        openAccount,
        openContact,
        refreshActivity,
        recordCounts,
        recycleBinItems,
        selectedAccount,
        selectedActivity,
        selectedContact,
        session,
        userCounts,
    } = usePlaygroundData({ showNotice });
    const recordMutations = useRecordMutations({
        loadAll,
        onActivityDeleted: closeActivity,
        onActivitySaved: refreshActivity,
        showNotice
    });
    const { setDeleteState, setModal, setRestoreState } = recordMutations;

    useEffect(() => {
        setDeleteState(null);
        setModal(null);
        setRestoreState(null);
    }, [pathname, setDeleteState, setModal, setRestoreState]);

    const connected = session?.connected === true;
    const picklists = usePlaygroundPicklists({
        accountForm: recordMutations.accountForm,
        connected,
        integrationAccountForm: recordMutations.integrationAccountForm,
        modal: recordMutations.modal,
        taskForm: recordMutations.taskForm
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
            activityCounts,
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
            selectedContact,
            recordCounts,
            userCounts
        },
        recordActions: {
            onCreateAccount: () => recordMutations.openAccountModal(),
            onCreateContact: () => recordMutations.openContactModal(),
            onDeleteRecord: recordMutations.setDeleteState,
            onEditActivity: recordMutations.openActivityModal,
            onEditAccount: recordMutations.openAccountModal,
            onEditContact: recordMutations.openContactModal,
            onOpenActivity: openActivity,
            onOpenAccountById: openAccount,
            onOpenContact: (record) => openContact(record.Id),
            onOpenContactById: openContact,
            onBulkDeleteEmpty: () => showNotice({ tone: "info", message: "削除対象がチェックされていません。" }),
            onRefresh: selectedActivity ? () => void refreshActivity(selectedActivity) : loadAll
        },
        integrationForm: {
            accountForm: recordMutations.integrationAccountForm,
            accountPicklistError: picklists.integrationAccountPicklists.error,
            accountPicklistLoading: picklists.integrationAccountPicklists.loading,
            accountPicklistOptions: picklists.integrationAccountPicklists.options,
            saving: recordMutations.saving,
            onAccountFormChange: recordMutations.setIntegrationAccountForm,
            onCreateAccount: recordMutations.createIntegrationAccount
        },
        picklists: {
            taskStatusOptions: picklists.taskStatusOptions
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
        picklists: {
            accountError: picklists.accountModalPicklists.error,
            accountLoading: picklists.accountModalPicklists.loading,
            accountOptions: picklists.accountModalPicklists.options,
            taskStatusOptions: picklists.taskStatusOptions
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

    const shellClassName = [
        "playground-shell",
        "playground-shell_has-utility-bar",
        environmentLabel ? "playground-shell_has-environment-label" : ""
    ].filter(Boolean).join(" ");
    const componentLogGroups = getVisibleComponentLogGroups({
        activeTab,
        hasSelectedAccount: selectedAccount !== null,
        hasSelectedActivity: selectedActivity !== null,
        hasSelectedContact: selectedContact !== null
    });

    return (
        <div className={shellClassName}>
            {notice ? <NoticeBanner notice={notice} /> : null}
            <GlobalHeader
                connected={session.connected}
                environmentLabel={environmentLabel}
                instanceUrl={session.instanceUrl}
                onCreateEvent={() => recordMutations.openActivityCreateModal("event", { userId: session.userId, userName: session.userName })}
                onCreateTask={() => recordMutations.openActivityCreateModal("task", { userId: session.userId, userName: session.userName })}
                userName={session.userName}
                onSelectSearchResult={openSearchResult}
            >
                <AppNavigation
                    activeTab={activeTab}
                    connected={session.connected}
                    onCreateAccount={() => recordMutations.openAccountModal()}
                    onCreateContact={() => recordMutations.openContactModal()}
                />
            </GlobalHeader>

            <PlaygroundWorkspace {...workspaceProps} />

            <RecordModals {...recordModalProps} />
            <UtilityBar componentLogGroups={componentLogGroups} />
        </div>
    );
}
