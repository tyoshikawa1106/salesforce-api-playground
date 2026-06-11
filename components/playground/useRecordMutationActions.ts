import { type FormEvent, type Dispatch, type SetStateAction } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { ActivityLookupState, EventForm, TaskForm } from "./activity-task-form";
import {
    validateEventForm,
    validateTaskForm,
    type EventFormErrors,
    type TaskFormErrors
} from "./activity-task-form";
import {
    accountTextFields,
    blankAccount,
    contactTextFields,
    getRequiredFieldMessage
} from "./record-forms";
import {
    createIntegrationAccountMutation,
    deleteRecordMutation,
    restoreRecycleBinItemsMutation,
    saveAccountMutation,
    saveActivityMutation,
    saveContactMutation
} from "./mutations";
import { runMutationWithNotice } from "./mutation-runner";
import type { Activity, DeleteState, ModalState, Notice, RecycleBinItem, RestoreState } from "./types";

type UseRecordMutationActionsOptions = {
    accountForm: AccountForm;
    activityLookups: ActivityLookupState;
    contactForm: ContactForm;
    deleteState: DeleteState | null;
    eventForm: EventForm;
    integrationAccountForm: AccountForm;
    loadAll: () => Promise<void>;
    modal: ModalState | null;
    onActivityDeleted?: () => void;
    onActivitySaved?: (activity: Activity) => Promise<void>;
    restoreState: RestoreState | null;
    setIntegrationAccountForm: Dispatch<SetStateAction<AccountForm>>;
    setModal: Dispatch<SetStateAction<ModalState | null>>;
    setDeleteState: Dispatch<SetStateAction<DeleteState | null>>;
    setRestoreState: Dispatch<SetStateAction<RestoreState | null>>;
    setSaving: Dispatch<SetStateAction<boolean>>;
    showNotice: (notice: Notice) => void;
    taskForm: TaskForm;
};

type SaveRecordFormOptions = {
    event: FormEvent<HTMLFormElement>;
    formIsValid: boolean;
    requiredMessage: string;
    runMutation: () => Promise<string>;
    fallbackErrorMessage: string;
};

type ActivitySaveRequest = {
    form: EventForm | TaskForm;
    modal: Extract<ModalState, { type: "activity" }>;
    validationErrors: EventFormErrors | TaskFormErrors;
};

const accountNameRequiredMessage = getRequiredFieldMessage(accountTextFields, "Name");
const contactLastNameRequiredMessage = getRequiredFieldMessage(contactTextFields, "LastName");

export function getActivitySaveRequest({
    activityLookups,
    eventForm,
    modal,
    taskForm
}: {
    activityLookups: ActivityLookupState;
    eventForm: EventForm;
    modal: ModalState | null;
    taskForm: TaskForm;
}): ActivitySaveRequest | null {
    if (modal?.type !== "activity") {
        return null;
    }

    const isTask = modal.record.type === "task";
    const validationErrors = isTask
        ? validateTaskForm(taskForm, activityLookups.assigned?.label)
        : validateEventForm(eventForm, activityLookups.assigned?.label);

    return {
        form: isTask ? taskForm : eventForm,
        modal,
        validationErrors
    };
}

export function useRecordMutationActions({
    accountForm,
    activityLookups,
    contactForm,
    deleteState,
    eventForm,
    integrationAccountForm,
    loadAll,
    modal,
    onActivityDeleted,
    onActivitySaved,
    restoreState,
    setIntegrationAccountForm,
    setModal,
    setDeleteState,
    setRestoreState,
    setSaving,
    showNotice,
    taskForm
}: UseRecordMutationActionsOptions) {
    async function saveRecordForm({
        event,
        fallbackErrorMessage,
        formIsValid,
        requiredMessage,
        runMutation
    }: SaveRecordFormOptions) {
        event.preventDefault();
        if (!formIsValid) {
            showNotice({ tone: "error", message: requiredMessage });
            return;
        }

        await runMutationWithNotice({
            runMutation,
            fallbackErrorMessage,
            setSaving,
            showNotice,
            onSuccess: async () => {
                setModal(null);
                await loadAll();
            }
        });
    }

    async function saveAccount(event: FormEvent<HTMLFormElement>) {
        await saveRecordForm({
            event,
            formIsValid: Boolean(accountForm.Name.trim()),
            requiredMessage: accountNameRequiredMessage,
            runMutation: () => saveAccountMutation(modal, accountForm),
            fallbackErrorMessage: "取引先の保存に失敗しました。"
        });
    }

    async function saveContact(event: FormEvent<HTMLFormElement>) {
        await saveRecordForm({
            event,
            formIsValid: Boolean(contactForm.LastName.trim()),
            requiredMessage: contactLastNameRequiredMessage,
            runMutation: () => saveContactMutation(modal, contactForm),
            fallbackErrorMessage: "取引先責任者の保存に失敗しました。"
        });
    }

    async function saveActivity(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const activitySave = getActivitySaveRequest({
            activityLookups,
            eventForm,
            modal,
            taskForm
        });
        if (!activitySave) {
            return;
        }

        if (Object.keys(activitySave.validationErrors).length > 0) {
            showNotice({ tone: "error", message: "活動の必須項目を入力してください。" });
            return;
        }

        await runMutationWithNotice({
            runMutation: () => saveActivityMutation(activitySave.modal, activitySave.form, activityLookups),
            fallbackErrorMessage: "活動の保存に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setModal(null);
                if (onActivitySaved) {
                    await onActivitySaved(activitySave.modal.record);
                } else {
                    await loadAll();
                }
            }
        });
    }

    async function createIntegrationAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!integrationAccountForm.Name.trim()) {
            showNotice({ tone: "error", message: accountNameRequiredMessage });
            return;
        }

        await runMutationWithNotice({
            runMutation: () => createIntegrationAccountMutation(integrationAccountForm),
            fallbackErrorMessage: "連携ユーザーでの取引先作成に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setIntegrationAccountForm(blankAccount);
                await loadAll();
            }
        });
    }

    async function confirmDelete() {
        if (!deleteState) {
            return;
        }

        await runMutationWithNotice({
            runMutation: () => deleteRecordMutation(deleteState),
            fallbackErrorMessage: "削除に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setDeleteState(null);
                if (deleteState.type === "activity") {
                    onActivityDeleted?.();
                    await deleteState.afterDelete?.();
                }
                await loadAll();
            },
            onError: loadAll
        });
    }

    function openRestoreModal(items: RecycleBinItem[]) {
        const label = items.length === 1
            ? `${items[0].objectLabel} ${items[0].name}`
            : `選択した項目 ${items.length} 件`;

        setRestoreState({ items, label });
    }

    async function confirmRestore() {
        if (!restoreState) {
            return;
        }

        await runMutationWithNotice({
            runMutation: () => restoreRecycleBinItemsMutation(restoreState.items),
            fallbackErrorMessage: "復元に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setRestoreState(null);
                await loadAll();
            },
            onError: loadAll
        });
    }

    return {
        confirmDelete,
        confirmRestore,
        createIntegrationAccount,
        openRestoreModal,
        saveAccount,
        saveActivity,
        saveContact
    };
}
