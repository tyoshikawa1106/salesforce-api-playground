"use client";

import {
    getEventFormErrorLabels,
    getTaskFormErrorLabels,
    type EventFormErrors,
    type TaskFormErrors
} from "./activity-task-form";

export function TaskFormErrorSummary({ errors }: { errors: TaskFormErrors }) {
    const errorLabels = getTaskFormErrorLabels(errors);

    if (errorLabels.length === 0) {
        return null;
    }

    return (
        <div className="playground-task-error-summary">
            <div className="slds-notify slds-notify_alert slds-alert_error playground-task-error-alert" role="alert">
                <span className="slds-assistive-text">エラー</span>
                <h2>このページのエラーを確認してください。</h2>
            </div>
            <p className="slds-text-color_error slds-m-top_small">
                次の必須項目を入力する必要があります: {errorLabels.join("、")}
            </p>
        </div>
    );
}

export function EventFormErrorSummary({ errors }: { errors: EventFormErrors }) {
    const errorLabels = getEventFormErrorLabels(errors);

    if (errorLabels.length === 0) {
        return null;
    }

    return (
        <div className="playground-task-error-summary">
            <div className="slds-notify slds-notify_alert slds-alert_error playground-task-error-alert" role="alert">
                <span className="slds-assistive-text">エラー</span>
                <h2>このページのエラーを確認してください。</h2>
            </div>
            <p className="slds-text-color_error slds-m-top_small">
                次の必須項目を入力する必要があります: {errorLabels.join("、")}
            </p>
        </div>
    );
}

export function QuickActionTextInput({
    error,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    const inputId = `activity-text-${label}`;

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={inputId}>{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</label>
            <div className="slds-form-element__control">
                <input
                    className="slds-input"
                    id={inputId}
                    type="text"
                    aria-invalid={Boolean(error)}
                    maxLength={255}
                    required={required}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                <FieldError message={error} />
            </div>
        </div>
    );
}

export function QuickActionLongTextInput({
    label,
    onChange,
    value
}: {
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    const inputId = `activity-long-text-${label}`;

    return (
        <div className="slds-form-element slds-size_1-of-1">
            <label className="slds-form-element__label" htmlFor={inputId}>{label}</label>
            <div className="slds-form-element__control">
                <textarea
                    className="slds-textarea playground-task-composer__textarea"
                    id={inputId}
                    maxLength={32000}
                    rows={4}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
}

export function QuickActionSelect({
    error,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <span className="slds-form-element__label">{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</span>
            <span className="slds-form-element__control">
                <span className="slds-select_container">
                    <select className="slds-select" required={required} aria-invalid={Boolean(error)} value={value} onChange={(event) => onChange(event.target.value)}>
                        <option value="">--なし--</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Waiting on someone else">Waiting on someone else</option>
                        <option value="Deferred">Deferred</option>
                    </select>
                </span>
            </span>
            <FieldError message={error} />
        </div>
    );
}

export function FieldError({ message }: { message?: string }) {
    return message ? <div className="slds-form-element__help">{message}</div> : null;
}
