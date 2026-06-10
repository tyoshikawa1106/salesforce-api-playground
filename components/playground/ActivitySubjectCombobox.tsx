"use client";

import { type KeyboardEvent, useState } from "react";
import { taskSubjectOptions } from "./activity-task-form";
import { FieldError } from "./ActivityFieldErrorsAndInputs";
import { UtilityIcon } from "./SldsIcon";

export function QuickActionSubjectCombobox({
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
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(1);
    const inputId = "task-subject-combobox-input";
    const listboxId = "task-subject-combobox-listbox";
    const activeOptionId = `${inputId}-${activeIndex}`;
    const shouldShowOptions = (nextValue: string) => nextValue === "" || taskSubjectOptions.includes(nextValue as (typeof taskSubjectOptions)[number]);

    function selectSubject(nextValue: string) {
        onChange(nextValue);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!shouldShowOptions(value)) {
                return;
            }
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, taskSubjectOptions.length - 1));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!shouldShowOptions(value)) {
                return;
            }
            setOpen(true);
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open) {
            event.preventDefault();
            selectSubject(taskSubjectOptions[activeIndex]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={inputId}>{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</label>
            <div className="slds-form-element__control">
                <div className="slds-combobox_container">
                    <div className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}>
                        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                            <input
                                className="slds-combobox__input slds-input"
                                id={inputId}
                                type="text"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-controls={listboxId}
                                aria-expanded={open}
                                aria-haspopup="listbox"
                                aria-activedescendant={open ? activeOptionId : undefined}
                                aria-invalid={Boolean(error)}
                                aria-label={label}
                                autoComplete="off"
                                maxLength={255}
                                required={required}
                                value={value}
                                onBlur={() => setOpen(false)}
                                onChange={(event) => {
                                    const nextValue = event.target.value;
                                    onChange(nextValue);
                                    setOpen(shouldShowOptions(nextValue));
                                }}
                                onFocus={() => setOpen(shouldShowOptions(value))}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="slds-input__icon-group slds-input__icon-group_right">
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default slds-icon_x-small" name="search" />
                            </div>
                        </div>
                        <div className="slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-with-icon-7" id={listboxId} role="listbox" aria-label={label}>
                            {taskSubjectOptions.map((option, index) => {
                                const optionLabel = option || "--なし--";
                                const selected = value === option;
                                const active = activeIndex === index;

                                return (
                                    <div
                                        className={`slds-media slds-listbox__option slds-media_center slds-media_small slds-listbox__option_plain ${
                                            active ? "slds-has-focus" : ""
                                        }`}
                                        data-value={option}
                                        id={`${inputId}-${index}`}
                                        key={optionLabel}
                                        role="option"
                                        aria-checked={selected}
                                        aria-selected={selected}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            selectSubject(option);
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <span className="slds-media__figure slds-listbox__option-icon" />
                                        <span className="slds-media__body">
                                            <span title={optionLabel}>{optionLabel}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <FieldError message={error} />
            </div>
        </div>
    );
}
