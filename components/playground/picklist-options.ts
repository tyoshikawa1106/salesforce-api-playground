import type { PicklistValue, PicklistValuesResponse } from "@/lib/salesforce/picklist-values";

export type PicklistOption = PicklistValue;

export type PicklistOptionsByField<TFieldName extends string> = Partial<Record<TFieldName, PicklistOption[]>>;

export const taskStatusFallbackOptions: PicklistOption[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Waiting on someone else", value: "Waiting on someone else" },
    { label: "Deferred", value: "Deferred" }
];

export function picklistOptionsForField<TFieldName extends string>(
    picklists: PicklistValuesResponse | null,
    fieldApiName: TFieldName,
    currentValue = ""
): PicklistOption[] {
    const options = picklists?.fields[fieldApiName] ?? [];

    if (!currentValue || options.some((option) => option.value === currentValue)) {
        return options;
    }

    return [
        ...options,
        {
            label: currentValue,
            value: currentValue
        }
    ];
}
