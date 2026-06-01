import {
    buildAccountCreatePayload,
    buildAccountUpdatePayload,
    buildContactCreatePayload,
    buildContactUpdatePayload,
    buildPlaygroundApiRequest,
    playgroundApiPaths
} from "@/lib/playground-api";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import { apiRequest } from "./api";
import type { DeleteState, ModalState } from "./types";

export async function saveAccountMutation(modal: ModalState | null, accountForm: AccountForm): Promise<string> {
    if (modal?.type === "account" && modal.mode === "edit") {
        const payload = buildAccountUpdatePayload(accountForm);
        await apiRequest(
            buildPlaygroundApiRequest(playgroundApiPaths.record("accounts", modal.record.Id), {
                method: "PATCH",
                body: payload
            })
        );
        return "取引先を更新しました。";
    }

    const payload = buildAccountCreatePayload(accountForm);
    await apiRequest(
        buildPlaygroundApiRequest(playgroundApiPaths.accounts, {
            method: "POST",
            body: payload
        })
    );
    return "取引先を作成しました。";
}

export async function saveContactMutation(modal: ModalState | null, contactForm: ContactForm): Promise<string> {
    if (modal?.type === "contact" && modal.mode === "edit") {
        const payload = buildContactUpdatePayload(contactForm);
        await apiRequest(
            buildPlaygroundApiRequest(playgroundApiPaths.record("contacts", modal.record.Id), {
                method: "PATCH",
                body: payload
            })
        );
        return "取引先責任者を更新しました。";
    }

    const payload = buildContactCreatePayload(contactForm);
    await apiRequest(
        buildPlaygroundApiRequest(playgroundApiPaths.contacts, {
            method: "POST",
            body: payload
        })
    );
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
    await apiRequest(
        buildPlaygroundApiRequest(playgroundApiPaths.record(resource, deleteState.id), {
            method: "DELETE"
        })
    );
    return `${deleteState.label} を削除しました。`;
}
