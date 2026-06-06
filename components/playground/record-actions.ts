import { getContactName } from "./formatting";
import type { Account, Contact, DeleteState } from "./types";

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

export function accountBulkDeleteLabel(records: Account[]) {
    return `選択した取引先 ${records.length} 件`;
}

export function contactDeleteLabel(record: Contact) {
    return getContactName(record);
}

export function contactBulkDeleteLabel(records: Contact[]) {
    return `選択した取引先責任者 ${records.length} 件`;
}
