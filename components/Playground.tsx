"use client";

import Image, { type StaticImageData } from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import accountIcon from "@salesforce-ux/design-system/assets/icons/standard/account.svg";
import contactIcon from "@salesforce-ux/design-system/assets/icons/standard/contact.svg";
import homeIcon from "@salesforce-ux/design-system/assets/icons/standard/home.svg";
import salesforceLogo from "@salesforce-ux/design-system/assets/images/logo-noname.svg";
import {
    buildAccountCreatePayload,
    buildAccountUpdatePayload,
    buildContactCreatePayload,
    buildContactUpdatePayload,
    buildPlaygroundApiRequest,
    playgroundApiPaths
} from "@/lib/playground-api";
import type {
    PlaygroundApiRequest,
    SessionInfo
} from "@/lib/playground-api";
import type {
    AccountForm,
    AccountRecord,
    ContactForm,
    ContactRecord
} from "@/lib/salesforce/records";

type Account = AccountRecord;
type Contact = ContactRecord;

type ModalState =
    | { type: "account"; mode: "create"; record?: undefined }
    | { type: "account"; mode: "edit"; record: Account }
    | { type: "contact"; mode: "create"; record?: undefined }
    | { type: "contact"; mode: "edit"; record: Contact };

type DeleteState =
    | { type: "account"; id: string; label: string }
    | { type: "contact"; id: string; label: string };

type Notice = {
    tone: "success" | "error" | "info";
    message: string;
};

type ActiveTab = "home" | "accounts" | "contacts";

const standardIcons: Record<ActiveTab, StaticImageData> = {
    home: homeIcon,
    accounts: accountIcon,
    contacts: contactIcon
};

const blankAccount: AccountForm = {
    Name: "",
    Phone: "",
    Website: "",
    Industry: "",
    Type: "",
    BillingCity: "",
    BillingCountry: ""
};

const blankContact: ContactForm = {
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Title: "",
    AccountId: ""
};

async function apiRequest<T>({ url, init }: PlaygroundApiRequest): Promise<T> {
    const response = await fetch(url, init);
    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
        throw new Error(data?.error ?? "Request failed.");
    }

    return data as T;
}

async function saveRecord(
    runMutation: () => Promise<string>,
    fallbackErrorMessage: string
): Promise<Notice> {
    try {
        return { tone: "success", message: await runMutation() };
    } catch (error) {
        return {
            tone: "error",
            message: error instanceof Error ? error.message : fallbackErrorMessage
        };
    }
}

