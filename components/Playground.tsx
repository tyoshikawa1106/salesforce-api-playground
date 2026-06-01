"use client";

import { FormEvent, useState } from "react";
import type { EnvironmentLabel } from "@/lib/environment-label";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import { saveRecord } from "./playground/api";
import { EnvironmentLabelBanner } from "./playground/EnvironmentLabelBanner";
import { AppNavigation } from "./playground/Navigation";
import { GlobalHeader } from "./playground/GlobalHeader";
import { LoginPage } from "./playground/LoginPage";
import { NoticeBanner } from "./playground/NoticeBanner";
import { HomePanel, IntegrationPanel, ObjectHomeHeader } from "./playground/ObjectHome";
import { AccountPanel, ContactPanel } from "./playground/RecordLists";
import { AccountRecordPage, ContactRecordPage } from "./playground/RecordPages";
import {
    AccountFormFields,
    accountRecordToForm,
    blankAccount,
    blankContact,
    ContactFormFields,
    contactRecordToForm
} from "./playground/Forms";
import { Modal, ModalFooter } from "./playground/Modal";
import { getContactName } from "./playground/formatting";
import type { Account, Contact, DeleteState, ModalState } from "./playground/types";
import {
    createIntegrationAccountMutation,
    deleteRecordMutation,
    saveAccountMutation,
    saveContactMutation
} from "./playground/mutations";
import { useNotice } from "./playground/useNotice";
import { usePlaygroundData } from "./playground/usePlaygroundData";

