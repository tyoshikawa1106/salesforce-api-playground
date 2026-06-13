"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { taskSubjectOptions } from "./activity-task-form";
import { QuickActionFieldShell } from "./ActivityFieldErrorsAndInputs";
import { UtilityIcon } from "../shell/SldsIcon";
import { useInputPopupPlacement } from "../hooks/useInputPopupPlacement";

export function QuickActionSubjectCombobox({
    error,
    idPrefix = "task-subject-combobox",
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    idPrefix?: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(1);
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputId = `${idPrefix}-input`;
    const errorId = error ? `${inputId}-error` : undefined;
    const listboxId = `${idPrefix}-listbox`;
    const activeOptionId = `${inputId}-${activeIndex}`;
    const shouldShowOptions = (nextValue: string) => nextValue === "" || taskSubjectOptions.includes(nextValue as (typeof taskSubjectOptions)[number]);
    const { containerRef, popupClassName, popupRef, popupStyle, portalTarget } = useInputPopupPlacement(open);

    useEffect(() => {
        if (!open) {
            return;
        }

        function closeOnOutsidePointer(event: Event) {
            const { current } = comboboxRef;
            if (event.target instanceof Node && current?.contains(event.target)) {
                return;
            }

            setOpen(false);
        }

        document.addEventListener("pointerdown", closeOnOutsidePointer);

        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePointer);
        };
    }, [open]);

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
        <QuickActionFieldShell
            error={error}
            errorId={errorId}
            label={label}
            labelFor={inputId}
            required={required}
        >
            <div className="slds-form-element__control">
                <div className="slds-combobox_container">
                    <div
                        ref={(element) => {
                            comboboxRef.current = element;
                            containerRef.current = element;
                        }}
                        className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click playground-input-popup-container ${open ? "slds-is-open playground-input-popup-container_open" : ""}`}
                        onBlur={(event) => {
                            if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
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
                                aria-autocomplete="list"
                                aria-describedby={errorId}
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
                        {open && portalTarget ? createPortal(
                            <div ref={popupRef} style={popupStyle} className={`slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-with-icon-7 playground-input-popup${popupClassName}`} id={listboxId} role="listbox" aria-label={label}>
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
                                            onPointerDown={(event) => {
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
                            </div>,
                            portalTarget
                        ) : null}
                    </div>
                </div>
            </div>
        </QuickActionFieldShell>
    );
}