function formatDate(value?: string): string {
    if (!value) {
        return "-";
    }
    return new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

export default function Playground() {
    const [session, setSession] = useState<SessionInfo>({ connected: false });
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>("home");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
    const [accountForm, setAccountForm] = useState<AccountForm>(blankAccount);
    const [contactForm, setContactForm] = useState<ContactForm>(blankContact);

    const accountOptions = useMemo(
        () => [...accounts].sort((a, b) => a.Name.localeCompare(b.Name, "ja")),
        [accounts]
    );

    const showNotice = useCallback((nextNotice: Notice) => {
        setNotice(nextNotice);
        window.setTimeout(() => setNotice(null), 5000);
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
        } catch (error) {
            showNotice({
                tone: "error",
                message: error instanceof Error ? error.message : "Salesforce data could not be loaded."
            });
        } finally {
            setLoading(false);
        }
    }, [showNotice]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    function openAccountModal(record?: Account) {
        setAccountForm(
            record
                ? {
                        Name: record.Name ?? "",
                        Phone: record.Phone ?? "",
                        Website: record.Website ?? "",
                        Industry: record.Industry ?? "",
                        Type: record.Type ?? "",
                        BillingCity: record.BillingCity ?? "",
                        BillingCountry: record.BillingCountry ?? ""
                    }
                : blankAccount
        );
        setModal(record ? { type: "account", mode: "edit", record } : { type: "account", mode: "create" });
    }

    function openContactModal(record?: Contact) {
        setContactForm(
            record
                ? {
                        FirstName: record.FirstName ?? "",
                        LastName: record.LastName ?? "",
                        Email: record.Email ?? "",
                        Phone: record.Phone ?? "",
                        Title: record.Title ?? "",
                        AccountId: record.AccountId ?? ""
                    }
                : blankContact
        );
        setModal(record ? { type: "contact", mode: "edit", record } : { type: "contact", mode: "create" });
    }

    async function saveAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!accountForm.Name.trim()) {
            showNotice({ tone: "error", message: "Account Name is required." });
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
                        return "Account was updated.";
                    }

                    const payload = buildAccountCreatePayload(accountForm);
                    await apiRequest(
                        buildPlaygroundApiRequest(playgroundApiPaths.accounts, {
                            method: "POST",
                            body: payload
                        })
                    );
                    return "Account was created.";
                },
                "Account save failed."
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
            showNotice({ tone: "error", message: "Contact Last Name is required." });
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
                        return "Contact was updated.";
                    }

                    const payload = buildContactCreatePayload(contactForm);
                    await apiRequest(
                        buildPlaygroundApiRequest(playgroundApiPaths.contacts, {
                            method: "POST",
                            body: payload
                        })
                    );
                    return "Contact was created.";
                },
                "Contact save failed."
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
            showNotice({ tone: "success", message: `${deleteState.label} was deleted.` });
            setDeleteState(null);
            await loadAll();
        } catch (error) {
            showNotice({ tone: "error", message: error instanceof Error ? error.message : "Delete failed." });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            {notice ? <NoticeBanner notice={notice} /> : null}
            <GlobalHeader connected={session.connected} />
            <AppNavigation activeTab={activeTab} connected={session.connected} onChange={setActiveTab} />

            <main className="slds-template_default">
                <section className="slds-card">
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

                    {activeTab === "accounts" && session.connected ? (
                        <>
                            <ObjectHomeHeader
                                activeTab="accounts"
                                accountsCount={accounts.length}
                                contactsCount={contacts.length}
                                connected={session.connected}
                                instanceUrl={session.instanceUrl}
                                loading={loading}
                                onCreate={() => openAccountModal()}
                                onRefresh={loadAll}
                            />
                        <AccountPanel
                            accounts={accounts}
                            loading={loading}
                            connected={session.connected}
                            onEdit={openAccountModal}
                            onDelete={(record) => setDeleteState({ type: "account", id: record.Id, label: record.Name })}
                        />
                        </>
                    ) : null}

                    {activeTab === "contacts" && session.connected ? (
                        <>
                            <ObjectHomeHeader
                                activeTab="contacts"
                                accountsCount={accounts.length}
                                contactsCount={contacts.length}
                                connected={session.connected}
                                instanceUrl={session.instanceUrl}
                                loading={loading}
                                onCreate={() => openContactModal()}
                                onRefresh={loadAll}
                            />
                        <ContactPanel
                            contacts={contacts}
                            loading={loading}
                            connected={session.connected}
                            onEdit={openContactModal}
                            onDelete={(record) =>
                                setDeleteState({ type: "contact", id: record.Id, label: `${record.FirstName ?? ""} ${record.LastName}`.trim() })
                            }
                        />
                        </>
                    ) : null}
                </section>
            </main>

            {modal?.type === "account" ? (
                <Modal title={modal.mode === "create" ? "New Account" : "Edit Account"} onClose={() => setModal(null)}>
                    <form onSubmit={saveAccount}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <AccountFormFields value={accountForm} onChange={setAccountForm} />
                        </div>
                        <ModalFooter saving={saving} onCancel={() => setModal(null)} />
                    </form>
                </Modal>
            ) : null}

            {modal?.type === "contact" ? (
                <Modal title={modal.mode === "create" ? "New Contact" : "Edit Contact"} onClose={() => setModal(null)}>
                    <form onSubmit={saveContact}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <ContactFormFields value={contactForm} accounts={accountOptions} onChange={setContactForm} />
                        </div>
                        <ModalFooter saving={saving} onCancel={() => setModal(null)} />
                    </form>
                </Modal>
            ) : null}

            {deleteState ? (
                <Modal title="Confirm Delete" onClose={() => setDeleteState(null)} narrow>
                    <div className="slds-modal__content slds-p-around_medium">
                        <p>
                            Delete <strong>{deleteState.label}</strong>? This directly removes the record from Salesforce.
                        </p>
                    </div>
                    <div className="slds-modal__footer">
                        <button className="slds-button slds-button_neutral" type="button" onClick={() => setDeleteState(null)}>
                            Cancel
                        </button>
                        <button className="slds-button slds-button_destructive" type="button" onClick={confirmDelete} disabled={saving}>
                            {saving ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </Modal>
            ) : null}
        </div>
    );
}

