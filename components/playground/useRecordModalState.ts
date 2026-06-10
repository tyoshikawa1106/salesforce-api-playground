import { useState } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { ActivityLookupState, EventForm, TaskForm } from "./activity-task-form";
import {
    getDefaultEventForm,
    getDefaultTaskForm
} from "./activity-task-form";
import {
    activityToEventForm,
    activityToLookupState,
    activityToTaskForm
} from "./activity-form-mappers";
import {
    accountRecordToForm,
    blankAccount,
    blankContact,
    contactRecordToForm
} from "./record-forms";
import type { Account, Activity, Contact, DeleteState, ModalState, RestoreState } from "./types";

export function useRecordModalState() {
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

    return {
        accountForm,
        activityLookups,
        closeDeleteModal: () => setDeleteState(null),
        closeRecordModal: () => setModal(null),
        closeRestoreModal: () => setRestoreState(null),
        contactForm,
        deleteState,
        eventForm,
        integrationAccountForm,
        modal,
        openAccountModal,
        openActivityModal,
        openContactModal,
        restoreState,
        setAccountForm,
        setActivityLookups,
        setContactForm,
        setDeleteState,
        setEventForm,
        setIntegrationAccountForm,
        setModal,
        setRestoreState,
        setTaskForm,
        taskForm
    };
}
