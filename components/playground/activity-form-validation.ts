import { isValidDateTimeInput } from "./activity-date-utils";
import type {
    EventForm,
    EventFormErrorKey,
    EventFormErrors,
    TaskForm,
    TaskFormErrorKey,
    TaskFormErrors
} from "./activity-task-types";

export const taskFormErrorLabels = {
    Subject: "件名",
    assignedUserName: "割り当て先",
    Status: "状況"
} as const satisfies Record<TaskFormErrorKey, string>;

export const eventFormErrorLabels = {
    Subject: "件名",
    StartDateTime: "開始",
    EndDateTime: "終了",
    assignedUserName: "割り当て先"
} as const satisfies Record<EventFormErrorKey, string>;

export function validateTaskForm(form: TaskForm, assignedUserName?: string): TaskFormErrors {
    const errors: TaskFormErrors = {};

    if (!form.Subject.trim()) {
        errors.Subject = "件名を入力してください。";
    }

    if (!assignedUserName?.trim()) {
        errors.assignedUserName = "割り当て先を選択してください。";
    }

    if (!form.Status.trim()) {
        errors.Status = "状況を選択してください。";
    }

    return errors;
}

export function validateEventForm(form: EventForm, assignedUserName?: string): EventFormErrors {
    const errors: EventFormErrors = {};

    if (!form.Subject.trim()) {
        errors.Subject = "件名を入力してください。";
    }

    if (!form.StartDateTime.trim()) {
        errors.StartDateTime = "開始日時を入力してください。";
    } else if (!isValidDateTimeInput(form.StartDateTime)) {
        errors.StartDateTime = "開始日時の形式を確認してください。";
    }

    if (!form.EndDateTime.trim()) {
        errors.EndDateTime = "終了日時を入力してください。";
    } else if (!isValidDateTimeInput(form.EndDateTime)) {
        errors.EndDateTime = "終了日時の形式を確認してください。";
    }

    if (!errors.StartDateTime && !errors.EndDateTime && form.EndDateTime <= form.StartDateTime) {
        errors.EndDateTime = "終了日時は開始日時より後にしてください。";
    }

    if (!assignedUserName?.trim()) {
        errors.assignedUserName = "割り当て先を選択してください。";
    }

    return errors;
}

export function getTaskFormErrorLabels(errors: TaskFormErrors) {
    return (Object.keys(errors) as TaskFormErrorKey[]).map((key) => taskFormErrorLabels[key]);
}

export function getEventFormErrorLabels(errors: EventFormErrors) {
    return (Object.keys(errors) as EventFormErrorKey[]).map((key) => eventFormErrorLabels[key]);
}
