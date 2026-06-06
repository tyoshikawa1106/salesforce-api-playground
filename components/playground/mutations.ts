import {
    buildAccountCreatePayload,
    buildAccountUpdatePayload,
    buildBulkDeleteRecordsRequest,
    buildContactCreatePayload,
    buildContactUpdatePayload,
    buildCreateRecordRequest,
    buildDeleteRecordRequest,
    buildPlaygroundApiRequest,
    buildUpdateRecordRequest,
    playgroundApiPaths
} from "@/lib/playground-api";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import { apiRequest } from "./api";
import type { DeleteState, ModalState, RecycleBinItem } from "./types";

export async function saveAccountMutation(modal: ModalState | null, accountForm: AccountForm): Promise<string> {
    if (modal?.type === "account" && modal.mode === "edit") {
        const payload = buildAccountUpdatePayload(accountForm);
        await apiRequest(buildUpdateRecordRequest("accounts", modal.record.Id, payload));
        return "取引先を更新しました。";
    }

    const payload = buildAccountCreatePayload(accountForm);
    await apiRequest(buildCreateRecordRequest("accounts", payload));
    return "取引先を作成しました。";
}

export async function saveContactMutation(modal: ModalState | null, contactForm: ContactForm): Promise<string> {
    if (modal?.type === "contact" && modal.mode === "edit") {
        const payload = buildContactUpdatePayload(contactForm);
        await apiRequest(buildUpdateRecordRequest("contacts", modal.record.Id, payload));
        return "取引先責任者を更新しました。";
    }

    const payload = buildContactCreatePayload(contactForm);
    await apiRequest(buildCreateRecordRequest("contacts", payload));
    return "取引先責任者を作成しました。";
}

export async function createIntegrationAccountMutation(accountForm: AccountForm): Promise<string> {
    const payload = buildAccountCreatePayload(accountForm);
    await apiRequest(
        buildPlaygroundApiRequest(playgroundApiPaths.integrationAccounts, {
            method: "POST",
            body: payload
        })
    );
    return "連携ユーザーで取引先を作成しました。";
}

export async function deleteRecordMutation(deleteState: DeleteState): Promise<string> {
    const resource = deleteState.type === "account" ? "accounts" : "contacts";

    if (deleteState.ids.length === 1) {
        await apiRequest(buildDeleteRecordRequest(resource, deleteState.ids[0]));

        return `${deleteState.label} を削除しました。`;
    }

    await apiRequest(buildBulkDeleteRecordsRequest(resource, deleteState.ids));

    return `${deleteState.label}を削除しました。`;
}

export async function restoreRecycleBinItemsMutation(items: RecycleBinItem[]): Promise<string> {
    await apiRequest(
        buildPlaygroundApiRequest(playgroundApiPaths.recycleBinUndelete, {
            method: "POST",
            body: {
                items: items.map((item) => ({
                    objectApiName: item.objectApiName,
                    id: item.id
                }))
            }
        })
    );

    return `${items.length} 件を復元しました。`;
}
