"use client";

import { type ReactNode, useId, useState } from "react";
import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { ActivityCard } from "./ActivityCard";
import { RecordFieldGrid } from "./RecordFieldGrid";
import { DetailBlock, RecordPageHeader } from "./RecordPageHeader";
import { RecordMainTabs } from "./RecordMainTabs";
import { RelatedContactsCard } from "./RecordRelatedCards";
import { renderEmailLink, renderPhoneLink, renderWebsiteLink } from "./RecordValueLinks";
import { UtilityIcon } from "./SldsIcon";

type RecordPageFrameProps<Record extends { Id: string }> = {
    record: Record;
    tab: "accounts" | "contacts";
    objectLabel: string;
    title: string;
    loading: boolean;
    headerDetails: ReactNode;
    relatedContent?: ReactNode;
    detailFields: Array<[string, ReactNode]>;
    systemFields: Array<[string, ReactNode]>;
    onDelete: (record: Record) => void;
    onEdit: (record: Record) => void;
    onRefresh: () => void;
};

function RecordPageFrame<Record extends { Id: string }>({
    record,
    tab,
    objectLabel,
    title,
    loading,
    headerDetails,
    relatedContent,
    detailFields,
    systemFields,
    onDelete,
    onEdit,
    onRefresh
}: RecordPageFrameProps<Record>) {
    return (
        <div>
            <RecordPageHeader
                tab={tab}
                objectLabel={objectLabel}
                title={title}
                loading={loading}
                onDelete={() => onDelete(record)}
                onEdit={() => onEdit(record)}
                onRefresh={onRefresh}
            >
                {headerDetails}
            </RecordPageHeader>

            <div className="slds-m-top_small playground-record-body">
                <div>
                    <RecordMainTabs
                        detailContent={
                            <>
                                <RecordFieldGrid fields={detailFields} />
                                <RecordDetailSection title="システム情報">
                                    <RecordFieldGrid fields={systemFields} />
                                </RecordDetailSection>
                            </>
                        }
                    />
                </div>
                <div>
                    <ActivityCard parentId={record.Id} parentType={tab === "accounts" ? "account" : "contact"} relatedContent={relatedContent} />
                </div>
            </div>
        </div>
    );
}

function RecordDetailSection({ title, children }: { title: string; children: ReactNode }) {
    const [open, setOpen] = useState(true);
    const contentId = useId();

    return (
        <section className={`slds-section slds-m-top_medium ${open ? "slds-is-open" : ""}`}>
            <h2 className="slds-section__title">
                <button
                    className="slds-button slds-section__title-action"
                    type="button"
                    aria-controls={contentId}
                    aria-expanded={open}
                    onClick={() => setOpen((current) => !current)}
                >
                    <UtilityIcon
                        className={`slds-section__title-action-icon slds-button__icon slds-button__icon_left playground-record-section-icon ${
                            open ? "" : "playground-record-section-icon_collapsed"
                        }`}
                        name="down"
                    />
                    <span className="slds-truncate" title={title}>{title}</span>
                </button>
            </h2>
            <div className="slds-section__content" id={contentId} hidden={!open}>
                {children}
            </div>
        </section>
    );
}

export function AccountRecordPage({
    account,
    contacts,
    loading,
    onDelete,
    onEdit,
    onOpenContact,
    onRefresh
}: {
    account: Account;
    contacts: Contact[];
    loading: boolean;
    onDelete: (record: Account) => void;
    onEdit: (record: Account) => void;
    onOpenContact: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <RecordPageFrame
            record={account}
            tab="accounts"
            objectLabel="取引先"
            title={account.Name}
            loading={loading}
            onDelete={onDelete}
            onEdit={onEdit}
            onRefresh={onRefresh}
            headerDetails={
                <>
                    <DetailBlock label="種別" value={account.Type || "-"} />
                    <DetailBlock label="電話" value={renderPhoneLink(account.Phone) || "-"} />
                    <DetailBlock label="Web サイト" value={renderWebsiteLink(account.Website) || "-"} />
                    <DetailBlock label="業種" value={account.Industry || "-"} />
                    <DetailBlock label="請求先" value={getAccountBilling(account) || "-"} />
                </>
            }
            relatedContent={
                <RelatedContactsCard contacts={contacts} onOpenContact={onOpenContact} />
            }
            detailFields={[
                ["取引先名", account.Name],
                ["電話", renderPhoneLink(account.Phone)],
                ["Web サイト", renderWebsiteLink(account.Website)],
                ["業種", account.Industry],
                ["種別", account.Type],
                ["請求先市区郡", account.BillingCity],
                ["請求先国", account.BillingCountry]
            ]}
            systemFields={[
                ["作成日", formatDate(account.CreatedDate)],
                ["最終更新日", formatDate(account.LastModifiedDate)]
            ]}
        />
    );
}

export function ContactRecordPage({
    contact,
    loading,
    onDelete,
    onEdit,
    onOpenAccount,
    onRefresh
}: {
    contact: Contact;
    loading: boolean;
    onDelete: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onOpenAccount: (accountId: string) => void;
    onRefresh: () => void;
}) {
    const accountId = contact.AccountId;
    const accountLink = accountId ? (
        <button
            className="slds-button_reset slds-text-link"
            type="button"
            onClick={() => onOpenAccount(accountId)}
        >
            {contact.Account?.Name || accountId}
        </button>
    ) : undefined;

    return (
        <RecordPageFrame
            record={contact}
            tab="contacts"
            objectLabel="取引先責任者"
            title={getContactName(contact)}
            loading={loading}
            onDelete={onDelete}
            onEdit={onEdit}
            onRefresh={onRefresh}
            headerDetails={
                <>
                    <DetailBlock label="取引先名" value={accountLink || "-"} />
                    <DetailBlock label="役職" value={contact.Title || "-"} />
                    <DetailBlock label="部署" value={contact.Department || "-"} />
                    <DetailBlock label="メール" value={renderEmailLink(contact.Email) || "-"} />
                    <DetailBlock label="電話" value={renderPhoneLink(contact.Phone) || "-"} />
                </>
            }
            detailFields={[
                ["氏名", getContactName(contact)],
                ["役職", contact.Title],
                ["部署", contact.Department],
                ["取引先名", accountLink],
                ["メール", renderEmailLink(contact.Email)],
                ["電話", renderPhoneLink(contact.Phone)]
            ]}
            systemFields={[
                ["作成日", formatDate(contact.CreatedDate)],
                ["最終更新日", formatDate(contact.LastModifiedDate)]
            ]}
        />
    );
}
