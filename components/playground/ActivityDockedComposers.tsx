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
import { ActivityDockedComposerFrame } from "./ActivityDockedComposerFrame";

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
    return (
        <ActivityDockedComposerFrame
            bodyId="new-event-composer-body"
            expanded={expanded}
            iconName="event"
            minimized={minimized}
            saving={saving}
            title="新規行動"
            titleId="new-event-composer-title"
            onCancel={onCancel}
            onSubmit={onSubmit}
            onToggleExpanded={onToggleExpanded}
            onToggleMinimized={onToggleMinimized}
        >
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
        </ActivityDockedComposerFrame>
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
    const isCallLog = variant === "call";
    const composerTitle = isCallLog ? "電話を記録" : "新規ToDo";

    return (
        <ActivityDockedComposerFrame
            bodyId="new-task-composer-body"
            expanded={expanded}
            iconName="task"
            minimized={minimized}
            saving={saving}
            title={composerTitle}
            titleId="new-task-composer-title"
            onCancel={onCancel}
            onSubmit={onSubmit}
            onToggleExpanded={onToggleExpanded}
            onToggleMinimized={onToggleMinimized}
        >
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
        </ActivityDockedComposerFrame>
    );
}
