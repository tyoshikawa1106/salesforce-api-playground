import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import {
    accountFieldNames,
    contactFieldNames
} from "@/lib/salesforce/record-fields";
import type { AccountFieldName, ContactFieldName } from "@/lib/salesforce/record-fields";
import type { Account, Contact } from "./types";

export type TextFieldDefinition<TFieldName extends string> = {
    key: TFieldName;
    label: string;
    required?: boolean;
    type?: string;
};

const accountFieldLabels: Record<AccountFieldName, string> = {
    Name: "取引先名",
    Phone: "電話",
    Website: "Web サイト",
    Industry: "業種",
    Type: "種別",
    BillingCity: "請求先市区郡",
    BillingCountry: "請求先国"
};

const contactFieldLabels: Record<ContactFieldName, string> = {
    FirstName: "名",
    LastName: "姓",
    Email: "メール",
    Phone: "電話",
    Title: "役職",
    AccountId: "取引先"
};

export const accountTextFields: Array<TextFieldDefinition<AccountFieldName>> = accountFieldNames.map((key) => ({
    key,
    label: accountFieldLabels[key],
    required: key === "Name"
}));

export const contactTextFields: Array<TextFieldDefinition<Exclude<ContactFieldName, "AccountId">>> = contactFieldNames
    .filter((key) => key !== "AccountId")
    .map((key) => ({
        key,
        label: contactFieldLabels[key],
        required: key === "LastName",
        type: key === "Email" ? "email" : undefined
    }));

function createBlankForm<TForm extends Record<string, string>>(
    fields: readonly string[]
): TForm {
    return Object.fromEntries(fields.map((field) => [field, ""])) as TForm;
}

export const blankAccount: AccountForm = {
    ...createBlankForm(accountFieldNames)
};

export const blankContact: ContactForm = {
    ...createBlankForm(contactFieldNames)
};

function recordToForm<TRecord, TForm extends Record<string, string>>(
    fields: readonly string[],
    record: TRecord | undefined
): TForm {
    if (!record) {
        return createBlankForm(fields);
    }

    return Object.fromEntries(
        fields.map((field) => {
            const value = record[field as keyof TRecord];
            return [field, typeof value === "string" ? value : ""];
        })
    ) as TForm;
}

export function accountRecordToForm(record?: Account): AccountForm {
    return recordToForm(accountFieldNames, record);
}

export function contactRecordToForm(record?: Contact): ContactForm {
    return recordToForm(contactFieldNames, record);
}
