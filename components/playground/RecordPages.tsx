"use client";

import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { ActivityCard } from "./ActivityCard";
import { RecordFieldGrid } from "./RecordFieldGrid";
import { DetailBlock, RecordPageHeader } from "./RecordPageHeader";
import { RecordMainTabs } from "./RecordMainTabs";
import { RecordNotice, RelatedAccountCard, RelatedContactsCard } from "./RecordRelatedCards";

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
