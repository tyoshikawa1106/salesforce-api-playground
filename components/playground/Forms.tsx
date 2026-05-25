import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { Account } from "./types";

export const blankAccount: AccountForm = {
    Name: "",
    Phone: "",
    Website: "",
    Industry: "",
    Type: "",
    BillingCity: "",
    BillingCountry: ""
};

export const blankContact: ContactForm = {
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Title: "",
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
            <TextField label="Account Name" required value={value.Name} onChange={(Name) => onChange({ ...value, Name })} />
            <TextField label="Phone" value={value.Phone} onChange={(Phone) => onChange({ ...value, Phone })} />
            <TextField label="Website" value={value.Website} onChange={(Website) => onChange({ ...value, Website })} />
            <TextField label="Industry" value={value.Industry} onChange={(Industry) => onChange({ ...value, Industry })} />
            <TextField label="Type" value={value.Type} onChange={(Type) => onChange({ ...value, Type })} />
            <TextField label="Billing City" value={value.BillingCity} onChange={(BillingCity) => onChange({ ...value, BillingCity })} />
            <TextField label="Billing Country" value={value.BillingCountry} onChange={(BillingCountry) => onChange({ ...value, BillingCountry })} />
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
            <TextField label="First Name" value={value.FirstName} onChange={(FirstName) => onChange({ ...value, FirstName })} />
            <TextField label="Last Name" required value={value.LastName} onChange={(LastName) => onChange({ ...value, LastName })} />
            <TextField label="Email" type="email" value={value.Email} onChange={(Email) => onChange({ ...value, Email })} />
            <TextField label="Phone" value={value.Phone} onChange={(Phone) => onChange({ ...value, Phone })} />
            <TextField label="Title" value={value.Title} onChange={(Title) => onChange({ ...value, Title })} />
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
