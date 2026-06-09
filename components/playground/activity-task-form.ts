import type { ActivityParentType } from "@/lib/salesforce/activities";

export type TaskForm = {
    Subject: string;
    ActivityDate: string;
    Status: string;
    Priority: string;
    Description: string;
};

export type EventForm = {
    Subject: string;
    StartDateTime: string;
    EndDateTime: string;
    Location: string;
    Description: string;
};

export type TaskFormErrorKey = "assignedUserName" | "Status" | "Subject";
export type TaskFormErrors = Partial<Record<TaskFormErrorKey, string>>;
export type EventFormErrorKey = "assignedUserName" | "EndDateTime" | "StartDateTime" | "Subject";
export type EventFormErrors = Partial<Record<EventFormErrorKey, string>>;

export type ActivityOwnerObjectLabel = "ユーザー";
export type ActivityWhoObjectLabel = "リード" | "取引先責任者";
export type ActivityWhatObjectLabel = "ケース" | "商談" | "その他" | "取引先";
export type LookupObjectLabel = ActivityOwnerObjectLabel | ActivityWhoObjectLabel | ActivityWhatObjectLabel;
export type RemoteLookupObjectLabel = "ユーザー" | "取引先" | "取引先責任者";
export type ActivityLookupOption = {
    id: string;
    label: string;
    meta?: string;
    objectLabel: LookupObjectLabel;
};

export type ActivityLookupApiObject = "account" | "contact" | "user";
export type ActivityLookupApiOption = {
    id: string;
    label: string;
    meta?: string;
    object: ActivityLookupApiObject;
};
export type ActivityLookupApiResponse = {
    options: ActivityLookupApiOption[];
};

export type ActivityLookupState = {
    assigned?: ActivityLookupOption;
    name?: ActivityLookupOption;
    related?: ActivityLookupOption;
};

export type ActivityLookupPayload = {
    OwnerId?: string;
    WhoId?: string;
    WhatId?: string;
};

export type ActivityRecordContext = {
    assignedUserName?: string;
    assignedUserId?: string;
    parentId: string;
    parentName: string;
    parentType: ActivityParentType;
    relatedId?: string;
    relatedName?: string;
};

export const taskSubjectOptions = ["", "Call", "Email", "Send Letter", "Send Quote", "Other"] as const;
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
export const weekDayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;
export const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hours = `${Math.floor(index / 2)}`.padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${hours}:${minutes}`;
});

export function compactActivityPayload<T extends Record<string, string>>(form: T) {
    return Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
            const trimmed = value.trim();
            return [key, trimmed || undefined];
        })
    );
}

export function compactEventActivityPayload(form: EventForm) {
    return {
        ...compactActivityPayload(form),
        StartDateTime: toSalesforceDateTime(form.StartDateTime),
        EndDateTime: toSalesforceDateTime(form.EndDateTime)
    };
}

function toSalesforceDateTime(value: string) {
    const trimmed = value.trim();

    return trimmed ? new Date(trimmed).toISOString() : undefined;
}

function isValidDateTimeInput(value: string): boolean {
    return !Number.isNaN(new Date(value).getTime());
}

export function getDateTimeDateValue(value: string): string {
    return value.split("T")[0] ?? "";
}

export function getDateTimeTimeValue(value: string): string {
    return value.split("T")[1]?.slice(0, 5) ?? "";
}

export function buildDateTimeInputValue(dateValue: string, timeValue: string): string {
    const normalizedDate = normalizeDateInputValue(dateValue);
    const normalizedTime = normalizeTimeInputValue(timeValue);

    if (!normalizedDate || !normalizedTime) {
        return "";
    }

    return `${normalizedDate}T${normalizedTime}`;
}

export function normalizeTimeInputValue(value: string): string {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
        return "";
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return "";
    }

    return `${hours}`.padStart(2, "0") + `:${`${minutes}`.padStart(2, "0")}`;
}

export function buildDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function buildDateTimeValue(date: Date): string {
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");

    return `${buildDateValue(date)}T${hours}:${minutes}`;
}

export function getDefaultTaskForm(): TaskForm {
    return {
        Subject: "",
        ActivityDate: buildDateValue(new Date()),
        Status: "Not Started",
        Priority: "Normal",
        Description: ""
    };
}

export function getDefaultEventForm(): EventForm {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return {
        Subject: "",
        StartDateTime: buildDateTimeValue(start),
        EndDateTime: buildDateTimeValue(end),
        Location: "",
        Description: ""
    };
}

export function formatDateInputValue(value: string): string {
    return value ? value.replaceAll("-", "/") : "";
}

export function getCalendarBaseDate(value: string): Date {
    const normalized = normalizeDateInputValue(value);
    if (!normalized) {
        return new Date();
    }

    const [year, month, day] = normalized.split("-").map(Number);

    return new Date(year, month - 1, day);
}

export function normalizeDateInputValue(value: string): string {
    const match = value.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) {
        return "";
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return "";
    }

    return buildDateValue(date);
}

export function buildCalendarWeeks(displayDate: Date) {
    const firstDay = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 6 }, (_, weekIndex) =>
        Array.from({ length: 7 }, (_, dayIndex) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

            return date;
        })
    );
}

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

export function compactLookupOptions(options: ActivityLookupOption[]) {
    const seen = new Set<string>();

    return options.filter((option) => {
        const key = `${option.objectLabel}:${option.id || option.label}`;
        if (!option.label || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export function buildDefaultTaskLookups({
    assignedOptions,
    context,
    nameOptions,
    relatedOptions
}: {
    assignedOptions: ActivityLookupOption[];
    context: ActivityRecordContext;
    nameOptions: ActivityLookupOption[];
    relatedOptions: ActivityLookupOption[];
}): ActivityLookupState {
    return {
        assigned: assignedOptions[0],
        name: context.parentType === "contact" ? nameOptions[0] : undefined,
        related: relatedOptions[0]
    };
}

function isActivityWhoLookup(option?: ActivityLookupOption): boolean {
    return option?.objectLabel === "リード" || option?.objectLabel === "取引先責任者";
}

function isActivityWhatLookup(option?: ActivityLookupOption): boolean {
    return option?.objectLabel === "ケース"
        || option?.objectLabel === "商談"
        || option?.objectLabel === "その他"
        || option?.objectLabel === "取引先";
}

export function buildActivityLookupPayload(lookups: ActivityLookupState): ActivityLookupPayload {
    return {
        OwnerId: lookups.assigned?.id,
        WhoId: isActivityWhoLookup(lookups.name) ? lookups.name?.id : undefined,
        WhatId: isActivityWhatLookup(lookups.related) ? lookups.related?.id : undefined
    };
}

export function getLookupApiObject(objectLabel: RemoteLookupObjectLabel): ActivityLookupApiObject {
    if (objectLabel === "取引先") {
        return "account";
    }

    if (objectLabel === "取引先責任者") {
        return "contact";
    }

    return "user";
}

export function getLookupObjectLabel(object: ActivityLookupApiObject): LookupObjectLabel {
    if (object === "account") {
        return "取引先";
    }

    if (object === "contact") {
        return "取引先責任者";
    }

    return "ユーザー";
}
