import type { ActivityLookupOption } from "./ActivityCard";
import { getContactName, formatDate } from "./formatting";
import { DetailBlock } from "./RecordPageHeader";
import { RecordPageFrame } from "./RecordPageFrame";
import { renderEmailLink, renderPhoneLink } from "./RecordValueLinks";
import type { Activity, Contact } from "./types";

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
    onDeleteActivity?: (activity: Activity, afterDelete?: () => Promise<void> | void) => void;
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
