"use client";

import { type ReactNode, useState } from "react";
import type { Account, Contact, ActiveTab } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { StandardPageHeaderIcon, UtilityButtonIcon } from "./Navigation";

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <li className="slds-page-header__detail-block slds-size_1-of-1 slds-small-size_1-of-2 slds-large-size_1-of-5 playground-record-detail-block">
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
    onDelete,
    onEdit,
    onRefresh
}: {
    account: Account;
    contacts: Contact[];
    loading: boolean;
    onDelete: (record: Account) => void;
    onEdit: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <div>
            <RecordPageHeader
                tab="accounts"
                objectLabel="取引先"
                title={account.Name}
                loading={loading}
                onDelete={() => onDelete(account)}
                onEdit={() => onEdit(account)}
                onRefresh={onRefresh}
            >
                <DetailBlock label="種別" value={account.Type || "-"} />
                <DetailBlock label="電話" value={account.Phone || "-"} />
                <DetailBlock label="Web サイト" value={account.Website || "-"} />
                <DetailBlock label="業種" value={account.Industry || "-"} />
                <DetailBlock label="請求先" value={getAccountBilling(account) || "-"} />
            </RecordPageHeader>

            <div className="slds-m-top_small playground-record-body">
                <div>
                    <RecordMainTabs
                        relatedContent={
                            <>
                                <RecordNotice title="この取引先の重複候補は見つかりませんでした。" />
                                <RelatedContactsCard contacts={contacts} />
                            </>
                        }
                        detailContent={
                            <RecordFieldGrid
                                fields={[
                                    ["取引先名", account.Name],
                                    ["電話", account.Phone],
                                    ["Web サイト", account.Website],
                                    ["業種", account.Industry],
                                    ["種別", account.Type],
                                    ["請求先市区郡", account.BillingCity],
                                    ["請求先国", account.BillingCountry],
                                    ["最終更新日", formatDate(account.LastModifiedDate)]
                                ]}
                            />
                        }
                    />
                </div>
                <div>
                    <ActivityCard />
                </div>
            </div>
        </div>
    );
}

export function ContactRecordPage({
    contact,
    loading,
    onDelete,
    onEdit,
    onRefresh
}: {
    contact: Contact;
    loading: boolean;
    onDelete: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <div>
            <RecordPageHeader
                tab="contacts"
                objectLabel="取引先責任者"
                title={getContactName(contact)}
                loading={loading}
                onDelete={() => onDelete(contact)}
                onEdit={() => onEdit(contact)}
                onRefresh={onRefresh}
            >
                <DetailBlock label="役職" value={contact.Title || "-"} />
                <DetailBlock label="取引先名" value={contact.Account?.Name || "-"} />
                <DetailBlock label="メール" value={contact.Email || "-"} />
                <DetailBlock label="電話" value={contact.Phone || "-"} />
                <DetailBlock label="最終更新日" value={formatDate(contact.LastModifiedDate)} />
            </RecordPageHeader>

            <div className="slds-m-top_small playground-record-body">
                <div>
                    <RecordMainTabs
                        relatedContent={
                            <>
                                <RecordNotice title="この取引先責任者に関連する活動はまだありません。" />
                                <RelatedAccountCard accountName={contact.Account?.Name} />
                            </>
                        }
                        detailContent={
                            <RecordFieldGrid
                                fields={[
                                    ["氏名", getContactName(contact)],
                                    ["役職", contact.Title],
                                    ["取引先名", contact.Account?.Name],
                                    ["メール", contact.Email],
                                    ["電話", contact.Phone],
                                    ["最終更新日", formatDate(contact.LastModifiedDate)]
                                ]}
                            />
                        }
                    />
                </div>
                <div>
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
    onDelete,
    onEdit,
    onRefresh,
    children
}: {
    tab: "accounts" | "contacts";
    objectLabel: string;
    title: string;
    loading: boolean;
    onDelete: () => void;
    onEdit: () => void;
    onRefresh: () => void;
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
                <div className="slds-page-header__col-actions slds-max-medium-size_full playground-record-header-actions">
                    <div className="slds-page-header__controls playground-record-header-controls">
                        <div className="slds-page-header__control playground-record-header-action">
                            <button
                                className="slds-button slds-button_icon slds-button_icon-border-filled playground-record-header-button"
                                type="button"
                                title="更新"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                <UtilityButtonIcon name="refresh" label="" />
                                <span className="slds-assistive-text">更新</span>
                            </button>
                        </div>
                        <div className="slds-page-header__control playground-record-header-action">
                            <div className="slds-button-group" role="group" aria-label={`${objectLabel}レコードのアクション`}>
                                <button className="slds-button slds-button_neutral slds-max-small-button_stretch playground-record-header-button" type="button" onClick={onEdit}>
                                    編集
                                </button>
                                <button className="slds-button slds-button_neutral slds-max-small-button_stretch playground-record-header-button" type="button" onClick={onDelete}>
                                    削除
                                </button>
                            </div>
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
        <div className="slds-tabs_default slds-tabs_card playground-record-tabs">
            <ul className="slds-tabs_default__nav slds-p-left_x-small" role="tablist">
                <li className={`slds-tabs_default__item ${activeRecordTab === "related" ? "slds-is-active" : ""}`} role="presentation">
                    <button
                        className="slds-tabs_default__link slds-button_reset"
                        type="button"
                        role="tab"
                        aria-selected={activeRecordTab === "related"}
                        onClick={() => setActiveRecordTab("related")}
                    >
                        関連
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
                        詳細
                    </button>
                </li>
            </ul>
            <div className="slds-tabs_default__content slds-show slds-p-around_x-small" role="tabpanel">
                {activeRecordTab === "related" ? relatedContent : detailContent}
            </div>
        </div>
    );
}

