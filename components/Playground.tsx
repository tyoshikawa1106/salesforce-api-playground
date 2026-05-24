"use client";

import Image, { type StaticImageData } from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import accountIcon from "@salesforce-ux/design-system/assets/icons/standard/account.svg";
import contactIcon from "@salesforce-ux/design-system/assets/icons/standard/contact.svg";
import homeIcon from "@salesforce-ux/design-system/assets/icons/standard/home.svg";
import refreshIcon from "@salesforce-ux/design-system/assets/icons/utility/refresh.svg";
import settingsIcon from "@salesforce-ux/design-system/assets/icons/utility/settings.svg";
import tableIcon from "@salesforce-ux/design-system/assets/icons/utility/table.svg";
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

const utilityIcons = {
    refresh: refreshIcon,
    settings: settingsIcon,
    table: tableIcon
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
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
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
    const selectedAccount = useMemo(
        () => accounts.find((account) => account.Id === selectedAccountId) ?? null,
        [accounts, selectedAccountId]
    );
    const selectedContact = useMemo(
        () => contacts.find((contact) => contact.Id === selectedContactId) ?? null,
        [contacts, selectedContactId]
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
            setSelectedAccountId((currentId) =>
                currentId && accountResult.accounts.some((account) => account.Id === currentId) ? currentId : null
            );
            setSelectedContactId((currentId) =>
                currentId && contactResult.contacts.some((contact) => contact.Id === currentId) ? currentId : null
            );
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
                            onBack={() => setSelectedAccountId(null)}
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
                            onBack={() => setSelectedContactId(null)}
                            onDelete={(record) =>
                                setDeleteState({ type: "contact", id: record.Id, label: getContactName(record) })
                            }
                            onEdit={openContactModal}
                            onRefresh={loadAll}
                            loading={loading}
                        />
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
                <div className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click slds-no-hover">
                    <div className="slds-context-bar__icon-action">
                        <button className="slds-button slds-icon-waffle_container slds-context-bar__button" type="button" title="Open App Launcher">
                            <AppLauncherIcon />
                            <span className="slds-assistive-text">Open App Launcher</span>
                        </button>
                    </div>
                    <span className="slds-context-bar__label-action slds-context-bar__app-name">
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

function AppLauncherIcon() {
    return (
        <span className="slds-icon-waffle" aria-hidden="true">
            <span className="slds-r1" />
            <span className="slds-r2" />
            <span className="slds-r3" />
            <span className="slds-r4" />
            <span className="slds-r5" />
            <span className="slds-r6" />
            <span className="slds-r7" />
            <span className="slds-r8" />
            <span className="slds-r9" />
        </span>
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

function UtilityButtonIcon({ name, label }: { name: keyof typeof utilityIcons; label: string }) {
    return <Image className="slds-button__icon" src={utilityIcons[name]} alt={label} width={16} height={16} />;
}

function ObjectHomeHeader({
    activeTab,
    accountsCount,
    contactsCount,
    loading,
    onCreate,
    onRefresh
}: {
    activeTab: "accounts" | "contacts";
    accountsCount: number;
    contactsCount: number;
    loading: boolean;
    onCreate: () => void;
    onRefresh: () => void;
}) {
    const objectLabel = activeTab === "accounts" ? "Account" : "Contact";
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
                                    <p className="slds-text-title_caps">{objectLabel}</p>
                                    <h1>
                                        <span className="slds-page-header__title slds-truncate" title="Recently Viewed">
                                            Recently Viewed
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            <p className="slds-page-header__name-meta">
                                {recordCount} {recordCount === 1 ? "item" : "items"} - Updated just now
                            </p>
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
                            <button className="slds-button slds-button_brand heroku-brand-action" type="button" onClick={onCreate}>
                                New {objectLabel}
                            </button>
                        </div>
                    </div>
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

function getContactName(contact: Contact): string {
    return `${contact.FirstName ?? ""} ${contact.LastName}`.trim();
}

function getAccountBilling(account: Account): string {
    return [account.BillingCity, account.BillingCountry].filter(Boolean).join(", ");
}

function ListViewToolbar({
    count,
    loading,
    objectLabel,
    onRefresh
}: {
    count: number;
    loading: boolean;
    objectLabel: string;
    onRefresh: () => void;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_medium slds-p-vertical_x-small slds-border_bottom playground-list-toolbar">
            <div className="slds-text-title_bold">
                {count} {count === 1 ? "item" : "items"} - View: My {objectLabel}
            </div>
            <div className="slds-grid slds-grid_vertical-align-center slds-gutters_x-small">
                <div className="slds-form-element">
                    <label className="slds-assistive-text" htmlFor={`${objectLabel.toLowerCase()}-list-search`}>
                        Search this list
                    </label>
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true" />
                        <input
                            id={`${objectLabel.toLowerCase()}-list-search`}
                            className="slds-input playground-list-search"
                            type="search"
                            placeholder="Search this list..."
                        />
                    </div>
                </div>
                <div className="slds-button-group" role="group" aria-label={`${objectLabel} display controls`}>
                    <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="List view controls">
                        <UtilityButtonIcon name="settings" label="" />
                        <span className="slds-assistive-text">List view controls</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="Display as table">
                        <UtilityButtonIcon name="table" label="" />
                        <span className="slds-assistive-text">Display as table</span>
                    </button>
                    <button
                        className="slds-button slds-button_icon slds-button_icon-border-filled"
                        type="button"
                        title="Refresh list"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <UtilityButtonIcon name="refresh" label="" />
                        <span className="slds-assistive-text">Refresh list</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function AccountPanel({
    accounts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onRefresh
}: {
    accounts: Account[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Account) => void;
    onEdit: (record: Account) => void;
    onDelete: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="playground-list-view">
            <ListViewToolbar count={accounts.length} loading={loading} objectLabel="Accounts" onRefresh={onRefresh} />
            {loading ? <EmptyState message="Loading Accounts..." /> : null}
            {!loading && accounts.length === 0 ? <EmptyState message={connected ? "No Accounts found." : "Connect Salesforce to load Accounts."} /> : null}
            {!loading && accounts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols playground-data-table">
                        <thead>
                            <tr>
                                <th className="playground-row-number" scope="col">
                                    <span className="slds-assistive-text">Row number</span>
                                </th>
                                <th className="playground-checkbox-cell" scope="col">
                                    <label className="slds-checkbox">
                                        <input type="checkbox" aria-label="Select all Accounts" />
                                        <span className="slds-checkbox_faux" />
                                    </label>
                                </th>
                                <th scope="col">Account Name</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Website</th>
                                <th scope="col">Industry</th>
                                <th scope="col">Billing</th>
                                <th scope="col">Last Modified</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account, index) => (
                                <tr className="slds-hint-parent" key={account.Id}>
                                    <td className="playground-row-number">{index + 1}</td>
                                    <td className="playground-checkbox-cell">
                                        <label className="slds-checkbox">
                                            <input type="checkbox" aria-label={`Select ${account.Name}`} />
                                            <span className="slds-checkbox_faux" />
                                        </label>
                                    </td>
                                    <th scope="row">
                                        <div className="slds-truncate" title={account.Name}>
                                            <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(account)}>
                                                {account.Name}
                                            </button>
                                        </div>
                                    </th>
                                    <TableCell value={account.Phone} />
                                    <TableCell value={account.Website} />
                                    <TableCell value={account.Industry} />
                                    <TableCell value={getAccountBilling(account)} />
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
    onOpen,
    onEdit,
    onDelete,
    onRefresh
}: {
    contacts: Contact[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onDelete: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="playground-list-view">
            <ListViewToolbar count={contacts.length} loading={loading} objectLabel="Contacts" onRefresh={onRefresh} />
            {loading ? <EmptyState message="Loading Contacts..." /> : null}
            {!loading && contacts.length === 0 ? <EmptyState message={connected ? "No Contacts found." : "Connect Salesforce to load Contacts."} /> : null}
            {!loading && contacts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols playground-data-table">
                        <thead>
                            <tr>
                                <th className="playground-row-number" scope="col">
                                    <span className="slds-assistive-text">Row number</span>
                                </th>
                                <th className="playground-checkbox-cell" scope="col">
                                    <label className="slds-checkbox">
                                        <input type="checkbox" aria-label="Select all Contacts" />
                                        <span className="slds-checkbox_faux" />
                                    </label>
                                </th>
                                <th scope="col">Name</th>
                                <th scope="col">Title</th>
                                <th scope="col">Account Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Last Modified</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact, index) => (
                                <tr className="slds-hint-parent" key={contact.Id}>
                                    <td className="playground-row-number">{index + 1}</td>
                                    <td className="playground-checkbox-cell">
                                        <label className="slds-checkbox">
                                            <input type="checkbox" aria-label={`Select ${getContactName(contact)}`} />
                                            <span className="slds-checkbox_faux" />
                                        </label>
                                    </td>
                                    <th scope="row">
                                        <div className="slds-truncate" title={getContactName(contact)}>
                                            <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(contact)}>
                                                {getContactName(contact)}
                                            </button>
                                        </div>
                                    </th>
                                    <TableCell value={contact.Title} />
                                    <TableCell value={contact.Account?.Name} />
                                    <TableCell value={contact.Email} />
                                    <TableCell value={contact.Phone} />
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

function AccountRecordPage({
    account,
    contacts,
    loading,
    onBack,
    onDelete,
    onEdit,
    onRefresh
}: {
    account: Account;
    contacts: Contact[];
    loading: boolean;
    onBack: () => void;
    onDelete: (record: Account) => void;
    onEdit: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="playground-record-page">
            <RecordPageHeader
                tab="accounts"
                objectLabel="Account"
                title={account.Name}
                loading={loading}
                onBack={onBack}
                onDelete={() => onDelete(account)}
                onEdit={() => onEdit(account)}
                onRefresh={onRefresh}
                primaryActionLabel="New Contact"
            >
                <DetailBlock label="Type" value={account.Type || "-"} />
                <DetailBlock label="Phone" value={account.Phone || "-"} />
                <DetailBlock label="Website" value={account.Website || "-"} />
                <DetailBlock label="Industry" value={account.Industry || "-"} />
                <DetailBlock label="Billing" value={getAccountBilling(account) || "-"} />
            </RecordPageHeader>

            <div className="slds-grid slds-wrap slds-gutters slds-p-around_medium playground-record-body">
                <div className="slds-col slds-size_1-of-1 slds-large-size_2-of-3">
                    <RecordMainTabs
                        relatedContent={
                            <>
                                <RecordNotice title="No potential duplicates were found for this Account." />
                                <RelatedContactsCard contacts={contacts} />
                            </>
                        }
                        detailContent={
                            <RecordFieldGrid
                                fields={[
                                    ["Account Name", account.Name],
                                    ["Phone", account.Phone],
                                    ["Website", account.Website],
                                    ["Industry", account.Industry],
                                    ["Type", account.Type],
                                    ["Billing City", account.BillingCity],
                                    ["Billing Country", account.BillingCountry],
                                    ["Last Modified", formatDate(account.LastModifiedDate)]
                                ]}
                            />
                        }
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
                    <ActivityCard />
                </div>
            </div>
        </div>
    );
}

function ContactRecordPage({
    contact,
    loading,
    onBack,
    onDelete,
    onEdit,
    onRefresh
}: {
    contact: Contact;
    loading: boolean;
    onBack: () => void;
    onDelete: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="playground-record-page">
            <RecordPageHeader
                tab="contacts"
                objectLabel="Contact"
                title={getContactName(contact)}
                loading={loading}
                onBack={onBack}
                onDelete={() => onDelete(contact)}
                onEdit={() => onEdit(contact)}
                onRefresh={onRefresh}
                primaryActionLabel="New Case"
            >
                <DetailBlock label="Title" value={contact.Title || "-"} />
                <DetailBlock label="Account Name" value={contact.Account?.Name || "-"} />
                <DetailBlock label="Email" value={contact.Email || "-"} />
                <DetailBlock label="Phone" value={contact.Phone || "-"} />
                <DetailBlock label="Last Modified" value={formatDate(contact.LastModifiedDate)} />
            </RecordPageHeader>

            <div className="slds-grid slds-wrap slds-gutters slds-p-around_medium playground-record-body">
                <div className="slds-col slds-size_1-of-1 slds-large-size_2-of-3">
                    <RecordMainTabs
                        relatedContent={
                            <>
                                <RecordNotice title="No activities are related to this Contact yet." />
                                <RelatedAccountCard accountName={contact.Account?.Name} />
                            </>
                        }
                        detailContent={
                            <RecordFieldGrid
                                fields={[
                                    ["Name", getContactName(contact)],
                                    ["Title", contact.Title],
                                    ["Account Name", contact.Account?.Name],
                                    ["Email", contact.Email],
                                    ["Phone", contact.Phone],
                                    ["Last Modified", formatDate(contact.LastModifiedDate)]
                                ]}
                            />
                        }
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
                    <ActivityCard />
                </div>
            </div>
        </div>
    );
}

function RecordPageHeader({
    tab,
    objectLabel,
    title,
    loading,
    onBack,
    onDelete,
    onEdit,
    onRefresh,
    primaryActionLabel,
    children
}: {
    tab: "accounts" | "contacts";
    objectLabel: string;
    title: string;
    loading: boolean;
    onBack: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onRefresh: () => void;
    primaryActionLabel: string;
    children: React.ReactNode;
}) {
    return (
        <div className="slds-page-header slds-page-header_record-home slds-page-header_joined playground-record-header">
            <div className="slds-page-header__row">
                <div className="slds-page-header__col-title">
                    <div className="slds-media">
                        <div className="slds-media__figure">
                            <StandardPageHeaderIcon tab={tab} label={objectLabel} />
                        </div>
                        <div className="slds-media__body">
                            <div className="slds-page-header__name">
                                <div className="slds-page-header__name-title">
                                    <p className="slds-text-title_caps">{objectLabel}</p>
                                    <h1>
                                        <span className="slds-page-header__title slds-truncate" title={title}>
                                            {title}
                                        </span>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slds-page-header__col-actions">
                    <div className="slds-page-header__controls">
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_neutral" type="button" onClick={onBack}>
                                Back to List
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_neutral" type="button" onClick={onRefresh} disabled={loading}>
                                Refresh
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_neutral" type="button" onClick={onEdit}>
                                Edit
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_neutral" type="button">
                                {primaryActionLabel}
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_destructive" type="button" onClick={onDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="slds-page-header__row slds-page-header__row_gutters">
                <div className="slds-page-header__col-details">
                    <ul className="slds-page-header__detail-row">{children}</ul>
                </div>
            </div>
        </div>
    );
}

function RecordMainTabs({
    relatedContent,
    detailContent
}: {
    relatedContent: React.ReactNode;
    detailContent: React.ReactNode;
}) {
    const [activeRecordTab, setActiveRecordTab] = useState<"related" | "details">("related");

    return (
        <div className="slds-tabs_default playground-record-tabs">
            <ul className="slds-tabs_default__nav" role="tablist">
                <li className={`slds-tabs_default__item ${activeRecordTab === "related" ? "slds-is-active" : ""}`} role="presentation">
                    <button
                        className="slds-tabs_default__link playground-tab-button"
                        type="button"
                        role="tab"
                        aria-selected={activeRecordTab === "related"}
                        onClick={() => setActiveRecordTab("related")}
                    >
                        Related
                    </button>
                </li>
                <li className={`slds-tabs_default__item ${activeRecordTab === "details" ? "slds-is-active" : ""}`} role="presentation">
                    <button
                        className="slds-tabs_default__link playground-tab-button"
                        type="button"
                        role="tab"
                        aria-selected={activeRecordTab === "details"}
                        onClick={() => setActiveRecordTab("details")}
                    >
                        Details
                    </button>
                </li>
            </ul>
            <div className="slds-tabs_default__content slds-show" role="tabpanel">
                {activeRecordTab === "related" ? relatedContent : detailContent}
            </div>
        </div>
    );
}

function RecordNotice({ title }: { title: string }) {
    return (
        <section className="slds-box slds-theme_default slds-m-bottom_medium">
            <div className="slds-media">
                <div className="slds-media__figure">
                    <span className="slds-icon_container slds-icon-utility-warning" aria-hidden="true" />
                </div>
                <div className="slds-media__body">
                    <h2 className="slds-text-heading_small">{title}</h2>
                    <p className="slds-text-body_regular slds-m-top_small">
                        This playground shows the Salesforce records returned by the API.
                    </p>
                </div>
            </div>
        </section>
    );
}

function RelatedContactsCard({ contacts }: { contacts: Contact[] }) {
    return (
        <section className="slds-card slds-card_boundary">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <StandardPageHeaderIcon tab="contacts" label="Contacts" />
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">
                            <span>Contacts ({contacts.length})</span>
                        </h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                {contacts.length === 0 ? (
                    <p className="slds-text-color_weak">No Contacts are related to this Account.</p>
                ) : (
                    <div className="slds-grid slds-wrap slds-gutters">
                        {contacts.slice(0, 4).map((contact) => (
                            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2" key={contact.Id}>
                                <article className="slds-tile slds-media">
                                    <div className="slds-media__figure">
                                        <StandardPageHeaderIcon tab="contacts" label="Contact" />
                                    </div>
                                    <div className="slds-media__body">
                                        <h3 className="slds-tile__title slds-truncate" title={getContactName(contact)}>
                                            {getContactName(contact)}
                                        </h3>
                                        <div className="slds-tile__detail">
                                            <p className="slds-truncate">Title: {contact.Title || "-"}</p>
                                            <p className="slds-truncate">Email: {contact.Email || "-"}</p>
                                            <p className="slds-truncate">Phone: {contact.Phone || "-"}</p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function RelatedAccountCard({ accountName }: { accountName?: string }) {
    return (
        <section className="slds-card slds-card_boundary">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <StandardPageHeaderIcon tab="accounts" label="Account" />
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">
                            <span>Account</span>
                        </h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                <p className="slds-text-link">{accountName || "No Account"}</p>
            </div>
        </section>
    );
}

function RecordFieldGrid({ fields }: { fields: Array<[string, string | undefined]> }) {
    return (
        <section className="slds-box slds-theme_default">
            <div className="slds-grid slds-wrap slds-gutters">
                {fields.map(([label, value]) => (
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2" key={label}>
                        <div className="slds-form-element slds-form-element_readonly slds-form-element_stacked slds-p-vertical_x-small slds-border_bottom">
                            <span className="slds-form-element__label">{label}</span>
                            <div className="slds-form-element__control">
                                <span className="slds-form-element__static">{value || "-"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ActivityCard() {
    return (
        <section className="slds-card slds-card_boundary playground-activity-card">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">Activity</h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                <div className="slds-tabs_default">
                    <ul className="slds-tabs_default__nav" role="tablist">
                        <li className="slds-tabs_default__item slds-is-active" role="presentation">
                            <a className="slds-tabs_default__link" href="#activity" role="tab" aria-selected="true">
                                Activity
                            </a>
                        </li>
                        <li className="slds-tabs_default__item" role="presentation">
                            <a className="slds-tabs_default__link" href="#chatter" role="tab" aria-selected="false">
                                Chatter
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="slds-illustration slds-illustration_small slds-p-around_medium">
                    <div className="slds-text-align_center">
                        <h3 className="slds-text-heading_small">No activities to show.</h3>
                        <p className="slds-text-color_weak slds-m-top_x-small">Send email or schedule a ToDo to start tracking work.</p>
                    </div>
                </div>
            </div>
        </section>
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
