import {
    buildBulkDeleteRecordsRequest,
    buildCreateRecordPayload,
    buildCreateRecordRequest,
    buildDeleteRecordRequest,
    buildPlaygroundApiRequest,
    buildUpdateRecordPayload,
    buildUpdateRecordRequest,
    playgroundApiPaths
} from "@/lib/playground-api";
import type { PlaygroundApiResource } from "@/lib/playground-api";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import { apiRequest } from "./api";
import type { DeleteState, ModalState, RecycleBinItem } from "./types";

type RecordMutationConfig<TType extends ModalState["type"], TForm extends AccountForm | ContactForm> = {
    type: TType;
    resource: PlaygroundApiResource;
    createMessage: string;
    updateMessage: string;
    buildCreatePayload: (form: TForm) => unknown;
    buildUpdatePayload: (form: TForm) => unknown;
};

const accountMutationConfig = {
    type: "account",
    resource: "accounts",
    createMessage: "取引先を作成しました。",
    updateMessage: "取引先を更新しました。",
    buildCreatePayload: (form: AccountForm) => buildCreateRecordPayload("accounts", form),
    buildUpdatePayload: (form: AccountForm) => buildUpdateRecordPayload("accounts", form)
} as const satisfies RecordMutationConfig<"account", AccountForm>;

const contactMutationConfig = {
    type: "contact",
    resource: "contacts",
    createMessage: "取引先責任者を作成しました。",
    updateMessage: "取引先責任者を更新しました。",
    buildCreatePayload: (form: ContactForm) => buildCreateRecordPayload("contacts", form),
    buildUpdatePayload: (form: ContactForm) => buildUpdateRecordPayload("contacts", form)
} as const satisfies RecordMutationConfig<"contact", ContactForm>;

async function saveRecordMutation<TType extends ModalState["type"], TForm extends AccountForm | ContactForm>(
    modal: ModalState | null,
    form: TForm,
    config: RecordMutationConfig<TType, TForm>
): Promise<string> {
    if (modal?.type === config.type && modal.mode === "edit") {
        const payload = config.buildUpdatePayload(form);
        await apiRequest(buildUpdateRecordRequest(config.resource, modal.record.Id, payload));
        return config.updateMessage;
    }

    const payload = config.buildCreatePayload(form);
    await apiRequest(buildCreateRecordRequest(config.resource, payload));
    return config.createMessage;
}

export async function saveAccountMutation(modal: ModalState | null, accountForm: AccountForm): Promise<string> {
    return saveRecordMutation(modal, accountForm, accountMutationConfig);
}

export async function saveContactMutation(modal: ModalState | null, contactForm: ContactForm): Promise<string> {
    return saveRecordMutation(modal, contactForm, contactMutationConfig);
}

export async function createIntegrationAccountMutation(accountForm: AccountForm): Promise<string> {
    const payload = buildCreateRecordPayload("accounts", accountForm);
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