export default function Playground({ environmentLabel = null }: { environmentLabel?: EnvironmentLabel | null }) {
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
    const [accountForm, setAccountForm] = useState<AccountForm>(blankAccount);
    const [integrationAccountForm, setIntegrationAccountForm] = useState<AccountForm>(blankAccount);
    const [contactForm, setContactForm] = useState<ContactForm>(blankContact);
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
        selectedAccount,
        selectedContact,
        session,
        setSelectedAccountId,
        setSelectedContactId
    } = usePlaygroundData({ showNotice });

    if (loading && !session.connected) {
        return (
            <div>
                <EnvironmentLabelBanner environmentLabel={environmentLabel} />
                {notice ? <NoticeBanner notice={notice} /> : null}
                <LoginPage loading />
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

    function openAccountModal(record?: Account) {
        setAccountForm(accountRecordToForm(record));
        setModal(record ? { type: "account", mode: "edit", record } : { type: "account", mode: "create" });
    }

    function openContactModal(record?: Contact) {
        setContactForm(contactRecordToForm(record));
        setModal(record ? { type: "contact", mode: "edit", record } : { type: "contact", mode: "create" });
    }

    async function runSaveMutation(
        runMutation: () => Promise<string>,
        fallbackErrorMessage: string,
        onSuccess: () => Promise<void> | void
    ) {
        setSaving(true);
        try {
            const saveNotice = await saveRecord(runMutation, fallbackErrorMessage);
            showNotice(saveNotice);
            if (saveNotice.tone === "success") {
                await onSuccess();
            }
        } finally {
            setSaving(false);
        }
    }

    async function saveAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!accountForm.Name.trim()) {
            showNotice({ tone: "error", message: "取引先名は必須です。" });
            return;
        }

        await runSaveMutation(
            () => saveAccountMutation(modal, accountForm),
            "取引先の保存に失敗しました。",
            async () => {
                setModal(null);
                await loadAll();
            }
        );
    }

    async function saveContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!contactForm.LastName.trim()) {
            showNotice({ tone: "error", message: "取引先責任者の姓は必須です。" });
            return;
        }

        await runSaveMutation(
            () => saveContactMutation(modal, contactForm),
            "取引先責任者の保存に失敗しました。",
            async () => {
                setModal(null);
                await loadAll();
            }
        );
    }

    async function createIntegrationAccountFromTab(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!integrationAccountForm.Name.trim()) {
            showNotice({ tone: "error", message: "取引先名は必須です。" });
            return;
        }

        await runSaveMutation(
            () => createIntegrationAccountMutation(integrationAccountForm),
            "連携ユーザーでの取引先作成に失敗しました。",
            async () => {
                setIntegrationAccountForm(blankAccount);
                await loadAll();
            }
        );
    }

    async function confirmDelete() {
        if (!deleteState) {
            return;
        }

        setSaving(true);
        try {
            showNotice({ tone: "success", message: await deleteRecordMutation(deleteState) });
            setDeleteState(null);
            await loadAll();
        } catch (error) {
            showNotice({ tone: "error", message: error instanceof Error ? error.message : "削除に失敗しました。" });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <EnvironmentLabelBanner environmentLabel={environmentLabel} />
            {notice ? <NoticeBanner notice={notice} /> : null}
            <GlobalHeader connected={session.connected} onSelectSearchResult={openSearchResult} />
            <AppNavigation activeTab={activeTab} connected={session.connected} onChange={changeTab} />

            <main className="slds-template_default">
                <section className={activeTab === "home" ? "slds-card" : "playground-workspace"}>
                    {activeTab === "home" ? (
                        <HomePanel
                            accountsCount={accounts.length}
                            contactsCount={contacts.length}
                            connected={session.connected}
                            instanceUrl={session.instanceUrl}
                            loading={loading}
                            onRefresh={loadAll}
                        />
                    ) : null}

                    {activeTab === "accounts" && session.connected && !selectedAccount ? (
                        <>
                            <ObjectHomeHeader
                                activeTab="accounts"
                                loading={loading}
                                onCreate={() => openAccountModal()}
                                onRefresh={loadAll}
                            />
                            <AccountPanel
                                accounts={accounts}
                                loading={loading}
                                connected={session.connected}
                                onOpen={(record) => setSelectedAccountId(record.Id)}
                                onEdit={openAccountModal}
                                onDelete={(record) => setDeleteState({ type: "account", id: record.Id, label: record.Name })}
                            />
                        </>
                    ) : null}

                    {activeTab === "accounts" && session.connected && selectedAccount ? (
                        <AccountRecordPage
                            account={selectedAccount}
                            contacts={contacts.filter((contact) => contact.AccountId === selectedAccount.Id)}
                            onDelete={(record) => setDeleteState({ type: "account", id: record.Id, label: record.Name })}
                            onEdit={openAccountModal}
                            onRefresh={loadAll}
                            loading={loading}
                        />
                    ) : null}

                    {activeTab === "contacts" && session.connected && !selectedContact ? (
                        <>
                            <ObjectHomeHeader
                                activeTab="contacts"
                                loading={loading}
                                onCreate={() => openContactModal()}
                                onRefresh={loadAll}
                            />
                            <ContactPanel
                                contacts={contacts}
                                loading={loading}
                                connected={session.connected}
                                onOpen={(record) => setSelectedContactId(record.Id)}
                                onEdit={openContactModal}
                                onDelete={(record) =>
                                    setDeleteState({ type: "contact", id: record.Id, label: `${record.FirstName ?? ""} ${record.LastName}`.trim() })
                                }
                            />
                        </>
                    ) : null}

                    {activeTab === "contacts" && session.connected && selectedContact ? (
                        <ContactRecordPage
                            contact={selectedContact}
                            onDelete={(record) =>
                                setDeleteState({ type: "contact", id: record.Id, label: getContactName(record) })
                            }
                            onEdit={openContactModal}
                            onRefresh={loadAll}
                            loading={loading}
                        />
                    ) : null}

                    {activeTab === "integration" && session.connected ? (
                        <IntegrationPanel
                            accountForm={integrationAccountForm}
                            loading={loading}
                            saving={saving}
                            onAccountFormChange={setIntegrationAccountForm}
                            onCreateAccount={createIntegrationAccountFromTab}
                            onRefresh={loadAll}
                        />
                    ) : null}
                </section>
            </main>

            {modal?.type === "account" ? (
                <Modal title={modal.mode === "create" ? "新規取引先" : "取引先を編集"} onClose={() => setModal(null)}>
                    <form onSubmit={saveAccount}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <AccountFormFields value={accountForm} onChange={setAccountForm} />
                        </div>
                        <ModalFooter saving={saving} onCancel={() => setModal(null)} />
                    </form>
                </Modal>
            ) : null}

            {modal?.type === "contact" ? (
                <Modal title={modal.mode === "create" ? "新規取引先責任者" : "取引先責任者を編集"} onClose={() => setModal(null)}>
                    <form onSubmit={saveContact}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <ContactFormFields value={contactForm} accounts={accountOptions} onChange={setContactForm} />
                        </div>
                        <ModalFooter saving={saving} onCancel={() => setModal(null)} />
                    </form>
                </Modal>
            ) : null}

            {deleteState ? (
                <Modal title="削除の確認" onClose={() => setDeleteState(null)} narrow>
                    <div className="slds-modal__content slds-p-around_medium">
                        <p>
                            <strong>{deleteState.label}</strong> を削除しますか？ Salesforce からレコードを直接削除します。
                        </p>
                    </div>
                    <div className="slds-modal__footer">
                        <button className="slds-button slds-button_neutral" type="button" onClick={() => setDeleteState(null)}>
                            キャンセル
                        </button>
                        <button className="slds-button slds-button_destructive" type="button" onClick={confirmDelete} disabled={saving}>
                            {saving ? "削除中..." : "削除"}
                        </button>
                    </div>
                </Modal>
            ) : null}
        </div>
    );
}
