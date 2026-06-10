import type { EventForm } from "./activity-task-types";

export function compactActivityPayload<T extends Record<string, string | undefined>>(form: T) {
    return Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
            const trimmed = value?.trim();
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
