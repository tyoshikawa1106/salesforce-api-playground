import type { ActivityLookupOption } from "../activities/ActivityCard";
import { getAccountBilling, getContactName, formatDate } from "../utils/formatting";
import { DetailBlock } from "./RecordPageHeader";
import { RecordPageFrame } from "./RecordPageFrame";
import { RelatedContactsCard } from "./RecordRelatedCards";
import { renderPhoneLink, renderWebsiteLink } from "./RecordValueLinks";
import type { PicklistOption } from "../utils/picklist-options";
import type { Account, Activity, Contact } from "../utils/types";

export function AccountRecordPage({
    account,
    assignedUserId,
    assignedUserName,
    contacts,
    loading,
    onDelete,
    onDeleteActivity,
    onDeleteContact,
    onEdit,
    onEditActivity,
    onEditContact,
    onOpenActivity,
    onOpenContact,
    onRefresh,
    taskStatusOptions
}: {
    account: Account;
    assignedUserId?: string;
    assignedUserName?: string;
    contacts: Contact[];
    loading: boolean;
    onDelete: (record: Account) => void;
    onDeleteActivity?: (activity: Activity, afterDelete?: () => Promise<void> | void) => void;
    onDeleteContact: (record: Contact) => void;
    onEdit: (record: Account) => void;
    onEditActivity?: (activity: Activity) => void;
    onEditContact: (record: Contact) => void;
    onOpenActivity?: (activity: Activity) => void;
    onOpenContact: (record: Contact) => void;
    onRefresh: () => void;
    taskStatusOptions?: PicklistOption[];
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
                <RelatedContactsCard
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}
                    onEditContact={onEditContact}
                    onOpenContact={onOpenContact}
                />
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
            taskStatusOptions={taskStatusOptions}
        />
    );
}
