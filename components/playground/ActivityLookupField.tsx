"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import { apiRequest } from "./api";
import {
    getLookupApiObject,
    getLookupObjectLabel,
    type ActivityLookupApiResponse,
    type ActivityLookupOption,
    type LookupObjectLabel,
    type RemoteLookupObjectLabel
} from "./activity-task-form";
import { FieldError } from "./ActivityFieldErrorsAndInputs";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

export function QuickActionLookup({
    error,
    label,
    objectLabel,
    onChange,
    options,
    placeholder,
    required = false,
    value
}: {
    error?: string;
    label: string;
    objectLabel: RemoteLookupObjectLabel;
    onChange: (value: ActivityLookupOption | undefined) => void;
    options: ActivityLookupOption[];
    placeholder: string;
    required?: boolean;
    value?: ActivityLookupOption;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [remoteMessage, setRemoteMessage] = useState("");
    const [remoteOptions, setRemoteOptions] = useState<ActivityLookupOption[] | null>(null);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const requestIdRef = useRef(0);
    const lookupObject = getLookupApiObject(objectLabel);
    const { iconClassName, iconName } = getLookupIconMeta(objectLabel);
    const availableOptions = remoteOptions ?? options;
    const filteredOptions = availableOptions.filter((option) => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return true;
        }

        return [option.label, option.meta].some((text) => text?.toLowerCase().includes(normalizedQuery));
    });
    const listboxId = objectLabel === "取引先" ? "task-related-account-listbox" : objectLabel === "取引先責任者" ? "task-name-contact-listbox" : "task-assigned-user-listbox";
    const inputId = `${listboxId}-input`;
    const activeOptionId = filteredOptions[activeIndex] ? `${listboxId}-option-${filteredOptions[activeIndex].id}` : undefined;

    useEffect(() => {
        if (!open || value) {
            return;
        }

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoadingOptions(true);
        setRemoteMessage("");

        const timeoutId = window.setTimeout(() => {
            apiRequest<ActivityLookupApiResponse>(
                buildPlaygroundApiRequest(playgroundApiPaths.activityLookups(lookupObject, query))
            )
                .then((data) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions(data.options.map((option) => ({
                        id: option.id,
                        label: option.label,
                        meta: option.meta,
                        objectLabel: getLookupObjectLabel(option.object)
                    })));
                })
                .catch((error) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions([]);
                    setRemoteMessage(error instanceof Error ? error.message : "候補を取得できませんでした。");
                })
                .finally(() => {
                    if (requestIdRef.current === requestId) {
                        setLoadingOptions(false);
                    }
                });
        }, query.trim() ? 250 : 0);

        return () => window.clearTimeout(timeoutId);
    }, [lookupObject, open, query, value]);

    useEffect(() => {
        setActiveIndex((current) => Math.min(current, Math.max(filteredOptions.length - 1, 0)));
    }, [filteredOptions.length]);

    function selectOption(option: ActivityLookupOption) {
        onChange(option);
        setQuery("");
        setOpen(false);
    }

    function clearValue() {
        onChange(undefined);
        setQuery("");
        setActiveIndex(0);
        setRemoteOptions(null);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open && filteredOptions[activeIndex]) {
            event.preventDefault();
            selectOption(filteredOptions[activeIndex]);
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
                {value ? (
                    <div className="slds-combobox_container slds-has-selection">
                        <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-controls={listboxId} aria-expanded="false" aria-haspopup="listbox" role="combobox">
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right" role="none">
                                <span className={`slds-icon_container ${iconClassName} slds-combobox__input-entity-icon`} title={objectLabel}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
                                    <span className="slds-assistive-text">{objectLabel}</span>
                                </span>
                                <input className="slds-input slds-combobox__input slds-combobox__input-value" id={inputId} type="text" role="textbox" readOnly aria-invalid={Boolean(error)} value={value.label} />
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
                            className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}
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
                                    aria-controls={listboxId}
                                    aria-expanded={open}
                                    aria-haspopup="listbox"
                                    placeholder={placeholder}
                                    autoComplete="off"
                                    aria-invalid={Boolean(error)}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setActiveIndex(0);
                                        setOpen(true);
                                    }}
                                    onClick={() => setOpen(true)}
                                    onFocus={() => setOpen(true)}
                                    onKeyDown={handleKeyDown}
                                />
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default" name="search" />
                            </div>
                            {open ? (
                                <div className="slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-with-icon-7" id={listboxId} role="listbox" aria-label={label}>
                                    <ul className="slds-listbox slds-listbox_vertical" role="presentation">
                                        {loadingOptions ? (
                                            <li className="slds-listbox__item" role="presentation">
                                                <div className="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option" aria-disabled="true" aria-selected="false">
                                                    <span className="slds-media__body">
                                                        <span className="slds-listbox__option-text">候補を読み込んでいます...</span>
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
                                                        onMouseDown={(event) => {
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
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
                <FieldError message={error} />
            </div>
        </div>
    );
}

function getLookupIconMeta(objectLabel: LookupObjectLabel) {
    if (objectLabel === "取引先") {
        return { iconClassName: "slds-icon-standard-account", iconName: "account" as const };
    }

    if (objectLabel === "ケース") {
        return { iconClassName: "slds-icon-standard-case", iconName: "account" as const };
    }

    if (objectLabel === "商談") {
        return { iconClassName: "slds-icon-standard-opportunity", iconName: "account" as const };
    }

    if (objectLabel === "リード") {
        return { iconClassName: "slds-icon-standard-lead", iconName: "contact" as const };
    }

    if (objectLabel === "取引先責任者") {
        return { iconClassName: "slds-icon-standard-contact", iconName: "contact" as const };
    }

    if (objectLabel === "ユーザー") {
        return { iconClassName: "slds-icon-standard-user", iconName: "user" as const };
    }

    return { iconClassName: "slds-icon-standard-record", iconName: "account" as const };
}
