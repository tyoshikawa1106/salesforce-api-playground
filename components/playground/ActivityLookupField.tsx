"use client";

import type {
    ActivityLookupOption,
    RemoteLookupObjectLabel
} from "./activity-task-form";
import { createPortal } from "react-dom";
import { QuickActionFieldShell } from "./ActivityFieldErrorsAndInputs";
import { getLookupIconMeta } from "./activity-lookup-icons";
import { StandardIcon, UtilityIcon } from "./SldsIcon";
import { useInputPopupPlacement } from "./useInputPopupPlacement";
import { useQuickActionLookupState } from "./useQuickActionLookupState";

export function QuickActionLookup({
    error,
    idPrefix,
    label,
    objectLabel,
    onChange,
    options,
    placeholder,
    required = false,
    value
}: {
    error?: string;
    idPrefix?: string;
    label: string;
    objectLabel: RemoteLookupObjectLabel;
    onChange: (value: ActivityLookupOption | undefined) => void;
    options: ActivityLookupOption[];
    placeholder: string;
    required?: boolean;
    value?: ActivityLookupOption;
}) {
    const {
        activeIndex,
        changeQuery,
        clearValue,
        filteredOptions,
        handleKeyDown,
        loadingOptions,
        open,
        query,
        remoteMessage,
        selectOption,
        setActiveIndex,
        setOpen
    } = useQuickActionLookupState({ objectLabel, onChange, options, value });
    const { iconClassName, iconName } = getLookupIconMeta(objectLabel);
    const defaultIdPrefix = objectLabel === "取引先" ? "task-related-account" : objectLabel === "取引先責任者" ? "task-name-contact" : "task-assigned-user";
    const listboxId = `${idPrefix ?? defaultIdPrefix}-listbox`;
    const inputId = `${listboxId}-input`;
    const errorId = error ? `${inputId}-error` : undefined;
    const activeOptionId = filteredOptions[activeIndex] ? `${listboxId}-option-${filteredOptions[activeIndex].id}` : undefined;
    const { containerRef, popupClassName, popupRef, popupStyle, portalTarget } = useInputPopupPlacement(open);

    return (
        <QuickActionFieldShell
            error={error}
            errorId={errorId}
            label={label}
            labelFor={inputId}
            required={required}
        >
            <div className="slds-form-element__control">
                {value ? (
                    <div className="slds-combobox_container slds-has-selection">
                        <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-controls={listboxId} aria-expanded="false" aria-haspopup="listbox" role="combobox">
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right" role="none">
                                <span className={`slds-icon_container ${iconClassName} slds-combobox__input-entity-icon`} title={objectLabel}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
                                    <span className="slds-assistive-text">{objectLabel}</span>
                                </span>
                                <input className="slds-input slds-combobox__input slds-combobox__input-value" id={inputId} type="text" role="textbox" readOnly aria-describedby={errorId} aria-invalid={Boolean(error)} value={value.label} />
                                <button className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" type="button" title={`${value.label} を削除`} onClick={clearValue}>
                                    <UtilityIcon className="slds-button__icon" name="close" />
                                    <span className="slds-assistive-text">{value.label} を削除</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="slds-combobox_container">
                        <div
                            ref={containerRef}
                            className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click playground-input-popup-container ${open ? "slds-is-open playground-input-popup-container_open" : ""}`}
                            aria-controls={listboxId}
                            aria-expanded={open}
                            aria-haspopup="listbox"
                            role="combobox"
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) {
                                    setOpen(false);
                                }
                            }}
                        >
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right" role="none">
                                <span className={`slds-icon_container ${iconClassName} slds-combobox__input-entity-icon`} title={objectLabel}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
                                    <span className="slds-assistive-text">{objectLabel}</span>
                                </span>
                                <input
                                    className="slds-input slds-combobox__input playground-task-lookup__input"
                                    id={inputId}
                                    type="text"
                                    role="combobox"
                                    aria-activedescendant={open ? activeOptionId : undefined}
                                    aria-autocomplete="list"
                                    aria-describedby={errorId}
                                    aria-controls={listboxId}
                                    aria-expanded={open}
                                    aria-haspopup="listbox"
                                    placeholder={placeholder}
                                    autoComplete="off"
                                    aria-invalid={Boolean(error)}
                                    value={query}
                                    onChange={(event) => changeQuery(event.target.value)}
                                    onClick={() => setOpen(true)}
                                    onFocus={() => setOpen(true)}
                                    onKeyDown={handleKeyDown}
                                />
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default" name="search" />
                            </div>
                            {open && portalTarget ? createPortal(
                                <div ref={popupRef} style={popupStyle} className={`slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-with-icon-7 playground-input-popup${popupClassName}`} id={listboxId} role="listbox" aria-label={label}>
                                    <ul className="slds-listbox slds-listbox_vertical" role="presentation">
                                        {loadingOptions ? (
                                            <li className="slds-listbox__item" role="presentation">
                                                <div className="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option" aria-disabled="true" aria-selected="false">
                                                    <span className="slds-media__body slds-text-align_center slds-is-relative slds-p-vertical_small">
                                                        <span className="slds-spinner slds-spinner_small slds-spinner_brand" role="status">
                                                            <span className="slds-assistive-text">候補を読み込んでいます...</span>
                                                            <span className="slds-spinner__dot-a" />
                                                            <span className="slds-spinner__dot-b" />
                                                        </span>
                                                    </span>
                                                </div>
                                            </li>
                                        ) : null}
                                        {!loadingOptions && filteredOptions.length > 0 ? filteredOptions.map((option, index) => {
                                            const optionIcon = getLookupIconMeta(option.objectLabel);

                                            return (
                                                <li className="slds-listbox__item" key={`${option.objectLabel}-${option.id}`} role="presentation">
                                                    <div
                                                        className={`slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta ${
                                                            index === activeIndex ? "slds-has-focus" : ""
                                                        }`}
                                                        id={`${listboxId}-option-${option.id}`}
                                                        role="option"
                                                        aria-selected={index === activeIndex}
                                                        onPointerDown={(event) => {
                                                            event.preventDefault();
                                                            selectOption(option);
                                                        }}
                                                        onMouseEnter={() => setActiveIndex(index)}
                                                    >
                                                        <span className="slds-media__figure slds-listbox__option-icon">
                                                            <span className={`slds-icon_container ${optionIcon.iconClassName}`} title={option.objectLabel}>
                                                                <StandardIcon className="slds-icon slds-icon_small" name={optionIcon.iconName} />
                                                                <span className="slds-assistive-text">{option.objectLabel}</span>
                                                            </span>
                                                        </span>
                                                        <span className="slds-media__body">
                                                            <span className="slds-listbox__option-text slds-listbox__option-text_entity">{option.label}</span>
                                                            {option.meta ? <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">{option.meta}</span> : null}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        }) : null}
                                        {!loadingOptions && filteredOptions.length === 0 ? (
                                            <li className="slds-listbox__item" role="presentation">
                                                <div className="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option" aria-disabled="true" aria-selected="false">
                                                    <span className="slds-media__body">
                                                        <span className="slds-listbox__option-text">{remoteMessage || "一致する候補はありません。"}</span>
                                                    </span>
                                                </div>
                                            </li>
                                        ) : null}
                                    </ul>
                                </div>,
                                portalTarget
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </QuickActionFieldShell>
    );
}
