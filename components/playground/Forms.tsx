import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { Account } from "./types";

type TextFieldDefinition<TForm extends Record<string, string>> = {
    key: keyof TForm;
    label: string;
    required?: boolean;
    type?: string;
};

const accountTextFields: Array<TextFieldDefinition<AccountForm>> = [
    { key: "Name", label: "Account Name", required: true },
    { key: "Phone", label: "Phone" },
    { key: "Website", label: "Website" },
    { key: "Industry", label: "Industry" },
    { key: "Type", label: "Type" },
    { key: "BillingCity", label: "Billing City" },
    { key: "BillingCountry", label: "Billing Country" }
];

const contactTextFields: Array<TextFieldDefinition<Omit<ContactForm, "AccountId">>> = [
    { key: "FirstName", label: "First Name" },
    { key: "LastName", label: "Last Name", required: true },
    { key: "Email", label: "Email", type: "email" },
    { key: "Phone", label: "Phone" },
    { key: "Title", label: "Title" }
];

function createBlankForm<TForm extends Record<string, string>>(
    fields: Array<TextFieldDefinition<TForm>>
): TForm {
    return Object.fromEntries(fields.map((field) => [field.key, ""])) as TForm;
}

export const blankAccount: AccountForm = {
    ...createBlankForm(accountTextFields)
};

export const blankContact: ContactForm = {
    ...createBlankForm(contactTextFields),
    AccountId: ""
};

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
                    Account
                </label>
                <div className="slds-form-element__control">
                    <select
                        id="contact-account"
                        className="slds-select"
                        value={value.AccountId}
                        onChange={(event) => onChange({ ...value, AccountId: event.target.value })}
                    >
                        <option value="">No Account</option>
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
                {required ? <abbr className="slds-required" title="required">*</abbr> : null}
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
