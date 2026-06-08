import type { ActivityParentType } from "@/lib/salesforce/activities";

export type TaskForm = {
    Subject: string;
    ActivityDate: string;
    Status: string;
    Priority: string;
    Description: string;
};

export type TaskFormErrorKey = "assignedUserName" | "Status" | "Subject";
export type TaskFormErrors = Partial<Record<TaskFormErrorKey, string>>;

export type LookupObjectLabel = "ユーザー" | "取引先" | "取引先責任者";
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

export type TaskLookupState = {
    assigned?: ActivityLookupOption;
    name?: ActivityLookupOption;
    related?: ActivityLookupOption;
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
export const weekDayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function compactActivityPayload<T extends Record<string, string>>(form: T) {
    return Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
            const trimmed = value.trim();
            return [key, trimmed || undefined];
        })
    );
}

export function buildDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
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

export function getTaskFormErrorLabels(errors: TaskFormErrors) {
    return (Object.keys(errors) as TaskFormErrorKey[]).map((key) => taskFormErrorLabels[key]);
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
}): TaskLookupState {
    return {
        assigned: assignedOptions[0],
        name: context.parentType === "contact" ? nameOptions[0] : undefined,
        related: relatedOptions[0]
    };
}

export function getLookupApiObject(objectLabel: LookupObjectLabel): ActivityLookupApiObject {
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
