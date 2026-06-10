"use client";

import { type FormEvent } from "react";
import type {
    ActivityLookupOption,
    ActivityLookupState,
    EventForm,
    EventFormErrors,
    TaskForm,
    TaskFormErrors
} from "./activity-task-form";
import {
    EventFormErrorSummary,
    QuickActionDatepicker,
    QuickActionDateTimePicker,
    QuickActionLongTextInput,
    QuickActionLookup,
    QuickActionSelect,
    QuickActionSubjectCombobox,
    QuickActionTextInput,
    TaskFormErrorSummary
} from "./ActivityQuickActionFields";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

type ActivityLookupOptions = {
    assigned: ActivityLookupOption[];
    name: ActivityLookupOption[];
    related: ActivityLookupOption[];
};

export function EventDockedComposer({
    errors,
    expanded,
    form,
    lookupOptions,
    lookups,
    minimized,
    saving,
    onCancel,
    onChange,
    onLookupChange,
    onSubmit,
    onToggleExpanded,
    onToggleMinimized
}: {
    errors: EventFormErrors;
    expanded: boolean;
    form: EventForm;
    lookupOptions: ActivityLookupOptions;
    lookups: ActivityLookupState;
    minimized: boolean;
    saving: boolean;
    onCancel: () => void;
    onChange: (value: EventForm) => void;
    onLookupChange: (value: ActivityLookupState) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleExpanded: () => void;
    onToggleMinimized: () => void;
}) {
    const composerStateClass = minimized ? "slds-is-closed" : "slds-is-open";
    const minimizeTitle = minimized ? "復元" : "最小化";
    const expandTitle = expanded ? "復元" : "最大化";
    const composer = (
        <form
            className={`slds-docked-composer slds-grid slds-grid_vertical ${composerStateClass} playground-task-composer ${
                expanded ? "playground-task-composer_expanded" : ""
            }`}
            onSubmit={onSubmit}
            noValidate
            role="dialog"
            aria-labelledby="new-event-composer-title"
            aria-describedby="new-event-composer-body"
        >
            <header className="slds-docked-composer__header slds-grid slds-shrink-none" aria-live="assertive">
                <div className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure slds-m-right_x-small">
                        <span className="slds-icon_container" title="行動">
                            <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name="event" />
                            <span className="slds-assistive-text">行動</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-truncate" id="new-event-composer-title" title="新規行動">新規行動</h2>
                    </div>
                </div>
                <div className="slds-col_bump-left slds-shrink-none">
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-p-around_xx-small" type="button" title={minimizeTitle} onClick={onToggleMinimized}>
                        <UtilityIcon className="slds-button__icon" name="minimize_window" />
                        <span className="slds-assistive-text">{minimizeTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title={expandTitle} onClick={onToggleExpanded}>
                        <UtilityIcon className="slds-button__icon" name={expanded ? "contract_alt" : "expand_alt"} />
                        <span className="slds-assistive-text">{expandTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title="閉じる" onClick={onCancel}>
                        <UtilityIcon className="slds-button__icon" name="close" />
                        <span className="slds-assistive-text">閉じる</span>
                    </button>
                </div>
            </header>
            <fieldset className="slds-docked-composer__body slds-docked-composer__body_form slds-form_compound slds-grow slds-shrink slds-scrollable_y playground-task-composer__body" id="new-event-composer-body">
                <legend className="slds-assistive-text">新規行動</legend>
                <EventFormErrorSummary errors={errors} />
                <div className="slds-form-element__control">
                    <div className="slds-form-element__group">
                        <div className="slds-form-element__row">
                            <QuickActionSubjectCombobox
                                error={errors.Subject}
                                label="件名"
                                required
                                value={form.Subject}
                                onChange={(Subject) => onChange({ ...form, Subject })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionDateTimePicker
                                error={errors.StartDateTime}
                                label="開始"
                                required
                                idPrefix="event-start"
                                value={form.StartDateTime}
                                onChange={(StartDateTime) => onChange({ ...form, StartDateTime })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionDateTimePicker
                                error={errors.EndDateTime}
                                label="終了"
                                required
                                idPrefix="event-end"
                                value={form.EndDateTime}
                                onChange={(EndDateTime) => onChange({ ...form, EndDateTime })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLookup
                                label="名前"
                                objectLabel="取引先責任者"
                                options={lookupOptions.name}
                                placeholder="取引先責任者を検索..."
                                value={lookups.name}
                                onChange={(name) => onLookupChange({ ...lookups, name })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLookup
                                label="関連先"
                                objectLabel="取引先"
                                options={lookupOptions.related}
                                placeholder="取引先を検索..."
                                value={lookups.related}
                                onChange={(related) => onLookupChange({ ...lookups, related })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLookup
                                error={errors.assignedUserName}
                                label="割り当て先"
                                objectLabel="ユーザー"
                                options={lookupOptions.assigned}
                                placeholder="ユーザーを検索..."
                                required
                                value={lookups.assigned}
                                onChange={(assigned) => onLookupChange({ ...lookups, assigned })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionTextInput
                                label="場所"
                                value={form.Location}
                                onChange={(Location) => onChange({ ...form, Location })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLongTextInput
                                label="説明"
                                value={form.Description}
                                onChange={(Description) => onChange({ ...form, Description })}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
            <footer className="slds-docked-composer__footer slds-shrink-none slds-grid_align-end">
                <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
                    保存
                </button>
            </footer>
        </form>
    );

    if (expanded) {
        return (
            <>
                <div className="slds-backdrop slds-backdrop_open playground-task-composer-backdrop" />
                <div className="playground-task-composer-modal">
                    {composer}
                </div>
            </>
        );
    }

    return (
        <div className="slds-docked_container playground-activity-docked-container">
            {composer}
        </div>
    );
}

export function TaskDockedComposer({
    errors,
    expanded,
    form,
    lookupOptions,
    lookups,
    minimized,
    saving,
    variant = "task",
    onCancel,
    onChange,
    onLookupChange,
    onSubmit,
    onToggleExpanded,
    onToggleMinimized
}: {
    errors: TaskFormErrors;
    expanded: boolean;
    form: TaskForm;
    lookupOptions: ActivityLookupOptions;
    lookups: ActivityLookupState;
    minimized: boolean;
    saving: boolean;
    variant?: "call" | "task";
    onCancel: () => void;
    onChange: (value: TaskForm) => void;
    onLookupChange: (value: ActivityLookupState) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleExpanded: () => void;
    onToggleMinimized: () => void;
}) {
    const composerStateClass = minimized ? "slds-is-closed" : "slds-is-open";
    const minimizeTitle = minimized ? "復元" : "最小化";
    const expandTitle = expanded ? "復元" : "最大化";
    const isCallLog = variant === "call";
    const composerTitle = isCallLog ? "電話を記録" : "新規ToDo";
    const composer = (
        <form
            className={`slds-docked-composer slds-grid slds-grid_vertical ${composerStateClass} playground-task-composer ${
                expanded ? "playground-task-composer_expanded" : ""
            }`}
            onSubmit={onSubmit}
            noValidate
            role="dialog"
            aria-labelledby="new-task-composer-title"
            aria-describedby="new-task-composer-body"
        >
            <header className="slds-docked-composer__header slds-grid slds-shrink-none" aria-live="assertive">
                <div className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure slds-m-right_x-small">
                        <span className="slds-icon_container" title={composerTitle}>
                            <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name="task" />
                            <span className="slds-assistive-text">{composerTitle}</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-truncate" id="new-task-composer-title" title={composerTitle}>{composerTitle}</h2>
                    </div>
                </div>
                <div className="slds-col_bump-left slds-shrink-none">
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-p-around_xx-small" type="button" title={minimizeTitle} onClick={onToggleMinimized}>
                        <UtilityIcon className="slds-button__icon" name="minimize_window" />
                        <span className="slds-assistive-text">{minimizeTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title={expandTitle} onClick={onToggleExpanded}>
                        <UtilityIcon className="slds-button__icon" name={expanded ? "contract_alt" : "expand_alt"} />
                        <span className="slds-assistive-text">{expandTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title="閉じる" onClick={onCancel}>
                        <UtilityIcon className="slds-button__icon" name="close" />
                        <span className="slds-assistive-text">閉じる</span>
                    </button>
                </div>
            </header>
            <fieldset className="slds-docked-composer__body slds-docked-composer__body_form slds-form_compound slds-grow slds-shrink slds-scrollable_y playground-task-composer__body" id="new-task-composer-body">
                <legend className="slds-assistive-text">{composerTitle}</legend>
                <TaskFormErrorSummary errors={errors} />
                <div className="slds-form-element__control">
                    <div className="slds-form-element__group">
                        <div className="slds-form-element__row">
                            <QuickActionSubjectCombobox
                                error={errors.Subject}
                                label="件名"
                                required
                                value={form.Subject}
                                onChange={(Subject) => onChange({ ...form, Subject })}
                            />
                        </div>
                        {isCallLog ? null : (
                            <>
                                <div className="slds-form-element__row">
                                    <div className="slds-form-element slds-size_1-of-1">
                                        <QuickActionDatepicker
                                            label="期日"
                                            value={form.ActivityDate}
                                            onChange={(ActivityDate) => onChange({ ...form, ActivityDate })}
                                        />
                                    </div>
                                </div>
                                <div className="slds-form-element__row">
                                    <QuickActionLookup
                                        label="名前"
                                        objectLabel="取引先責任者"
                                        options={lookupOptions.name}
                                        placeholder="取引先責任者を検索..."
                                        value={lookups.name}
                                        onChange={(name) => onLookupChange({ ...lookups, name })}
                                    />
                                </div>
                                <div className="slds-form-element__row">
                                    <QuickActionLookup
                                        label="関連先"
                                        objectLabel="取引先"
                                        options={lookupOptions.related}
                                        placeholder="取引先を検索..."
                                        value={lookups.related}
                                        onChange={(related) => onLookupChange({ ...lookups, related })}
                                    />
                                </div>
                            </>
                        )}
                        {isCallLog && lookups.assigned ? null : (
                            <div className="slds-form-element__row">
                                <QuickActionLookup
                                    error={errors.assignedUserName}
                                    label="割り当て先"
                                    objectLabel="ユーザー"
                                    options={lookupOptions.assigned}
                                    placeholder="ユーザーを検索..."
                                    required
                                    value={lookups.assigned}
                                    onChange={(assigned) => onLookupChange({ ...lookups, assigned })}
                                />
                            </div>
                        )}
                        {isCallLog ? null : (
                            <div className="slds-form-element__row">
                                <QuickActionSelect
                                    error={errors.Status}
                                    label="状況"
                                    required
                                    value={form.Status}
                                    onChange={(Status) => onChange({ ...form, Status })}
                                />
                            </div>
                        )}
                        <div className="slds-form-element__row">
                            <QuickActionLongTextInput
                                label="説明"
                                value={form.Description}
                                onChange={(Description) => onChange({ ...form, Description })}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
            <footer className="slds-docked-composer__footer slds-shrink-none slds-grid_align-end">
                <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
                    保存
                </button>
            </footer>
        </form>
    );

    if (expanded) {
        return (
            <>
                <div className="slds-backdrop slds-backdrop_open playground-task-composer-backdrop" />
                <div className="playground-task-composer-modal">
                    {composer}
                </div>
            </>
        );
    }

    return (
        <div className="slds-docked_container playground-activity-docked-container">
            {composer}
        </div>
    );
}
