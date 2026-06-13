"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    getEventFormErrorLabels,
    getTaskFormErrorLabels,
    type EventFormErrors,
    type TaskFormErrors
} from "./activity-task-form";
import type { PicklistOption } from "./picklist-options";
import { taskStatusFallbackOptions, withCurrentPicklistOption } from "./picklist-options";
import { UtilityIcon } from "./SldsIcon";
import { useInputPopupPlacement } from "./useInputPopupPlacement";

export function TaskFormErrorSummary({ errors }: { errors: TaskFormErrors }) {
    return <ActivityFormErrorSummary errorLabels={getTaskFormErrorLabels(errors)} />;
}

export function EventFormErrorSummary({ errors }: { errors: EventFormErrors }) {
    return <ActivityFormErrorSummary errorLabels={getEventFormErrorLabels(errors)} />;
}

function ActivityFormErrorSummary({ errorLabels }: { errorLabels: string[] }) {
    if (errorLabels.length === 0) {
        return null;
    }

    return (
        <div className="slds-border_bottom slds-p-bottom_medium slds-m-bottom_large">
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

export function QuickActionFormRows({ children }: { children: ReactNode }) {
    return (
        <div className="slds-form-element__control">
            <QuickActionFormGroup>
                {children}
            </QuickActionFormGroup>
        </div>
    );
}

export function QuickActionFormGroup({ children }: { children: ReactNode }) {
    return (
        <div className="slds-form-element__group">
            {children}
        </div>
    );
}

export function QuickActionFormRow({ children }: { children: ReactNode }) {
    return (
        <div className="slds-form-element__row">
            {children}
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
            <label className="slds-form-element__label" htmlFor={inputId}>
                <RequiredFieldMarker required={required} />
                {label}
            </label>
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
    options = taskStatusFallbackOptions,
    required = false,
    value
}: {
    error?: string;
    label: string;
    onChange: (value: string) => void;
    options?: PicklistOption[];
    required?: boolean;
    value: string;
}) {
    const displayedOptions = withCurrentPicklistOption(options, value);
    const selectOptions = [{ label: "--なし--", value: "" }, ...displayedOptions];
    const selectedIndex = Math.max(selectOptions.findIndex((option) => option.value === value), 0);
    const selectedLabel = selectOptions[selectedIndex]?.label ?? "--なし--";
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(selectedIndex);
    const inputId = `activity-picklist-${label}`;
    const listboxId = `${inputId}-listbox`;
    const activeOptionId = `${listboxId}-option-${activeIndex}`;
    const { containerRef, popupClassName, popupRef, popupStyle, portalTarget } = useInputPopupPlacement(open);

    useEffect(() => {
        setActiveIndex(selectedIndex);
    }, [selectedIndex]);

    function selectValue(nextValue: string) {
        onChange(nextValue);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, selectOptions.length - 1));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open) {
            event.preventDefault();
            selectValue(selectOptions[activeIndex]?.value ?? "");
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={inputId}>
                <RequiredFieldMarker required={required} />
                {label}
            </label>
            <div className="slds-form-element__control">
                <div className="slds-combobox_container">
                    <div
                        ref={containerRef}
                        className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click playground-input-popup-container ${open ? "slds-is-open playground-input-popup-container_open" : ""}`}
                        onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                                setOpen(false);
                            }
                        }}
                    >
                        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                            <input
                                className="slds-combobox__input slds-input"
                                id={inputId}
                                type="text"
                                role="combobox"
                                aria-activedescendant={open ? activeOptionId : undefined}
                                aria-controls={listboxId}
                                aria-expanded={open}
                                aria-haspopup="listbox"
                                aria-invalid={Boolean(error)}
                                aria-readonly="true"
                                autoComplete="off"
                                readOnly
                                required={required}
                                value={selectedLabel}
                                onClick={() => setOpen(true)}
                                onFocus={() => setOpen(true)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="slds-input__icon-group slds-input__icon-group_right">
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default slds-icon_x-small" name="down" />
                            </div>
                        </div>
                        {open && portalTarget ? createPortal(
                            <div ref={popupRef} style={popupStyle} className={`slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-5 playground-input-popup${popupClassName}`} id={listboxId} role="listbox" aria-label={label}>
                                {selectOptions.map((option, index) => (
                                    <div
                                        className={`slds-media slds-listbox__option slds-media_center slds-media_small slds-listbox__option_plain ${activeIndex === index ? "slds-has-focus" : ""}`}
                                        data-value={option.value}
                                        id={`${listboxId}-option-${index}`}
                                        key={option.value}
                                        role="option"
                                        aria-selected={value === option.value}
                                        onPointerDown={(event) => {
                                            event.preventDefault();
                                            selectValue(option.value);
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <span className="slds-media__body">
                                            <span title={option.label}>{option.label}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>,
                            portalTarget
                        ) : null}
                    </div>
                </div>
            </div>
            <FieldError message={error} />
        </div>
    );
}

export function FieldError({ message }: { message?: string }) {
    return message ? <div className="slds-form-element__help">{message}</div> : null;
}

function RequiredFieldMarker({ required }: { required: boolean }) {
    return required ? <abbr className="slds-required" title="必須">*</abbr> : null;
}