function GlobalHeader({ connected }: { connected: boolean }) {
    return (
        <header className="slds-global-header slds-grid slds-grid_align-spread">
            <div className="slds-global-header__item">
                <Image
                    className="salesforce-brand-logo"
                    src={salesforceLogo}
                    alt="Salesforce"
                    width={58}
                    height={40}
                    priority
                />
            </div>
            <div className="slds-global-header__item slds-global-header__item_search slds-show_medium">
                <div className="slds-form-element">
                    <label className="slds-assistive-text" htmlFor="global-search">
                        Search
                    </label>
                    <div className="slds-form-element__control">
                        <input id="global-search" className="slds-input" type="search" placeholder="Search Salesforce" />
                    </div>
                </div>
            </div>
            <div className="slds-global-header__item">
                {connected ? (
                    <form action="/api/auth/logout" method="post">
                        <button className="slds-button slds-button_neutral" type="submit">
                            Disconnect
                        </button>
                    </form>
                ) : (
                    <a className="slds-button slds-button_brand heroku-brand-action" href="/api/auth/login">
                        Connect Salesforce
                    </a>
                )}
            </div>
        </header>
    );
}

function AppNavigation({
    activeTab,
    connected,
    onChange
}: {
    activeTab: ActiveTab;
    connected: boolean;
    onChange: (tab: ActiveTab) => void;
}) {
    return (
        <div className="slds-context-bar heroku-context-bar">
            <div className="slds-context-bar__primary">
                <div className="slds-context-bar__item slds-no-hover">
                    <span className="slds-context-bar__label-action">
                        <span className="slds-truncate" title="Heroku">
                            Heroku
                        </span>
                    </span>
                </div>
            </div>
            <nav className="slds-context-bar__secondary" aria-label="Primary">
                <ul className="slds-grid">
                    <NavigationItem active={activeTab === "home"} label="Home" onClick={() => onChange("home")} />
                    {connected ? <NavigationItem active={activeTab === "accounts"} label="Accounts" onClick={() => onChange("accounts")} /> : null}
                    {connected ? <NavigationItem active={activeTab === "contacts"} label="Contacts" onClick={() => onChange("contacts")} /> : null}
                </ul>
            </nav>
        </div>
    );
}

function NavigationItem({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <li className={`slds-context-bar__item ${active ? "slds-is-active heroku-context-bar__item_active" : ""}`}>
            <button
                className={`slds-button_reset slds-context-bar__label-action ${active ? "heroku-context-bar__label-action_active" : ""}`}
                type="button"
                onClick={onClick}
            >
                <span className="slds-truncate" title={label}>
                    {label}
                </span>
            </button>
        </li>
    );
}

function StandardPageHeaderIcon({ tab, label }: { tab: ActiveTab; label: string }) {
    const iconClass =
        tab === "home" ? "slds-icon-standard-home" : tab === "accounts" ? "slds-icon-standard-account" : "slds-icon-standard-contact";

    return (
        <span className={`slds-icon_container playground-page-header-icon ${iconClass}`} title={label}>
            <Image className="slds-icon slds-page-header__icon playground-page-header-icon__image" src={standardIcons[tab]} alt="" width={36} height={36} aria-hidden="true" />
            <span className="slds-assistive-text">{label}</span>
        </span>
    );
}

