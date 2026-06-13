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
import type { ActivityLookupState, EventForm, TaskForm } from "../activities/activity-task-form";
import { buildActivityLookupPayload } from "../activities/activity-task-form";
import { apiRequest } from "../utils/api";
import {
    buildEventActivityCreateRequest,
    buildTaskActivityCreateRequest
} from "../activities/activity-create-helpers";
import type { DeleteState, ModalState, RecycleBinItem } from "../utils/types";

type RecordModalType = Extract<ModalState["type"], "account" | "contact">;

type RecordMutationConfig<TType extends RecordModalType, TForm extends AccountForm | ContactForm> = {
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

async function saveRecordMutation<TType extends RecordModalType, TForm extends AccountForm | ContactForm>(
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

function buildActivityLookupUpdatePayload(lookups: ActivityLookupState) {
    const payload = buildActivityLookupPayload(lookups);

    return {
        OwnerId: payload.OwnerId ?? null,
        WhoId: payload.WhoId ?? null,
        WhatId: payload.WhatId ?? null
    };
}

function buildActivityUpdatePayload<T extends Record<string, string>>(form: T) {
    return Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
            const trimmed = value.trim();
            return [key, trimmed || null];
        })
    );
}

function buildEventActivityUpdatePayload(form: EventForm) {
    return {
        ...buildActivityUpdatePayload({
            Subject: form.Subject,
            Location: form.Location,
            Description: form.Description
        }),
        StartDateTime: form.StartDateTime.trim() ? new Date(form.StartDateTime).toISOString() : null,
        EndDateTime: form.EndDateTime.trim() ? new Date(form.EndDateTime).toISOString() : null
    };
}

export async function saveActivityMutation(
    modal: ModalState | null,
    form: TaskForm | EventForm,
    lookups: ActivityLookupState
): Promise<string> {
    if (modal?.type !== "activity") {
        throw new Error("活動の編集対象が選択されていません。");
    }

    if (modal.mode === "create") {
        if (modal.activityType === "task") {
            await apiRequest(buildTaskActivityCreateRequest({
                activityLookups: lookups,
                form: form as TaskForm
            }));
            return "ToDo を作成しました。";
        }

        await apiRequest(buildEventActivityCreateRequest({
            activityLookups: lookups,
            form: form as EventForm
        }));
        return "行動を作成しました。";
    }

    const path = modal.record.type === "task"
        ? playgroundApiPaths.activityTask(modal.record.id)
        : playgroundApiPaths.activityEvent(modal.record.id);
    const body = modal.record.type === "task"
        ? {
            ...buildActivityUpdatePayload({
                Subject: (form as TaskForm).Subject,
                ActivityDate: (form as TaskForm).ActivityDate,
                Status: (form as TaskForm).Status,
                Description: (form as TaskForm).Description
            }),
            ...buildActivityLookupUpdatePayload(lookups)
        }
        : {
            ...buildEventActivityUpdatePayload(form as EventForm),
            ...buildActivityLookupUpdatePayload(lookups)
        };

    await apiRequest(
        buildPlaygroundApiRequest(path, {
            method: "PATCH",
            body
        })
    );

    return `${modal.record.type === "task" ? "ToDo" : "行動"}を更新しました。`;
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
    if (deleteState.type === "activity") {
        const path = deleteState.activityType === "task"
            ? playgroundApiPaths.activityTask(deleteState.ids[0])
            : playgroundApiPaths.activityEvent(deleteState.ids[0]);
        await apiRequest(buildPlaygroundApiRequest(path, { method: "DELETE" }));

        return `${deleteState.label} を削除しました。`;
    }

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
