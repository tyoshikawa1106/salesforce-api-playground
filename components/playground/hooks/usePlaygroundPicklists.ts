"use client";

import type { AccountForm } from "@/lib/salesforce/records";
import type { PicklistValuesResponse } from "@/lib/salesforce/picklist-values";
import type { TaskForm } from "../activities/activity-task-form";
import { picklistOptionsForField } from "../utils/picklist-options";
import type { ModalState } from "../utils/types";
import { usePicklistValues } from "./usePicklistValues";

const accountPicklistFields = ["Industry", "Type"];
const taskPicklistFields = ["Status"];

type PicklistFetchState = {
    data: PicklistValuesResponse | null;
    error: string;
    loading: boolean;
};

export function buildPlaygroundPicklistState({
    accountForm,
    accountModalPicklists,
    integrationAccountForm,
    integrationAccountPicklists,
    taskForm,
    taskStatusPicklists
}: {
    accountForm: AccountForm;
    accountModalPicklists: PicklistFetchState;
    integrationAccountForm: AccountForm;
    integrationAccountPicklists: PicklistFetchState;
    taskForm: TaskForm;
    taskStatusPicklists: PicklistFetchState;
}) {
    const modalAccountPicklistOptions = {
        Industry: picklistOptionsForField(accountModalPicklists.data, "Industry", accountForm.Industry),
        Type: picklistOptionsForField(accountModalPicklists.data, "Type", accountForm.Type)
    };
    const integrationAccountPicklistOptions = {
        Industry: picklistOptionsForField(integrationAccountPicklists.data, "Industry", integrationAccountForm.Industry),
        Type: picklistOptionsForField(integrationAccountPicklists.data, "Type", integrationAccountForm.Type)
    };
    const taskStatusOptions = picklistOptionsForField(taskStatusPicklists.data, "Status", taskForm.Status);

    return {
        accountModalPicklists: {
            error: accountModalPicklists.error,
            loading: accountModalPicklists.loading,
            options: modalAccountPicklistOptions
        },
        integrationAccountPicklists: {
            error: integrationAccountPicklists.error,
            loading: integrationAccountPicklists.loading,
            options: integrationAccountPicklistOptions
        },
        taskStatusOptions: taskStatusOptions.length > 0 ? taskStatusOptions : undefined
    };
}

export function usePlaygroundPicklists({
    accountForm,
    connected,
    integrationAccountForm,
    modal,
    taskForm
}: {
    accountForm: AccountForm;
    connected: boolean;
    integrationAccountForm: AccountForm;
    modal: ModalState | null;
    taskForm: TaskForm;
}) {
    const accountModalRecordTypeId = modal?.type === "account" && modal.mode === "edit"
        ? modal.record.RecordTypeId
        : undefined;
    const accountModalPicklists = usePicklistValues({
        enabled: connected && modal?.type === "account",
        fieldApiNames: accountPicklistFields,
        objectApiName: "Account",
        recordTypeId: accountModalRecordTypeId
    });
    const integrationAccountPicklists = usePicklistValues({
        enabled: connected,
        fieldApiNames: accountPicklistFields,
        objectApiName: "Account"
    });
    const taskStatusPicklists = usePicklistValues({
        enabled: connected,
        fieldApiNames: taskPicklistFields,
        objectApiName: "Task"
    });

    return buildPlaygroundPicklistState({
        accountForm,
        accountModalPicklists,
        integrationAccountForm,
        integrationAccountPicklists,
        taskForm,
        taskStatusPicklists
    });
}
