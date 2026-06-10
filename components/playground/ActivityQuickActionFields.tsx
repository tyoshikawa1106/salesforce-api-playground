"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import { apiRequest } from "./api";
import {
    buildCalendarWeeks,
    buildDateTimeInputValue,
    buildDateValue,
    formatDateInputValue,
    getCalendarBaseDate,
    getDateTimeDateValue,
    getDateTimeTimeValue,
    getEventFormErrorLabels,
    getLookupApiObject,
    getLookupObjectLabel,
    getTaskFormErrorLabels,
    normalizeDateInputValue,
    normalizeTimeInputValue,
    taskSubjectOptions,
    timeOptions,
    weekDayLabels,
    type ActivityLookupApiResponse,
    type ActivityLookupOption,
    type EventFormErrors,
    type LookupObjectLabel,
    type RemoteLookupObjectLabel,
    type TaskFormErrors
} from "./activity-task-form";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

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

export function QuickActionDateTimePicker({
    error,
    idPrefix,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    idPrefix: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    const dateValue = getDateTimeDateValue(value);
    const timeValue = getDateTimeTimeValue(value);

    function changeDate(nextDate: string) {
        onChange(buildDateTimeInputValue(nextDate, timeValue));
    }

    function changeTime(nextTime: string) {
        const normalizedTime = normalizeTimeInputValue(nextTime);
        onChange(buildDateTimeInputValue(dateValue, normalizedTime || nextTime));
    }

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <fieldset className="slds-form-element__control" aria-invalid={Boolean(error)}>
                <legend className="slds-form-element__label">
                    {required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}
                </legend>
                <div className="slds-grid slds-gutters_x-small">
                    <div className="slds-col slds-size_2-of-3">
                        <QuickActionDatepicker
                            hideLabel
                            idPrefix={`${idPrefix}-date`}
                            label={`${label}日`}
                            value={dateValue}
                            onChange={changeDate}
                        />
                    </div>
                    <div className="slds-col slds-size_1-of-3">
                        <QuickActionTimepicker
                            idPrefix={`${idPrefix}-time`}
                            label={`${label}時刻`}
                            value={timeValue}
                            onChange={changeTime}
                        />
                    </div>
                </div>
                <FieldError message={error} />
            </fieldset>
        </div>
    );
}

