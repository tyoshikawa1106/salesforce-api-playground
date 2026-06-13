"use client";

import { type KeyboardEvent, useState } from "react";
import { createPortal } from "react-dom";
import { timeOptions } from "./activity-task-form";
import { UtilityIcon } from "./SldsIcon";
import { useInputPopupPlacement } from "./useInputPopupPlacement";

export function QuickActionTimepicker({
    idPrefix,
    label,
    onChange,
    value
}: {
    idPrefix: string;
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(() => Math.max(timeOptions.indexOf(value), 0));
    const inputId = `${idPrefix}-input`;
    const listboxId = `${idPrefix}-listbox`;
    const activeOptionId = `${listboxId}-option-${activeIndex}`;
    const { containerRef, popupClassName, popupRef, popupStyle, portalTarget } = useInputPopupPlacement(open);

    function selectTime(nextValue: string) {
        onChange(nextValue);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, timeOptions.length - 1));
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
            selectTime(timeOptions[activeIndex]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div
            ref={containerRef}
            className={`slds-combobox_container slds-dropdown-trigger slds-dropdown-trigger_click playground-input-popup-container ${open ? "slds-is-open playground-input-popup-container_open" : ""}`}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpen(false);
                }
            }}
        >
            <label className="slds-form-element__label slds-assistive-text" htmlFor={inputId}>{label}</label>
            <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click">
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
                        autoComplete="off"
                        value={value}
                        onChange={(event) => {
                            onChange(event.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                    />
                    <span className="slds-input__icon slds-input__icon_right slds-icon-text-default" aria-hidden="true">
                        <UtilityIcon className="slds-icon slds-icon_x-small" name="clock" />
                    </span>
                </div>
                {open && portalTarget ? createPortal(
                    <div ref={popupRef} style={popupStyle} className={`slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-5 playground-input-popup${popupClassName}`} id={listboxId} role="listbox" aria-label={label}>
                        {timeOptions.map((option, index) => (
                            <div
                                className={`slds-media slds-listbox__option slds-media_center slds-media_small slds-listbox__option_plain ${activeIndex === index ? "slds-has-focus" : ""}`}
                                id={`${listboxId}-option-${index}`}
                                key={option}
                                role="option"
                                aria-selected={value === option}
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    selectTime(option);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <span className="slds-media__body">
                                    <span title={option}>{option}</span>
                                </span>
                            </div>
                        ))}
                    </div>,
                    portalTarget
                ) : null}
            </div>
        </div>
    );
}
