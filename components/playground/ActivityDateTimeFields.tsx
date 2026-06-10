"use client";

import { type KeyboardEvent, useState } from "react";
import {
    buildCalendarWeeks,
    buildDateTimeInputValue,
    buildDateValue,
    formatDateInputValue,
    getCalendarBaseDate,
    getDateTimeDateValue,
    getDateTimeTimeValue,
    normalizeDateInputValue,
    normalizeTimeInputValue,
    timeOptions,
    weekDayLabels
} from "./activity-task-form";
import { FieldError } from "./ActivityFieldErrorsAndInputs";
import { UtilityIcon } from "./SldsIcon";

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
