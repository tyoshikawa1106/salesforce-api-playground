"use client";

import { type ReactNode, useId, useState } from "react";
import type { Account, ActiveTab, Activity, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { ActivityCard, type ActivityLookupOption } from "./ActivityCard";
import { RecordFieldGrid } from "./RecordFieldGrid";
import { DetailBlock, RecordPageHeader } from "./RecordPageHeader";
import { RecordMainTabs } from "./RecordMainTabs";
import { RelatedContactsCard } from "./RecordRelatedCards";
import { renderEmailLink, renderPhoneLink, renderWebsiteLink } from "./RecordValueLinks";
import { UtilityIcon } from "./SldsIcon";

type RecordPageFrameProps<Record extends object> = {
    record: Record;
    recordId?: string;
    tab: ActiveTab;
    objectLabel: string;
    title: string;
    activityRelatedName?: string;
    activityNameLookupOptions?: ActivityLookupOption[];
    onOpenActivity?: (activity: Activity) => void;
    activityRelatedLookupOptions?: ActivityLookupOption[];
    assignedUserId?: string;
    assignedUserName?: string;
    includeActivityCard?: boolean;
    loading: boolean;
    headerDetails: ReactNode;
    relatedContent?: ReactNode;
    detailFields: Array<[string, ReactNode]>;
    systemFields: Array<[string, ReactNode]>;
    onDeleteActivity?: (activity: Activity) => void;
    onEditActivity?: (activity: Activity) => void;
    onDelete: (record: Record) => void;
    onEdit: (record: Record) => void;
    onRefresh: () => void;
};

function RecordPageFrame<Record extends object>({
    record,
    recordId,
    tab,
    objectLabel,
    title,
    activityRelatedName,
    activityNameLookupOptions,
    onOpenActivity,
    activityRelatedLookupOptions,
    assignedUserId,
    assignedUserName,
    includeActivityCard = true,
    loading,
    headerDetails,
    relatedContent,
    detailFields,
    systemFields,
    onDeleteActivity,
    onEditActivity,
    onDelete,
    onEdit,
    onRefresh
}: RecordPageFrameProps<Record>) {
    const activityParentId = recordId ?? ("Id" in record && typeof record.Id === "string" ? record.Id : "");

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

            <div className={`slds-m-top_small playground-record-body ${includeActivityCard ? "" : "playground-record-body_single"}`}>
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
                {includeActivityCard ? (
                    <div>
                        <ActivityCard
                            parentId={activityParentId}
                            parentName={title}
                            parentType={tab === "accounts" ? "account" : "contact"}
                            assignedUserId={assignedUserId}
                            assignedUserName={assignedUserName}
                            nameLookupOptions={activityNameLookupOptions}
                            onDeleteActivity={onDeleteActivity}
                            onEditActivity={onEditActivity}
                            onOpenActivity={onOpenActivity}
                            relatedContent={relatedContent}
                            relatedLookupOptions={activityRelatedLookupOptions}
                            relatedName={activityRelatedName}
                        />
                    </div>
                ) : null}
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
    assignedUserId,
    assignedUserName,
    contacts,
    loading,
    onDelete,
    onEdit,
    onDeleteActivity,
    onEditActivity,
    onOpenActivity,
    onOpenContact,
    onRefresh
}: {
    account: Account;
    assignedUserId?: string;
    assignedUserName?: string;
    contacts: Contact[];
    loading: boolean;
    onDelete: (record: Account) => void;
    onEdit: (record: Account) => void;
    onDeleteActivity?: (activity: Activity) => void;
    onEditActivity?: (activity: Activity) => void;
    onOpenActivity?: (activity: Activity) => void;
    onOpenContact: (record: Contact) => void;
    onRefresh: () => void;
}) {
    const accountLookupOption = {
        id: account.Id,
        label: account.Name,
        objectLabel: "取引先"
    } as const satisfies ActivityLookupOption;
    const contactLookupOptions = contacts.map((contact) => ({
        id: contact.Id,
        label: getContactName(contact),
        meta: account.Name,
        objectLabel: "取引先責任者"
    } as const satisfies ActivityLookupOption));

    return (
        <RecordPageFrame
            record={account}
            tab="accounts"
            objectLabel="取引先"
            title={account.Name}
            activityRelatedName={account.Name}
            activityNameLookupOptions={contactLookupOptions}
            activityRelatedLookupOptions={[accountLookupOption]}
            assignedUserId={assignedUserId}
            assignedUserName={assignedUserName}
            loading={loading}
            onDelete={onDelete}
            onDeleteActivity={onDeleteActivity}
            onEdit={onEdit}
            onEditActivity={onEditActivity}
            onOpenActivity={onOpenActivity}
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
    assignedUserId,
    assignedUserName,
    contact,
    loading,
    onDelete,
    onEdit,
    onDeleteActivity,
    onEditActivity,
    onOpenAccount,
    onOpenActivity,
    onRefresh
}: {
    assignedUserId?: string;
    assignedUserName?: string;
    contact: Contact;
    loading: boolean;
    onDelete: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onDeleteActivity?: (activity: Activity) => void;
    onEditActivity?: (activity: Activity) => void;
    onOpenAccount: (accountId: string) => void;
    onOpenActivity?: (activity: Activity) => void;
    onRefresh: () => void;
}) {
    const accountId = contact.AccountId;
    const contactName = getContactName(contact);
    const contactLookupOption = {
        id: contact.Id,
        label: contactName,
        meta: contact.Account?.Name,
        objectLabel: "取引先責任者"
    } as const satisfies ActivityLookupOption;
    const relatedLookupOption = contact.Account?.Name ? {
        id: accountId || contact.Account.Name,
        label: contact.Account.Name,
        objectLabel: "取引先"
    } as const satisfies ActivityLookupOption : undefined;
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
            title={contactName}
            activityRelatedName={contact.Account?.Name}
            activityNameLookupOptions={[contactLookupOption]}
            activityRelatedLookupOptions={relatedLookupOption ? [relatedLookupOption] : []}
            assignedUserId={assignedUserId}
            assignedUserName={assignedUserName}
            loading={loading}
            onDelete={onDelete}
            onDeleteActivity={onDeleteActivity}
            onEdit={onEdit}
            onEditActivity={onEditActivity}
            onOpenActivity={onOpenActivity}
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

export function ActivityRecordPage({
    activity,
    loading,
    onDelete,
    onEdit,
    onRefresh
}: {
    activity: Activity;
    loading: boolean;
    onDelete: (record: Activity) => void;
    onEdit: (record: Activity) => void;
    onRefresh: () => void;
}) {
    const isTask = activity.type === "task";
    const objectLabel = isTask ? "ToDo" : "行動";
    const title = activity.subject || objectLabel;
    const commonFields: Array<[string, ReactNode]> = [
        ["件名", title],
        ["名前", activity.whoName],
        ["関連先", activity.whatName],
        ["割り当て先", activity.ownerName],
    ];
    const detailFields = isTask
        ? [
            commonFields[0],
            ["期日", formatDate(activity.date)] as [string, ReactNode],
            ...commonFields.slice(1),
            ["状況", activity.status] as [string, ReactNode],
            ["説明", activity.description] as [string, ReactNode]
        ]
        : [
            commonFields[0],
            ["開始", formatDate(activity.startDateTime)] as [string, ReactNode],
            ["終了", formatDate(activity.endDateTime)] as [string, ReactNode],
            ...commonFields.slice(1),
            ["場所", activity.location] as [string, ReactNode],
            ["説明", activity.description] as [string, ReactNode]
        ];

    return (
        <RecordPageFrame
            record={activity}
            recordId={activity.id}
            tab="activities"
            objectLabel={objectLabel}
            title={title}
            includeActivityCard={false}
            loading={loading}
            onDelete={onDelete}
            onEdit={onEdit}
            onRefresh={onRefresh}
            headerDetails={
                isTask ? (
                    <>
                        <DetailBlock label="期日" value={formatDate(activity.date) || "-"} />
                        <DetailBlock label="名前" value={activity.whoName || "-"} />
                        <DetailBlock label="関連先" value={activity.whatName || "-"} />
                        <DetailBlock label="割り当て先" value={activity.ownerName || "-"} />
                        <DetailBlock label="状況" value={activity.status || "-"} />
                    </>
                ) : (
                    <>
                        <DetailBlock label="開始" value={formatDate(activity.startDateTime) || "-"} />
                        <DetailBlock label="終了" value={formatDate(activity.endDateTime) || "-"} />
                        <DetailBlock label="名前" value={activity.whoName || "-"} />
                        <DetailBlock label="関連先" value={activity.whatName || "-"} />
                        <DetailBlock label="割り当て先" value={activity.ownerName || "-"} />
                    </>
                )
            }
            detailFields={detailFields}
            systemFields={[
                ["作成日", formatDate(activity.createdDate)],
                ["最終更新日", formatDate(activity.lastModifiedDate)]
            ]}
        />
    );
}