function RecordNotice({ title }: { title: string }) {
    return (
        <section className="slds-box slds-box_x-small slds-theme_default slds-m-bottom_x-small">
            <div className="slds-media">
                <div className="slds-media__figure">
                    <span className="slds-icon_container slds-icon-utility-warning" aria-hidden="true" />
                </div>
                <div className="slds-media__body">
                    <h2 className="slds-text-heading_small">{title}</h2>
                    <p className="slds-text-body_regular slds-m-top_small">
                        このプレイグラウンドでは、API から返された Salesforce レコードを表示しています。
                    </p>
                </div>
            </div>
        </section>
    );
}

function RelatedContactsCard({ contacts }: { contacts: Contact[] }) {
    return (
        <section className="slds-card slds-card_boundary playground-record-related-card">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <StandardPageHeaderIcon tab="contacts" label="取引先責任者" />
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">
                            <span>取引先責任者 ({contacts.length})</span>
                        </h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                {contacts.length === 0 ? (
                    <p className="slds-text-color_weak">この取引先に関連する取引先責任者はありません。</p>
                ) : (
                    <div className="slds-grid slds-wrap slds-gutters_x-small">
                        {contacts.slice(0, 4).map((contact) => (
                            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2" key={contact.Id}>
                                <article className="slds-tile slds-media">
                                    <div className="slds-media__figure">
                                        <StandardPageHeaderIcon tab="contacts" label="取引先責任者" />
                                    </div>
                                    <div className="slds-media__body">
                                        <h3 className="slds-tile__title slds-truncate" title={getContactName(contact)}>
                                            {getContactName(contact)}
                                        </h3>
                                        <div className="slds-tile__detail">
                                            <p className="slds-truncate">役職: {contact.Title || "-"}</p>
                                            <p className="slds-truncate">メール: {contact.Email || "-"}</p>
                                            <p className="slds-truncate">電話: {contact.Phone || "-"}</p>
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
        <section className="slds-card slds-card_boundary playground-record-related-card">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <StandardPageHeaderIcon tab="accounts" label="取引先" />
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">
                            <span>取引先</span>
                        </h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                <p className="slds-text-link">{accountName || "取引先なし"}</p>
            </div>
        </section>
    );
}

function RecordFieldGrid({ fields }: { fields: Array<[string, string | undefined]> }) {
    return (
        <section className="slds-theme_default">
            <div className="slds-grid slds-wrap slds-gutters_x-small">
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
                        <h2 className="slds-card__header-title">活動</h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                <div className="slds-tabs_default">
                    <ul className="slds-tabs_default__nav" role="tablist">
                        <li className="slds-tabs_default__item slds-is-active" role="presentation">
                            <a className="slds-tabs_default__link" href="#activity" role="tab" aria-selected="true">
                                活動
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
                        <h3 className="slds-text-heading_small">表示する活動はありません。</h3>
                        <p className="slds-text-color_weak slds-m-top_x-small">メール送信や ToDo の予定作成で作業を記録できます。</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
