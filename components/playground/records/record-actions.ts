import { getContactName } from "../utils/formatting";
import type { Account, Activity, Contact, DeleteState } from "../utils/types";

export function accountDeleteState(records: Account[], label: string): DeleteState {
    return {
        type: "account",
        ids: records.map((record) => record.Id),
        label
    };
}

export function contactDeleteState(records: Contact[], label: string): DeleteState {
    return {
        type: "contact",
        ids: records.map((record) => record.Id),
        label
    };
}

export function activityDeleteState(activity: Activity, afterDelete?: () => Promise<void> | void): DeleteState {
    return {
        type: "activity",
        activityType: activity.type,
        ids: [activity.id],
        label: activity.subject || activity.id,
        ...(afterDelete ? { afterDelete } : {})
    };
}

export function accountBulkDeleteLabel(records: Account[]) {
    return `選択した取引先 ${records.length} 件`;
}

export function contactDeleteLabel(record: Contact) {
    return getContactName(record);
}

export function contactBulkDeleteLabel(records: Contact[]) {
    return `選択した取引先責任者 ${records.length} 件`;
}
