import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import {
    accountFieldNames,
    contactFieldNames
} from "@/lib/salesforce/record-fields";
import type { AccountFieldName, ContactFieldName } from "@/lib/salesforce/record-fields";
import type { Account, Contact } from "./types";

type TextFieldDefinition<TFieldName extends string> = {
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

const accountTextFields: Array<TextFieldDefinition<AccountFieldName>> = accountFieldNames.map((key) => ({
    key,
    label: accountFieldLabels[key],
    required: key === "Name"
}));

const contactTextFields: Array<TextFieldDefinition<Exclude<ContactFieldName, "AccountId">>> = contactFieldNames
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

export function AccountFormFields({
    value,
    onChange
}: {
    value: AccountForm;
    onChange: (value: AccountForm) => void;
}) {
    return (
        <div className="slds-grid slds-wrap slds-gutters">
            {accountTextFields.map((field) => (
                <TextField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    type={field.type}
                    value={value[field.key]}
                    onChange={(nextValue) => onChange({ ...value, [field.key]: nextValue })}
                />
            ))}
        </div>
    );
}

export function ContactFormFields({
    value,
    accounts,
    onChange
}: {
    value: ContactForm;
    accounts: Account[];
    onChange: (value: ContactForm) => void;
}) {
    return (
        <div className="slds-grid slds-wrap slds-gutters">
            {contactTextFields.map((field) => (
                <TextField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    type={field.type}
                    value={value[field.key]}
                    onChange={(nextValue) => onChange({ ...value, [field.key]: nextValue })}
                />
            ))}
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor="contact-account">
                    取引先
                </label>
                <div className="slds-form-element__control">
                    <select
                        id="contact-account"
                        className="slds-select"
                        value={value.AccountId}
                        onChange={(event) => onChange({ ...value, AccountId: event.target.value })}
                    >
                        <option value="">取引先なし</option>
                        {accounts.map((account) => (
                            <option key={account.Id} value={account.Id}>
                                {account.Name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

function TextField({
    label,
    value,
    onChange,
    type = "text",
    required = false
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    const id = label.toLowerCase().replaceAll(" ", "-");
    return (
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-form-element">
            <label className="slds-form-element__label" htmlFor={id}>
                {required ? <abbr className="slds-required" title="必須">*</abbr> : null}
                {label}
            </label>
            <div className="slds-form-element__control">
                <input
                    id={id}
                    className="slds-input"
                    type={type}
                    required={required}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
}