function QuickActionTimepicker({
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
            className={`slds-combobox_container slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}
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
                {open ? (
                    <div className="slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-5" id={listboxId} role="listbox" aria-label={label}>
                        {timeOptions.map((option, index) => (
                            <div
                                className={`slds-media slds-listbox__option slds-media_center slds-media_small slds-listbox__option_plain ${activeIndex === index ? "slds-has-focus" : ""}`}
                                id={`${listboxId}-option-${index}`}
                                key={option}
                                role="option"
                                aria-selected={value === option}
                                onMouseDown={(event) => {
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
                    </div>
                ) : null}
            </div>
        </div>
    );
}

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

export function QuickActionDatepicker({
    hideLabel = false,
    idPrefix = "task-activity-date",
    label,
    onChange,
    value
}: {
    hideLabel?: boolean;
    idPrefix?: string;
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    const initialDate = getCalendarBaseDate(value);
    const [open, setOpen] = useState(false);
    const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
    const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
    const inputId = `${idPrefix}-input`;
    const formatHelpId = `${idPrefix}-format`;
    const calendarId = `${idPrefix}-calendar`;
    const yearId = `${idPrefix}-year`;
    const selectedValue = normalizeDateInputValue(value);
    const todayValue = buildDateValue(new Date());
    const displayDate = new Date(displayYear, displayMonth, 1);
    const yearOptions = Array.from({ length: 201 }, (_, index) => new Date().getFullYear() - 100 + index);

    function setVisibleMonth(nextDate: Date) {
        setDisplayYear(nextDate.getFullYear());
        setDisplayMonth(nextDate.getMonth());
    }

    function selectDate(nextDate: Date) {
        onChange(buildDateValue(nextDate));
        setVisibleMonth(nextDate);
        setOpen(false);
    }

    function handleInputChange(nextValue: string) {
        const normalized = normalizeDateInputValue(nextValue);
        onChange(normalized || nextValue);

        if (normalized) {
            setVisibleMonth(getCalendarBaseDate(normalized));
        }
    }

    return (
        <>
            <label className={`slds-form-element__label ${hideLabel ? "slds-assistive-text" : ""}`} htmlFor={inputId}>{label}</label>
            <div className="slds-form-element__control">
                <div
                    className={`slds-dropdown-trigger slds-dropdown-trigger_click slds-size_1-of-1 ${open ? "slds-is-open" : ""}`}
                    role="group"
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                            setOpen(false);
                        }
                    }}
                >
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_right">
                        <input
                            className="slds-input"
                            id={inputId}
                            type="text"
                            autoComplete="off"
                            aria-describedby={formatHelpId}
                            value={formatDateInputValue(value)}
                            onBlur={() => {
                                const normalized = normalizeDateInputValue(value);
                                if (normalized) {
                                    onChange(normalized);
                                }
                            }}
                            onChange={(event) => handleInputChange(event.target.value)}
                            onFocus={() => setOpen(true)}
                        />
                        <span className="slds-input__icon slds-input__icon_right slds-icon-text-default" aria-hidden="true">
                            <UtilityIcon className="slds-icon slds-icon_x-small" name="event" />
                        </span>
                    </div>
                    {open ? (
                        <div className="slds-datepicker slds-dropdown slds-dropdown_left playground-task-datepicker" id={calendarId} aria-hidden="false" aria-label={`日付ピッカー: ${displayMonth + 1}月`} role="dialog" tabIndex={-1}>
                            <div className="slds-datepicker__filter slds-grid">
                                <div className="slds-datepicker__filter_month slds-grid slds-grid_align-spread slds-grow">
                                    <div className="slds-align-middle">
                                        <button className="slds-button slds-button_icon slds-button_icon-container" type="button" title="先月" onMouseDown={(event) => event.preventDefault()} onClick={() => setVisibleMonth(new Date(displayYear, displayMonth - 1, 1))}>
                                            <UtilityIcon className="slds-button__icon" name="left" />
                                            <span className="slds-assistive-text">先月</span>
                                        </button>
                                    </div>
                                    <h2 className="slds-align-middle" aria-live="polite">{displayMonth + 1}月</h2>
                                    <div className="slds-align-middle">
                                        <button className="slds-button slds-button_icon slds-button_icon-container" type="button" title="来月" onMouseDown={(event) => event.preventDefault()} onClick={() => setVisibleMonth(new Date(displayYear, displayMonth + 1, 1))}>
                                            <UtilityIcon className="slds-button__icon" name="right" />
                                            <span className="slds-assistive-text">来月</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="slds-shrink-none">
                                    <label className="slds-form-element__label slds-assistive-text" htmlFor={yearId}>年の取得</label>
                                    <div className="slds-select_container">
                                        <select className="slds-select playground-task-datepicker__year" id={yearId} value={displayYear} onChange={(event) => setDisplayYear(Number(event.target.value))}>
                                            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <table className="slds-datepicker__month" role="grid">
                                <thead>
                                    <tr>
                                        {weekDayLabels.map((dayLabel) => (
                                            <th key={dayLabel} scope="col">
                                                <abbr title={`${dayLabel}曜日`}>{dayLabel}</abbr>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {buildCalendarWeeks(displayDate).map((week) => (
                                        <tr key={week.map(buildDateValue).join("-")}>
                                            {week.map((date) => {
                                                const dateValue = buildDateValue(date);
                                                const selected = selectedValue === dateValue;
                                                const today = todayValue === dateValue;
                                                const adjacentMonth = date.getMonth() !== displayMonth;
                                                const classNames = [
                                                    adjacentMonth ? "slds-day_adjacent-month" : "",
                                                    selected ? "slds-is-selected" : "",
                                                    today ? "slds-is-today" : ""
                                                ].filter(Boolean).join(" ");

                                                return (
                                                    <td className={classNames || undefined} key={dateValue} role="gridcell" aria-current={today ? "date" : "false"} aria-label={dateValue} aria-selected={selected} data-value={dateValue}>
                                                        <span className="slds-day" role="button" tabIndex={selected ? 0 : -1} onMouseDown={(event) => event.preventDefault()} onClick={() => selectDate(date)}>{date.getDate()}</span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="slds-button slds-align_absolute-center slds-text-link" name="today" type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectDate(new Date())}>今日</button>
                        </div>
                    ) : null}
                </div>
                <div className="slds-form-element__help slds-assistive-text" id={formatHelpId}>形式: 2024/12/31</div>
            </div>
        </>
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

function FieldError({ message }: { message?: string }) {
    return message ? <div className="slds-form-element__help">{message}</div> : null;
}
