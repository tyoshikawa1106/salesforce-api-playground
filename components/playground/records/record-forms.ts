import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import {
    accountFieldNames,
    contactFieldNames
} from "@/lib/salesforce/record-fields";
import type { AccountFieldName, ContactFieldName } from "@/lib/salesforce/record-fields";
import type { Account, Contact } from "../utils/types";

export type TextFieldDefinition<TFieldName extends string> = {
    key: TFieldName;
    id: string;
    label: string;
    requiredMessage?: string;
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
    Department: "部署",
    AccountId: "取引先"
};

function fieldId(prefix: string, key: string) {
    return `${prefix}-${key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
}

export const accountTextFields: Array<TextFieldDefinition<AccountFieldName>> = accountFieldNames.map((key) => {
    const required = key === "Name";

    return {
        key,
        id: fieldId("account", key),
        label: accountFieldLabels[key],
        required,
        requiredMessage: required ? "取引先名は必須です。" : undefined
    };
});

export const contactTextFields: Array<TextFieldDefinition<Exclude<ContactFieldName, "AccountId">>> = contactFieldNames
    .filter((key) => key !== "AccountId")
    .map((key) => {
        const required = key === "LastName";

        return {
            key,
            id: fieldId("contact", key),
            label: contactFieldLabels[key],
            required,
            requiredMessage: required ? "取引先責任者の姓は必須です。" : undefined,
            type: key === "Email" ? "email" : undefined
        };
    });

export const contactAccountField = {
    key: "AccountId",
    id: "contact-account",
    label: contactFieldLabels.AccountId
} as const satisfies Pick<TextFieldDefinition<"AccountId">, "key" | "id" | "label">;

export function getRequiredFieldMessage<TFieldName extends string>(
    fields: Array<TextFieldDefinition<TFieldName>>,
    key: TFieldName
): string {
    return fields.find((field) => field.key === key)?.requiredMessage ?? "必須項目です。";
}

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