function ObjectHomeHeader({
    activeTab,
    accountsCount,
    contactsCount,
    connected,
    instanceUrl,
    loading,
    onCreate,
    onRefresh
}: {
    activeTab: "accounts" | "contacts";
    accountsCount: number;
    contactsCount: number;
    connected: boolean;
    instanceUrl?: string;
    loading: boolean;
    onCreate: () => void;
    onRefresh: () => void;
}) {
    const objectLabel = activeTab === "accounts" ? "Accounts" : "Contacts";
    const recordCount = activeTab === "accounts" ? accountsCount : contactsCount;

    return (
        <div className="slds-page-header slds-page-header_object-home slds-page-header_joined">
            <div className="slds-page-header__row">
                <div className="slds-page-header__col-title">
                    <div className="slds-media">
                        <div className="slds-media__figure">
                            <StandardPageHeaderIcon tab={activeTab} label={objectLabel} />
                        </div>
                        <div className="slds-media__body">
                            <div className="slds-page-header__name">
                                <div className="slds-page-header__name-title">
                                    <p className="slds-text-title_caps">Object</p>
                                    <h1>
                                        <span className="slds-page-header__title slds-truncate" title={objectLabel}>
                                            {objectLabel}
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            <p className="slds-page-header__name-meta">{recordCount} records from Salesforce</p>
                        </div>
                    </div>
                </div>
                <div className="slds-page-header__col-actions">
                    <div className="slds-page-header__controls">
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_neutral" type="button" onClick={onRefresh} disabled={loading}>
                                Refresh
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            {connected ? (
                                <button className="slds-button slds-button_brand heroku-brand-action" type="button" onClick={onCreate}>
                                    New {activeTab === "accounts" ? "Account" : "Contact"}
                                </button>
                            ) : (
                                <a className="slds-button slds-button_brand heroku-brand-action" href="/api/auth/login">
                                    Connect Salesforce
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="slds-page-header__row slds-page-header__row_gutters">
                <div className="slds-page-header__col-details">
                    <ul className="slds-page-header__detail-row">
                        <DetailBlock label="Connection" value={connected ? "Connected" : "Not connected"} />
                        <DetailBlock label="Accounts" value={String(accountsCount)} />
                        <DetailBlock label="Contacts" value={String(contactsCount)} />
                        <DetailBlock label="Instance" value={connected ? instanceUrl ?? "-" : "OAuth required"} />
                    </ul>
                </div>
            </div>
        </div>
    );
}

function HomePanel({
    accountsCount,
    contactsCount,
    connected,
    instanceUrl,
    loading,
    onRefresh
}: {
    accountsCount: number;
    contactsCount: number;
    connected: boolean;
    instanceUrl?: string;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <>
            <div className="slds-page-header slds-page-header_joined">
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-title">
                        <div className="slds-media">
                            <div className="slds-media__figure">
                                <StandardPageHeaderIcon tab="home" label="Home" />
                            </div>
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <p className="slds-text-title_caps">App</p>
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="Salesforce API Playground">
                                                Salesforce API Playground
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                                <p className="slds-page-header__name-meta">OAuth と REST API で Account / Contact を直接操作する学習アプリ</p>
                            </div>
                        </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">
                            <div className="slds-page-header__control">
                                <button className="slds-button slds-button_neutral" type="button" onClick={onRefresh} disabled={loading}>
                                    Refresh
                                </button>
                            </div>
                            <div className="slds-page-header__control">
                                {connected ? (
                                    <form action="/api/auth/logout" method="post">
                                        <button className="slds-button slds-button_neutral" type="submit">
                                            Disconnect
                                        </button>
                                    </form>
                                ) : (
                                    <a className="slds-button slds-button_brand heroku-brand-action" href="/api/auth/login">
                                        Connect Salesforce
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="slds-p-around_medium">
                <div className="slds-grid slds-wrap slds-gutters">
                    <StatusSummary label="Connection" value={connected ? "Connected" : "Not connected"} tone={connected ? "success" : "default"} />
                    <StatusSummary label="Accounts" value={String(accountsCount)} />
                    <StatusSummary label="Contacts" value={String(contactsCount)} />
                    <StatusSummary label="Instance" value={connected ? instanceUrl ?? "-" : "OAuth required"} />
                </div>
            </div>
        </>
    );
}

function StatusSummary({
    label,
    value,
    tone = "default"
}: {
    label: string;
    value: string;
    tone?: "default" | "success";
}) {
    return (
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-4">
            <article className={`slds-tile slds-box slds-box_x-small ${tone === "success" ? "slds-theme_success" : "slds-theme_default"}`}>
                <h2 className="slds-tile__title slds-truncate" title={label}>
                    {label}
                </h2>
                <div className="slds-tile__detail">
                    <p className="slds-truncate" title={value}>
                        {value}
                    </p>
                </div>
            </article>
        </div>
    );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <li className="slds-page-header__detail-block">
            <p className="slds-text-title slds-truncate" title={label}>
                {label}
            </p>
            <p className="slds-truncate" title={value}>
                {value}
            </p>
        </li>
    );
}

function NoticeBanner({ notice }: { notice: Notice }) {
    const theme = notice.tone === "success" ? "slds-theme_success" : notice.tone === "error" ? "slds-theme_error" : "slds-theme_info";
    return (
        <div className="slds-notify_container">
            <div className={`slds-notify slds-notify_toast ${theme}`} role="status">
                <div className="slds-notify__content">
                    <h2 className="slds-text-heading_small">{notice.message}</h2>
                </div>
            </div>
        </div>
    );
}

function AccountPanel({
    accounts,
    loading,
    connected,
    onEdit,
    onDelete
}: {
    accounts: Account[];
    loading: boolean;
    connected: boolean;
    onEdit: (record: Account) => void;
    onDelete: (record: Account) => void;
}) {
    return (
        <div>
            <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-around_small slds-border_bottom">
                <div className="slds-media__body">
                    <h2 className="slds-text-heading_small">Recently Viewed</h2>
                    <p className="slds-text-body_small slds-text-color_weak">Sorted by last modified date</p>
                </div>
                <span className="slds-badge">{accounts.length} items</span>
            </div>
            {loading ? <EmptyState message="Loading Accounts..." /> : null}
            {!loading && accounts.length === 0 ? <EmptyState message={connected ? "No Accounts found." : "Connect Salesforce to load Accounts."} /> : null}
            {!loading && accounts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Website</th>
                                <th>Industry</th>
                                <th>Billing</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr className="slds-hint-parent" key={account.Id}>
                                    <th scope="row">
                                        <div className="slds-truncate" title={account.Name}>
                                            {account.Name}
                                        </div>
                                    </th>
                                    <TableCell value={account.Phone} />
                                    <TableCell value={account.Website} />
                                    <TableCell value={account.Industry} />
                                    <TableCell value={[account.BillingCity, account.BillingCountry].filter(Boolean).join(", ")} />
                                    <TableCell value={formatDate(account.LastModifiedDate)} />
                                    <td>
                                        <div className="slds-button-group" role="group">
                                            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(account)}>
                                                Edit
                                            </button>
                                            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(account)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

function ContactPanel({
    contacts,
    loading,
    connected,
    onEdit,
    onDelete
}: {
    contacts: Contact[];
    loading: boolean;
    connected: boolean;
    onEdit: (record: Contact) => void;
    onDelete: (record: Contact) => void;
}) {
    return (
        <div>
            <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-around_small slds-border_bottom">
                <div className="slds-media__body">
                    <h2 className="slds-text-heading_small">Recently Viewed</h2>
                    <p className="slds-text-body_small slds-text-color_weak">Sorted by last modified date</p>
                </div>
                <span className="slds-badge">{contacts.length} items</span>
            </div>
            {loading ? <EmptyState message="Loading Contacts..." /> : null}
            {!loading && contacts.length === 0 ? <EmptyState message={connected ? "No Contacts found." : "Connect Salesforce to load Contacts."} /> : null}
            {!loading && contacts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Account</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Title</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr className="slds-hint-parent" key={contact.Id}>
                                    <th scope="row">
                                        <div className="slds-truncate" title={`${contact.FirstName ?? ""} ${contact.LastName}`.trim()}>
                                            {`${contact.FirstName ?? ""} ${contact.LastName}`.trim()}
                                        </div>
                                    </th>
                                    <TableCell value={contact.Account?.Name} />
                                    <TableCell value={contact.Email} />
                                    <TableCell value={contact.Phone} />
                                    <TableCell value={contact.Title} />
                                    <TableCell value={formatDate(contact.LastModifiedDate)} />
                                    <td>
                                        <div className="slds-button-group" role="group">
                                            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(contact)}>
                                                Edit
                                            </button>
                                            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(contact)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

function TableCell({ value }: { value?: string }) {
    const displayValue = value || "-";
    return (
        <td>
            <div className="slds-truncate" title={displayValue}>
                {displayValue}
            </div>
        </td>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="slds-text-align_center slds-p-around_xx-large">
            <span className="slds-icon_container slds-icon-utility-info slds-m-bottom_small" aria-hidden="true">
                <span className="slds-assistive-text">Info</span>
            </span>
            <p>{message}</p>
        </div>
    );
}

function Modal({
    title,
    onClose,
    narrow,
    children
}: {
    title: string;
    onClose: () => void;
    narrow?: boolean;
    children: React.ReactNode;
}) {
    return (
        <>
            <section className={`slds-modal slds-fade-in-open ${narrow ? "slds-modal_small" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="slds-modal__container">
                    <header className="slds-modal__header">
                        <button className="slds-button slds-button_icon slds-modal__close" type="button" onClick={onClose} aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h2 className="slds-modal__title slds-hyphenate">{title}</h2>
                    </header>
                    {children}
                </div>
            </section>
            <div className="slds-backdrop slds-backdrop_open" />
        </>
    );
}

function ModalFooter({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
    return (
        <div className="slds-modal__footer">
            <button className="slds-button slds-button_neutral" type="button" onClick={onCancel}>
                Cancel
            </button>
            <button className="slds-button slds-button_brand heroku-brand-action" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
}

function AccountFormFields({
    value,
    onChange
}: {
    value: AccountForm;
    onChange: (value: AccountForm) => void;
}) {
    return (
        <div className="slds-grid slds-wrap slds-gutters">
            <TextField label="Account Name" required value={value.Name} onChange={(Name) => onChange({ ...value, Name })} />
            <TextField label="Phone" value={value.Phone} onChange={(Phone) => onChange({ ...value, Phone })} />
            <TextField label="Website" value={value.Website} onChange={(Website) => onChange({ ...value, Website })} />
            <TextField label="Industry" value={value.Industry} onChange={(Industry) => onChange({ ...value, Industry })} />
            <TextField label="Type" value={value.Type} onChange={(Type) => onChange({ ...value, Type })} />
            <TextField label="Billing City" value={value.BillingCity} onChange={(BillingCity) => onChange({ ...value, BillingCity })} />
            <TextField label="Billing Country" value={value.BillingCountry} onChange={(BillingCountry) => onChange({ ...value, BillingCountry })} />
        </div>
    );
}

function ContactFormFields({
    value,
    accounts,
    onChange
}: {
    value: ContactForm;
    accounts: Account[];
    onChange: (value: ContactForm) => void;
}) {
    return (
        <div className="slds-grid slds-wrap slds-gutters">
            <TextField label="First Name" value={value.FirstName} onChange={(FirstName) => onChange({ ...value, FirstName })} />
            <TextField label="Last Name" required value={value.LastName} onChange={(LastName) => onChange({ ...value, LastName })} />
            <TextField label="Email" type="email" value={value.Email} onChange={(Email) => onChange({ ...value, Email })} />
            <TextField label="Phone" value={value.Phone} onChange={(Phone) => onChange({ ...value, Phone })} />
            <TextField label="Title" value={value.Title} onChange={(Title) => onChange({ ...value, Title })} />
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor="contact-account">
                    Account
                </label>
                <div className="slds-form-element__control">
                    <select
                        id="contact-account"
                        className="slds-select"
                        value={value.AccountId}
                        onChange={(event) => onChange({ ...value, AccountId: event.target.value })}
                    >
                        <option value="">No Account</option>
                        {accounts.map((account) => (
                            <option key={account.Id} value={account.Id}>
                                {account.Name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

function TextField({
    label,
    value,
    onChange,
    type = "text",
    required = false
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    const id = label.toLowerCase().replaceAll(" ", "-");
    return (
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-form-element">
            <label className="slds-form-element__label" htmlFor={id}>
                {required ? <abbr className="slds-required" title="required">*</abbr> : null}
                {label}
            </label>
            <div className="slds-form-element__control">
                <input
                    id={id}
                    className="slds-input"
                    type={type}
                    required={required}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
}
