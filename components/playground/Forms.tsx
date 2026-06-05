import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { Account } from "./types";
import { accountTextFields, contactAccountField, contactTextFields } from "./record-forms";

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
                    id={field.id}
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
                    id={field.id}
                    label={field.label}
                    required={field.required}
                    type={field.type}
                    value={value[field.key]}
                    onChange={(nextValue) => onChange({ ...value, [field.key]: nextValue })}
                />
            ))}
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-form-element">
                <label className="slds-form-element__label" htmlFor={contactAccountField.id}>
                    {contactAccountField.label}
                </label>
                <div className="slds-form-element__control">
                    <select
                        id={contactAccountField.id}
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
    id,
    label,
    value,
    onChange,
    type = "text",
    required = false
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
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
