"use client";

import type { ReactNode } from "react";
import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { ActivityCard } from "./ActivityCard";
import { RecordFieldGrid } from "./RecordFieldGrid";
import { DetailBlock, RecordPageHeader } from "./RecordPageHeader";
import { RecordMainTabs } from "./RecordMainTabs";
import { RecordNotice, RelatedAccountCard, RelatedContactsCard } from "./RecordRelatedCards";

type RecordPageFrameProps<Record> = {
    record: Record;
    tab: "accounts" | "contacts";
    objectLabel: string;
    title: string;
    loading: boolean;
    headerDetails: ReactNode;
    relatedContent: ReactNode;
    detailFields: Array<[string, string | null | undefined]>;
    onDelete: (record: Record) => void;
    onEdit: (record: Record) => void;
    onRefresh: () => void;
};

function RecordPageFrame<Record>({
    record,
    tab,
    objectLabel,
    title,
    loading,
    headerDetails,
    relatedContent,
    detailFields,
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
                        relatedContent={relatedContent}
                        detailContent={
                            <RecordFieldGrid
                                fields={detailFields.map(([label, value]) => [label, value ?? undefined])}
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
                    <DetailBlock label="電話" value={account.Phone || "-"} />
                    <DetailBlock label="Web サイト" value={account.Website || "-"} />
                    <DetailBlock label="業種" value={account.Industry || "-"} />
                    <DetailBlock label="請求先" value={getAccountBilling(account) || "-"} />
                </>
            }
            relatedContent={
                <>
                    <RecordNotice title="この取引先の重複候補は見つかりませんでした。" />
                    <RelatedContactsCard contacts={contacts} />
                </>
            }
            detailFields={[
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
                    <DetailBlock label="役職" value={contact.Title || "-"} />
                    <DetailBlock label="取引先名" value={contact.Account?.Name || "-"} />
                    <DetailBlock label="メール" value={contact.Email || "-"} />
                    <DetailBlock label="電話" value={contact.Phone || "-"} />
                    <DetailBlock label="最終更新日" value={formatDate(contact.LastModifiedDate)} />
                </>
            }
            relatedContent={
                <>
                    <RecordNotice title="この取引先責任者に関連する活動はまだありません。" />
                    <RelatedAccountCard accountName={contact.Account?.Name} />
                </>
            }
            detailFields={[
                ["氏名", getContactName(contact)],
                ["役職", contact.Title],
                ["取引先名", contact.Account?.Name],
                ["メール", contact.Email],
                ["電話", contact.Phone],
                ["最終更新日", formatDate(contact.LastModifiedDate)]
            ]}
        />
    );
}
