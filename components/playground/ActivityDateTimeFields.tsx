"use client";

import {
    buildDateTimeInputValue,
    getDateTimeDateValue,
    getDateTimeTimeValue,
    normalizeTimeInputValue
} from "./activity-task-form";
import { FieldError } from "./ActivityFieldErrorsAndInputs";
import { QuickActionDatepicker } from "./ActivityDatepicker";
import { QuickActionTimepicker } from "./ActivityTimepicker";

export { QuickActionDatepicker } from "./ActivityDatepicker";

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
        <fieldset className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`} aria-invalid={Boolean(error)}>
            <legend className="slds-form-element__label">
                {required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}
            </legend>
            <div className="slds-form-element__control">
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
            </div>
            <FieldError message={error} />
        </fieldset>
    );
}
