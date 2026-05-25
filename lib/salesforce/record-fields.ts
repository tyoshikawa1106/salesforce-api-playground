export const accountFieldNames = [
    "Name",
    "Phone",
    "Website",
    "Industry",
    "Type",
    "BillingCity",
    "BillingCountry"
] as const;

export const contactFieldNames = [
    "FirstName",
    "LastName",
    "Email",
    "Phone",
    "Title",
    "AccountId"
] as const;

export type AccountFieldName = (typeof accountFieldNames)[number];
export type ContactFieldName = (typeof contactFieldNames)[number];
