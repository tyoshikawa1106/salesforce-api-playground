"use client";

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
        contacts,
        loading,
        loadAll,
        openSearchResult,
        recycleBinItems,
        selectedAccount,
        selectedContact,
        session,
        setSelectedAccountId,
        setSelectedContactId
    } = usePlaygroundData({ showNotice });
    const recordMutations = useRecordMutations({ loadAll, showNotice });

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

    return (
        <div>
            <EnvironmentLabelBanner environmentLabel={environmentLabel} />
            {notice ? <NoticeBanner notice={notice} /> : null}
            <GlobalHeader connected={session.connected} onSelectSearchResult={openSearchResult} />
            <AppNavigation activeTab={activeTab} connected={session.connected} onChange={changeTab} />

            <PlaygroundWorkspace
                accountForm={recordMutations.integrationAccountForm}
                accounts={accounts}
                activeTab={activeTab}
                connected={session.connected}
                contacts={contacts}
                recycleBinItems={recycleBinItems}
                instanceUrl={session.instanceUrl}
                loading={loading}
                saving={recordMutations.saving}
                selectedAccount={selectedAccount}
                selectedContact={selectedContact}
                onAccountFormChange={recordMutations.setIntegrationAccountForm}
                onCreateAccount={() => recordMutations.openAccountModal()}
                onCreateContact={() => recordMutations.openContactModal()}
                onCreateIntegrationAccount={recordMutations.createIntegrationAccount}
                onDeleteRecord={recordMutations.setDeleteState}
                onEditAccount={recordMutations.openAccountModal}
                onEditContact={recordMutations.openContactModal}
                onOpenAccount={(record) => setSelectedAccountId(record.Id)}
                onOpenContact={(record) => setSelectedContactId(record.Id)}
                onBulkDeleteEmpty={() => showNotice({ tone: "info", message: "削除対象がチェックされていません。" })}
                onRestoreRecycleBinItems={recordMutations.openRestoreModal}
                onRestoreRecycleBinEmpty={() => showNotice({ tone: "info", message: "復元対象がチェックされていません。" })}
                onRefresh={loadAll}
            />

            <RecordModals
                accountForm={recordMutations.accountForm}
                accountOptions={accountOptions}
                contactForm={recordMutations.contactForm}
                deleteState={recordMutations.deleteState}
                modal={recordMutations.modal}
                restoreState={recordMutations.restoreState}
                saving={recordMutations.saving}
                onAccountFormChange={recordMutations.setAccountForm}
                onCancelDelete={recordMutations.closeDeleteModal}
                onCancelRestore={recordMutations.closeRestoreModal}
                onCloseRecordModal={recordMutations.closeRecordModal}
                onConfirmDelete={recordMutations.confirmDelete}
                onConfirmRestore={recordMutations.confirmRestore}
                onContactFormChange={recordMutations.setContactForm}
                onSaveAccount={recordMutations.saveAccount}
                onSaveContact={recordMutations.saveContact}
            />
        </div>
    );
}
