import { type FormEvent, useState } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { ActivityLookupOption, ActivityLookupState, EventForm, TaskForm } from "./activity-task-form";
import {
    getDefaultEventForm,
    getDefaultTaskForm,
    validateEventForm,
    validateTaskForm
} from "./activity-task-form";
import {
    accountTextFields,
    accountRecordToForm,
    blankAccount,
    blankContact,
    contactRecordToForm,
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
import type { Account, Activity, Contact, DeleteState, ModalState, Notice, RecycleBinItem, RestoreState } from "./types";

type UseRecordMutationsOptions = {
    loadAll: () => Promise<void>;
    onActivityDeleted?: () => void;
    onActivitySaved?: (activity: Activity) => Promise<void>;
    showNotice: (notice: Notice) => void;
};

type SaveRecordFormOptions = {
    event: FormEvent<HTMLFormElement>;
    formIsValid: boolean;
    requiredMessage: string;
    runMutation: () => Promise<string>;
    fallbackErrorMessage: string;
};

const accountNameRequiredMessage = getRequiredFieldMessage(accountTextFields, "Name");
const contactLastNameRequiredMessage = getRequiredFieldMessage(contactTextFields, "LastName");

function activityLookupOption(
    id: string | undefined,
    label: string | undefined,
    objectLabel: ActivityLookupOption["objectLabel"]
): ActivityLookupOption | undefined {
    return id && label ? { id, label, objectLabel } : undefined;
}

function activityToTaskForm(activity?: Activity): TaskForm {
    if (!activity || activity.type !== "task") {
        return getDefaultTaskForm();
    }

    return {
        Subject: activity.subject,
        ActivityDate: activity.date ?? "",
        Status: activity.status ?? "Not Started",
        Priority: activity.priority ?? "Normal",
        TaskSubtype: activity.taskSubtype,
        Description: activity.description ?? ""
    };
}

function activityToEventForm(activity?: Activity): EventForm {
    if (!activity || activity.type !== "event") {
        return getDefaultEventForm();
    }

    return {
        Subject: activity.subject,
        StartDateTime: activity.startDateTime?.slice(0, 16) ?? "",
        EndDateTime: activity.endDateTime?.slice(0, 16) ?? "",
        Location: activity.location ?? "",
        Description: activity.description ?? ""
    };
}

function activityToLookupState(activity?: Activity): ActivityLookupState {
    return {
        assigned: activityLookupOption(activity?.ownerId, activity?.ownerName, "ユーザー"),
        name: activityLookupOption(activity?.whoId, activity?.whoName, "取引先責任者"),
        related: activityLookupOption(activity?.whatId, activity?.whatName, "取引先")
    };
}

export function useRecordMutations({
    loadAll,
    onActivityDeleted,
    onActivitySaved,
    showNotice
}: UseRecordMutationsOptions) {
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
    const [restoreState, setRestoreState] = useState<RestoreState | null>(null);
    const [accountForm, setAccountForm] = useState<AccountForm>(blankAccount);
    const [activityLookups, setActivityLookups] = useState<ActivityLookupState>({});
    const [eventForm, setEventForm] = useState<EventForm>(() => getDefaultEventForm());
    const [integrationAccountForm, setIntegrationAccountForm] = useState<AccountForm>(blankAccount);
    const [contactForm, setContactForm] = useState<ContactForm>(blankContact);
    const [taskForm, setTaskForm] = useState<TaskForm>(() => getDefaultTaskForm());

    function openAccountModal(record?: Account) {
        setAccountForm(accountRecordToForm(record));
        setModal(record ? { type: "account", mode: "edit", record } : { type: "account", mode: "create" });
    }

    function openContactModal(record?: Contact) {
        setContactForm(contactRecordToForm(record));
        setModal(record ? { type: "contact", mode: "edit", record } : { type: "contact", mode: "create" });
    }

    function openActivityModal(record: Activity) {
        setTaskForm(activityToTaskForm(record));
        setEventForm(activityToEventForm(record));
        setActivityLookups(activityToLookupState(record));
        setModal({ type: "activity", mode: "edit", record });
    }

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
        if (modal?.type !== "activity") {
            return;
        }

        const isTask = modal.record.type === "task";
        const validationErrors = isTask
            ? validateTaskForm(taskForm, activityLookups.assigned?.label)
            : validateEventForm(eventForm, activityLookups.assigned?.label);

        if (Object.keys(validationErrors).length > 0) {
            showNotice({ tone: "error", message: "活動の必須項目を入力してください。" });
            return;
        }

        await runMutationWithNotice({
            runMutation: () => saveActivityMutation(modal, isTask ? taskForm : eventForm, activityLookups),
            fallbackErrorMessage: "活動の保存に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setModal(null);
                if (onActivitySaved) {
                    await onActivitySaved(modal.record);
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
        accountForm,
        activityLookups,
        closeDeleteModal: () => setDeleteState(null),
        closeRestoreModal: () => setRestoreState(null),
        closeRecordModal: () => setModal(null),
        confirmDelete,
        confirmRestore,
        contactForm,
        createIntegrationAccount,
        deleteState,
        eventForm,
        integrationAccountForm,
        modal,
        openActivityModal,
        openAccountModal,
        openContactModal,
        saveAccount,
        saveActivity,
        saveContact,
        saving,
        restoreState,
        setAccountForm,
        setActivityLookups,
        setContactForm,
        setEventForm,
        setDeleteState,
        setIntegrationAccountForm,
        setTaskForm,
        taskForm,
        openRestoreModal
    };
}
