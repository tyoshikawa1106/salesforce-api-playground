import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { Account } from "./types";
import type { ActivityLookupOption } from "./activity-task-form";
import { QuickActionLookup, QuickActionSelect } from "./ActivityQuickActionFields";
import { accountTextFields, contactAccountField, contactTextFields } from "./record-forms";
import type { PicklistOptionsByField } from "./picklist-options";

type AccountSelectFieldName = "Industry" | "Type";

const accountSelectFields = new Set<string>(["Industry", "Type"]);

export function AccountFormFields({
    loadingPicklists = false,
    fieldErrors = {},
    picklistError = "",
    picklistOptions = {},
    value,
    onChange
}: {
    loadingPicklists?: boolean;
    fieldErrors?: Partial<Record<keyof AccountForm, string>>;
    picklistError?: string;
    picklistOptions?: PicklistOptionsByField<AccountSelectFieldName>;
    value: AccountForm;
    onChange: (value: AccountForm) => void;
}) {
    return (
        <div className="slds-grid slds-wrap slds-gutters">
            {accountTextFields.map((field) => {
                const fieldValue = value[field.key];
                if (accountSelectFields.has(field.key)) {
                    return (
                        <SelectField
                            key={field.key}
                            disabled={loadingPicklists}
                            helpText={picklistError}
                            id={field.id}
                            label={field.label}
                            options={picklistOptions[field.key as AccountSelectFieldName] ?? []}
                            value={fieldValue}
                            onChange={(nextValue) => onChange({ ...value, [field.key]: nextValue })}
                        />
                    );
                }

                return (
                    <TextField
                        error={fieldErrors[field.key]}
                        key={field.key}
                        id={field.id}
                        label={field.label}
                        required={field.required}
                        type={field.type}
                        value={fieldValue}
                        onChange={(nextValue) => onChange({ ...value, [field.key]: nextValue })}
                    />
                );
            })}
        </div>
    );
}

export function ContactFormFields({
    value,
    accounts,
    fieldErrors = {},
    onChange
}: {
    value: ContactForm;
    accounts: Account[];
    fieldErrors?: Partial<Record<keyof ContactForm, string>>;
    onChange: (value: ContactForm) => void;
}) {
    const accountOptions = accounts.map(accountToLookupOption);
    const selectedAccount = accountOptions.find((option) => option.id === value.AccountId)
        ?? buildCurrentAccountLookup(value.AccountId);

    return (
        <div className="slds-grid slds-wrap slds-gutters">
            {contactTextFields.map((field) => (
                <TextField
                    error={fieldErrors[field.key]}
                    key={field.key}
                    id={field.id}
                    label={field.label}
                    required={field.required}
                    type={field.type}
                    value={value[field.key]}
                    onChange={(nextValue) => onChange({ ...value, [field.key]: nextValue })}
                />
            ))}
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                <QuickActionLookup
                    idPrefix={contactAccountField.id}
                    label={contactAccountField.label}
                    objectLabel="取引先"
                    options={accountOptions}
                    placeholder="取引先を検索..."
                    value={selectedAccount}
                    onChange={(nextValue) => onChange({ ...value, AccountId: nextValue?.id ?? "" })}
                />
            </div>
        </div>
    );
}

function accountToLookupOption(account: Account): ActivityLookupOption {
    return {
        id: account.Id,
        label: account.Name,
        objectLabel: "取引先"
    };
}

function buildCurrentAccountLookup(accountId: string): ActivityLookupOption | undefined {
    if (!accountId) {
        return undefined;
    }

    return {
        id: accountId,
        label: accountId,
        objectLabel: "取引先"
    };
}

function TextField({
    error,
    id,
    label,
    value,
    onChange,
    type = "text",
    required = false
}: {
    error?: string;
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className={`slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-form-element ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={id}>
                {required ? <abbr className="slds-required" title="required" aria-hidden="true">* </abbr> : null}
                {label}
            </label>
            <div className="slds-form-element__control">
                <input
                    id={id}
                    className="slds-input"
                    type={type}
                    aria-describedby={errorId}
                    aria-invalid={Boolean(error)}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
            {error ? <div className="slds-form-element__help" id={errorId}>{error}</div> : null}
        </div>
    );
}

function SelectField({
    disabled,
    helpText,
    id,
    label,
    options,
    value,
    onChange
}: {
    disabled: boolean;
    helpText: string;
    id: string;
    label: string;
    options: Array<{ label: string; value: string }>;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
            <QuickActionSelect
                disabled={disabled}
                emptyLabel=""
                error={helpText}
                idPrefix={id}
                label={label}
                options={options}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
