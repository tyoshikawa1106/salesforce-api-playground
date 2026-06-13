export type PicklistValue = {
    defaultValue?: boolean;
    label: string;
    value: string;
};

export type PicklistValuesResponse = {
    fields: Record<string, PicklistValue[]>;
    recordTypeId?: string;
};
