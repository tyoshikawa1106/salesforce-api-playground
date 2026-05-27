"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    buildAccountCreatePayload,
    buildAccountUpdatePayload,
    buildContactCreatePayload,
    buildContactUpdatePayload,
    buildPlaygroundApiRequest,
    playgroundApiPaths
} from "@/lib/playground-api";
import type { SessionInfo } from "@/lib/playground-api";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import { apiRequest, PlaygroundApiError, saveRecord } from "./playground/api";
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
import type { Account, ActiveTab, Contact, DeleteState, ModalState, Notice } from "./playground/types";

export default function Playground() {
    const [session, setSession] = useState<SessionInfo>({ connected: false });
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>("home");
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
    const [accountForm, setAccountForm] = useState<AccountForm>(blankAccount);
    const [integrationAccountForm, setIntegrationAccountForm] = useState<AccountForm>(blankAccount);
    const [contactForm, setContactForm] = useState<ContactForm>(blankContact);
    const noticeTimer = useRef<number | null>(null);

    const accountOptions = useMemo(
        () => [...accounts].sort((a, b) => a.Name.localeCompare(b.Name, "ja")),
        [accounts]
    );
    const selectedAccount = useMemo(
        () => accounts.find((account) => account.Id === selectedAccountId) ?? null,
        [accounts, selectedAccountId]
    );
    const selectedContact = useMemo(
        () => contacts.find((contact) => contact.Id === selectedContactId) ?? null,
        [contacts, selectedContactId]
    );

    const showNotice = useCallback((nextNotice: Notice) => {
        if (noticeTimer.current !== null) {
            window.clearTimeout(noticeTimer.current);
        }
        setNotice(nextNotice);
        noticeTimer.current = window.setTimeout(() => {
            setNotice(null);
            noticeTimer.current = null;
        }, 5000);
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const nextSession = await apiRequest<SessionInfo>(
                buildPlaygroundApiRequest(playgroundApiPaths.session)
            );
            setSession(nextSession);
            if (!nextSession.connected) {
                setAccounts([]);
                setContacts([]);
                setActiveTab("home");
                return;
            }

            const [accountResult, contactResult] = await Promise.all([
                apiRequest<{ accounts: Account[] }>(
                    buildPlaygroundApiRequest(playgroundApiPaths.accounts)
                ),
                apiRequest<{ contacts: Contact[] }>(
                    buildPlaygroundApiRequest(playgroundApiPaths.contacts)
                )
            ]);
            setAccounts(accountResult.accounts);
            setContacts(contactResult.contacts);
            setSelectedAccountId((currentId) =>
                currentId && accountResult.accounts.some((account) => account.Id === currentId) ? currentId : null
            );
            setSelectedContactId((currentId) =>
                currentId && contactResult.contacts.some((contact) => contact.Id === currentId) ? currentId : null
            );
        } catch (error) {
            if (error instanceof PlaygroundApiError && error.status === 401) {
                setSession({ connected: false });
                setAccounts([]);
                setContacts([]);
                setActiveTab("home");
                setSelectedAccountId(null);
                setSelectedContactId(null);
            }
            showNotice({
                tone: "error",
                message: error instanceof Error ? error.message : "Salesforce データを読み込めませんでした。"
            });
        } finally {
            setLoading(false);
        }
    }, [showNotice]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        setActiveTab(nextTab);
        setSelectedAccountId(null);
        setSelectedContactId(null);
        void loadAll();
    }, [loadAll]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    useEffect(() => {
        return () => {
            if (noticeTimer.current !== null) {
                window.clearTimeout(noticeTimer.current);
            }
        };
    }, []);

    if (loading && !session.connected) {
        return (
            <div>
                {notice ? <NoticeBanner notice={notice} /> : null}
                <LoginPage loading />
            </div>
        );
    }

    if (!session.connected) {
        return (
            <div>
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

    async function saveAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!accountForm.Name.trim()) {
            showNotice({ tone: "error", message: "取引先名は必須です。" });
            return;
        }

        setSaving(true);
        try {
            const saveNotice = await saveRecord(
                async () => {
                    if (modal?.type === "account" && modal.mode === "edit") {
                        const payload = buildAccountUpdatePayload(accountForm);
                        await apiRequest(
                            buildPlaygroundApiRequest(playgroundApiPaths.record("accounts", modal.record.Id), {
                                method: "PATCH",
                                body: payload
                            })
                        );
                        return "取引先を更新しました。";
                    }

                    const payload = buildAccountCreatePayload(accountForm);
                    await apiRequest(
                        buildPlaygroundApiRequest(playgroundApiPaths.accounts, {
                            method: "POST",
                            body: payload
                        })
                    );
                    return "取引先を作成しました。";
                },
                "取引先の保存に失敗しました。"
            );
            showNotice(saveNotice);
            if (saveNotice.tone === "success") {
                setModal(null);
                await loadAll();
            }
        } finally {
            setSaving(false);
        }
    }

    async function saveContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!contactForm.LastName.trim()) {
            showNotice({ tone: "error", message: "取引先責任者の姓は必須です。" });
            return;
        }

        setSaving(true);
        try {
            const saveNotice = await saveRecord(
                async () => {
                    if (modal?.type === "contact" && modal.mode === "edit") {
                        const payload = buildContactUpdatePayload(contactForm);
                        await apiRequest(
                            buildPlaygroundApiRequest(playgroundApiPaths.record("contacts", modal.record.Id), {
                                method: "PATCH",
                                body: payload
                            })
                        );
                        return "取引先責任者を更新しました。";
                    }

                    const payload = buildContactCreatePayload(contactForm);
                    await apiRequest(
                        buildPlaygroundApiRequest(playgroundApiPaths.contacts, {
                            method: "POST",
                            body: payload
                        })
                    );
                    return "取引先責任者を作成しました。";
                },
                "取引先責任者の保存に失敗しました。"
            );
            showNotice(saveNotice);
            if (saveNotice.tone === "success") {
                setModal(null);
                await loadAll();
            }
        } finally {
            setSaving(false);
        }
    }

    async function createIntegrationAccountFromTab(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!integrationAccountForm.Name.trim()) {
            showNotice({ tone: "error", message: "取引先名は必須です。" });
            return;
        }

        setSaving(true);
        try {
            const saveNotice = await saveRecord(
                async () => {
                    const payload = buildAccountCreatePayload(integrationAccountForm);
                    await apiRequest(
                        buildPlaygroundApiRequest(playgroundApiPaths.integrationAccounts, {
                            method: "POST",
                            body: payload
                        })
                    );
                    return "連携ユーザーで取引先を作成しました。";
                },
                "連携ユーザーでの取引先作成に失敗しました。"
            );
            showNotice(saveNotice);
            if (saveNotice.tone === "success") {
                setIntegrationAccountForm(blankAccount);
                await loadAll();
            }
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete() {
        if (!deleteState) {
            return;
        }

        setSaving(true);
        try {
            const resource = deleteState.type === "account" ? "accounts" : "contacts";
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.record(resource, deleteState.id), {
                    method: "DELETE"
                })
            );
            showNotice({ tone: "success", message: `${deleteState.label} を削除しました。` });
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
            {notice ? <NoticeBanner notice={notice} /> : null}
            <GlobalHeader connected={session.connected} />
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
                                accountsCount={accounts.length}
                                contactsCount={contacts.length}
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
                                onRefresh={loadAll}
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
                                accountsCount={accounts.length}
                                contactsCount={contacts.length}
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
                                onRefresh={loadAll}
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
