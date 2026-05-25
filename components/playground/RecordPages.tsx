"use client";

import { type ReactNode, useState } from "react";
import type { Account, Contact, ActiveTab } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { StandardPageHeaderIcon } from "./Navigation";

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <li className="slds-page-header__detail-block playground-record-detail-block">
            <p className="slds-text-title slds-truncate" title={label}>
                {label}
            </p>
            <p className="slds-truncate" title={value}>
                {value}
            </p>
        </li>
    );
}

export function AccountRecordPage({
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
        <div>
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

export function ContactRecordPage({
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
        <div>
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
    children: ReactNode;
}) {
    return (
        <div className="slds-page-header slds-page-header_record-home slds-page-header_joined playground-record-header">
            <div className="slds-page-header__row playground-record-header-row">
                <div className="slds-page-header__col-title playground-record-header-title">
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
                <div className="slds-page-header__col-actions playground-record-header-actions">
                    <div className="slds-page-header__controls playground-record-header-controls">
                        <div className="slds-page-header__control playground-record-header-action">
                            <button className="slds-button slds-button_neutral playground-record-header-button" type="button" onClick={onBack}>
                                Back to List
                            </button>
                        </div>
                        <div className="slds-page-header__control playground-record-header-action">
                            <button className="slds-button slds-button_neutral playground-record-header-button" type="button" onClick={onRefresh} disabled={loading}>
                                Refresh
                            </button>
                        </div>
                        <div className="slds-page-header__control playground-record-header-action">
                            <button className="slds-button slds-button_neutral playground-record-header-button" type="button" onClick={onEdit}>
                                Edit
                            </button>
                        </div>
                        <div className="slds-page-header__control playground-record-header-action">
                            <button className="slds-button slds-button_neutral playground-record-header-button" type="button">
                                {primaryActionLabel}
                            </button>
                        </div>
                        <div className="slds-page-header__control playground-record-header-action">
                            <button className="slds-button slds-button_destructive playground-record-header-button" type="button" onClick={onDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="slds-page-header__row slds-page-header__row_gutters playground-record-header-row">
                <div className="slds-page-header__col-details">
                    <ul className="slds-page-header__detail-row playground-record-detail-row">{children}</ul>
                </div>
            </div>
        </div>
    );
}

function RecordMainTabs({
    relatedContent,
    detailContent
}: {
    relatedContent: ReactNode;
    detailContent: ReactNode;
}) {
    const [activeRecordTab, setActiveRecordTab] = useState<"related" | "details">("related");

    return (
        <div className="slds-tabs_default slds-tabs_card">
            <ul className="slds-tabs_default__nav slds-p-left_medium" role="tablist">
                <li className={`slds-tabs_default__item ${activeRecordTab === "related" ? "slds-is-active" : ""}`} role="presentation">
                    <button
                        className="slds-tabs_default__link slds-button_reset"
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
                        className="slds-tabs_default__link slds-button_reset"
                        type="button"
                        role="tab"
                        aria-selected={activeRecordTab === "details"}
                        onClick={() => setActiveRecordTab("details")}
                    >
                        Details
                    </button>
                </li>
            </ul>
            <div className="slds-tabs_default__content slds-show slds-p-around_medium" role="tabpanel">
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
        <section className="slds-card slds-card_boundary">
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
