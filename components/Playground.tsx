"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type SessionInfo = {
  connected: boolean;
  instanceUrl?: string;
  issuedAt?: number;
};

type Account = {
  Id: string;
  Name: string;
  Phone?: string;
  Website?: string;
  Industry?: string;
  Type?: string;
  BillingCity?: string;
  BillingCountry?: string;
  LastModifiedDate?: string;
};

type Contact = {
  Id: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Title?: string;
  AccountId?: string;
  Account?: {
    Name?: string;
  };
  LastModifiedDate?: string;
};

type AccountForm = {
  Name: string;
  Phone: string;
  Website: string;
  Industry: string;
  Type: string;
  BillingCity: string;
  BillingCountry: string;
};

type ContactForm = {
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Title: string;
  AccountId: string;
};

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

function compactPayload<T extends Record<string, string>>(
  form: T,
  options: { emptyAsNull?: boolean } = {}
): Partial<Record<keyof T, string | null>> {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      const trimmed = value.trim();
      return [key, trimmed || (options.emptyAsNull ? null : undefined)];
    })
  ) as Partial<Record<keyof T, string | null>>;
}

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed.");
  }

  return data as T;
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
  const [activeTab, setActiveTab] = useState<"accounts" | "contacts">("accounts");
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
      const nextSession = await apiRequest<SessionInfo>("/api/session");
      setSession(nextSession);
      if (!nextSession.connected) {
        setAccounts([]);
        setContacts([]);
        return;
      }

      const [accountResult, contactResult] = await Promise.all([
        apiRequest<{ accounts: Account[] }>("/api/accounts"),
        apiRequest<{ contacts: Contact[] }>("/api/contacts")
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
      if (modal?.type === "account" && modal.mode === "edit") {
        const payload = compactPayload(accountForm, { emptyAsNull: true });
        await apiRequest(`/api/accounts/${modal.record.Id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        showNotice({ tone: "success", message: "Account was updated." });
      } else {
        const payload = compactPayload(accountForm);
        await apiRequest("/api/accounts", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showNotice({ tone: "success", message: "Account was created." });
      }
      setModal(null);
      await loadAll();
    } catch (error) {
      showNotice({ tone: "error", message: error instanceof Error ? error.message : "Account save failed." });
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
      if (modal?.type === "contact" && modal.mode === "edit") {
        const payload = compactPayload(contactForm, { emptyAsNull: true });
        await apiRequest(`/api/contacts/${modal.record.Id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        showNotice({ tone: "success", message: "Contact was updated." });
      } else {
        const payload = compactPayload(contactForm);
        await apiRequest("/api/contacts", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showNotice({ tone: "success", message: "Contact was created." });
      }
      setModal(null);
      await loadAll();
    } catch (error) {
      showNotice({ tone: "error", message: error instanceof Error ? error.message : "Contact save failed." });
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
      await apiRequest(`/api/${deleteState.type === "account" ? "accounts" : "contacts"}/${deleteState.id}`, {
        method: "DELETE"
      });
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
    <div className="app-shell">
      {notice ? <NoticeBanner notice={notice} /> : null}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="slds-media slds-media_center">
            <div className="slds-media__figure">
              <div className="brand-mark">SF</div>
            </div>
            <div className="slds-media__body">
              <h1 className="app-title">salesforce-api-playground</h1>
              <p className="app-subtitle">OAuth と REST API で Account / Contact を直接操作する学習アプリ</p>
            </div>
          </div>
          <div className="toolbar">
            {session.connected ? (
              <form action="/api/auth/logout" method="post">
                <button className="slds-button slds-button_neutral" type="submit">
                  Disconnect
                </button>
              </form>
            ) : (
              <a className="slds-button slds-button_brand" href="/api/auth/login">
                Connect Salesforce
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="status-bar" aria-live="polite">
          <div>
            <span className={`slds-badge ${session.connected ? "slds-theme_success" : ""}`}>
              {session.connected ? "Connected" : "Not connected"}
            </span>
            <p className="slds-m-top_x-small muted">
              {session.connected ? session.instanceUrl : "Salesforce OAuth connection is required."}
            </p>
          </div>
          <div className="toolbar">
            <button className="slds-button slds-button_neutral" type="button" onClick={loadAll} disabled={loading}>
              Refresh
            </button>
          </div>
        </section>

        <section className="tabs-panel">
          <div className="slds-tabs_default">
            <ul className="slds-tabs_default__nav" role="tablist">
              <TabButton active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")}>
                Accounts
              </TabButton>
              <TabButton active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")}>
                Contacts
              </TabButton>
            </ul>
          </div>

          {activeTab === "accounts" ? (
            <AccountPanel
              accounts={accounts}
              loading={loading}
              connected={session.connected}
              onCreate={() => openAccountModal()}
              onEdit={openAccountModal}
              onDelete={(record) => setDeleteState({ type: "account", id: record.Id, label: record.Name })}
            />
          ) : (
            <ContactPanel
              contacts={contacts}
              loading={loading}
              connected={session.connected}
              onCreate={() => openContactModal()}
              onEdit={openContactModal}
              onDelete={(record) =>
                setDeleteState({ type: "contact", id: record.Id, label: `${record.FirstName ?? ""} ${record.LastName}`.trim() })
              }
            />
          )}
        </section>
      </main>

      {modal?.type === "account" ? (
        <Modal title={modal.mode === "create" ? "New Account" : "Edit Account"} onClose={() => setModal(null)}>
          <form onSubmit={saveAccount}>
            <div className="modal-body">
              <AccountFormFields value={accountForm} onChange={setAccountForm} />
            </div>
            <ModalFooter saving={saving} onCancel={() => setModal(null)} />
          </form>
        </Modal>
      ) : null}

      {modal?.type === "contact" ? (
        <Modal title={modal.mode === "create" ? "New Contact" : "Edit Contact"} onClose={() => setModal(null)}>
          <form onSubmit={saveContact}>
            <div className="modal-body">
              <ContactFormFields value={contactForm} accounts={accountOptions} onChange={setContactForm} />
            </div>
            <ModalFooter saving={saving} onCancel={() => setModal(null)} />
          </form>
        </Modal>
      ) : null}

      {deleteState ? (
        <Modal title="Confirm Delete" onClose={() => setDeleteState(null)} narrow>
          <div className="modal-body">
            <p>
              Delete <strong>{deleteState.label}</strong>? This directly removes the record from Salesforce.
            </p>
          </div>
          <div className="modal-footer">
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

function NoticeBanner({ notice }: { notice: Notice }) {
  const theme = notice.tone === "success" ? "slds-theme_success" : notice.tone === "error" ? "slds-theme_error" : "slds-theme_info";
  return (
    <div className="toast-stack">
      <div className={`slds-notify slds-notify_toast ${theme}`} role="status">
        <div className="slds-notify__content">
          <h2 className="slds-text-heading_small">{notice.message}</h2>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li className={`slds-tabs_default__item ${active ? "slds-is-active" : ""}`} role="presentation">
      <button className="slds-tabs_default__link" type="button" role="tab" aria-selected={active} onClick={onClick}>
        {children}
      </button>
    </li>
  );
}

function AccountPanel({
  accounts,
  loading,
  connected,
  onCreate,
  onEdit,
  onDelete
}: {
  accounts: Account[];
  loading: boolean;
  connected: boolean;
  onCreate: () => void;
  onEdit: (record: Account) => void;
  onDelete: (record: Account) => void;
}) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="slds-text-heading_medium">Accounts</h2>
          <p className="muted">{accounts.length} records from Salesforce</p>
        </div>
        <button className="slds-button slds-button_brand" type="button" onClick={onCreate} disabled={!connected}>
          New Account
        </button>
      </div>
      {loading ? <EmptyState message="Loading Accounts..." /> : null}
      {!loading && accounts.length === 0 ? <EmptyState message={connected ? "No Accounts found." : "Connect Salesforce to load Accounts."} /> : null}
      {!loading && accounts.length > 0 ? (
        <div className="table-wrap">
          <table className="slds-table slds-table_cell-buffer slds-table_bordered data-table">
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
                <tr key={account.Id}>
                  <th scope="row">{account.Name}</th>
                  <td>{account.Phone || "-"}</td>
                  <td>{account.Website || "-"}</td>
                  <td>{account.Industry || "-"}</td>
                  <td>{[account.BillingCity, account.BillingCountry].filter(Boolean).join(", ") || "-"}</td>
                  <td>{formatDate(account.LastModifiedDate)}</td>
                  <td>
                    <div className="record-actions">
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
  onCreate,
  onEdit,
  onDelete
}: {
  contacts: Contact[];
  loading: boolean;
  connected: boolean;
  onCreate: () => void;
  onEdit: (record: Contact) => void;
  onDelete: (record: Contact) => void;
}) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="slds-text-heading_medium">Contacts</h2>
          <p className="muted">{contacts.length} records from Salesforce</p>
        </div>
        <button className="slds-button slds-button_brand" type="button" onClick={onCreate} disabled={!connected}>
          New Contact
        </button>
      </div>
      {loading ? <EmptyState message="Loading Contacts..." /> : null}
      {!loading && contacts.length === 0 ? <EmptyState message={connected ? "No Contacts found." : "Connect Salesforce to load Contacts."} /> : null}
      {!loading && contacts.length > 0 ? (
        <div className="table-wrap">
          <table className="slds-table slds-table_cell-buffer slds-table_bordered data-table">
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
                <tr key={contact.Id}>
                  <th scope="row">{`${contact.FirstName ?? ""} ${contact.LastName}`.trim()}</th>
                  <td>{contact.Account?.Name || "-"}</td>
                  <td>{contact.Email || "-"}</td>
                  <td>{contact.Phone || "-"}</td>
                  <td>{contact.Title || "-"}</td>
                  <td>{formatDate(contact.LastModifiedDate)}</td>
                  <td>
                    <div className="record-actions">
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

function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
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
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label={title} style={narrow ? { maxWidth: 480 } : undefined}>
        <header className="section-header">
          <h2 className="slds-text-heading_medium">{title}</h2>
          <button className="slds-button slds-button_icon slds-modal__close" type="button" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">x</span>
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ModalFooter({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="modal-footer">
      <button className="slds-button slds-button_neutral" type="button" onClick={onCancel}>
        Cancel
      </button>
      <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
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
    <div className="form-grid">
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
    <div className="form-grid">
      <TextField label="First Name" value={value.FirstName} onChange={(FirstName) => onChange({ ...value, FirstName })} />
      <TextField label="Last Name" required value={value.LastName} onChange={(LastName) => onChange({ ...value, LastName })} />
      <TextField label="Email" type="email" value={value.Email} onChange={(Email) => onChange({ ...value, Email })} />
      <TextField label="Phone" value={value.Phone} onChange={(Phone) => onChange({ ...value, Phone })} />
      <TextField label="Title" value={value.Title} onChange={(Title) => onChange({ ...value, Title })} />
      <div className="slds-form-element">
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
    <div className="slds-form-element">
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
