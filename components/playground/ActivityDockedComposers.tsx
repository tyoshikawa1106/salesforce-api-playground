"use client";

import { type FormEvent, type ReactNode } from "react";
import type {
    ActivityLookupOption,
    ActivityLookupState,
    EventForm,
    EventFormErrors,
    RemoteLookupObjectLabel,
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

type ActivityLookupKey = keyof ActivityLookupOptions;

const lookupFieldLabels: Record<ActivityLookupKey, {
    label: string;
    objectLabel: RemoteLookupObjectLabel;
    placeholder: string;
}> = {
    assigned: {
        label: "割り当て先",
        objectLabel: "ユーザー",
        placeholder: "ユーザーを検索..."
    },
    name: {
        label: "名前",
        objectLabel: "取引先責任者",
        placeholder: "取引先責任者を検索..."
    },
    related: {
        label: "関連先",
        objectLabel: "取引先",
        placeholder: "取引先を検索..."
    }
};

function QuickActionFormRows({ children }: { children: ReactNode }) {
    return (
        <div className="slds-form-element__control">
            <div className="slds-form-element__group">
                {children}
            </div>
        </div>
    );
}

function QuickActionFormRow({ children }: { children: ReactNode }) {
    return (
        <div className="slds-form-element__row">
            {children}
        </div>
    );
}

function ActivityLookupRow({
    error,
    field,
    lookupOptions,
    lookups,
    required,
    onLookupChange
}: {
    error?: string;
    field: ActivityLookupKey;
    lookupOptions: ActivityLookupOptions;
    lookups: ActivityLookupState;
    required?: boolean;
    onLookupChange: (value: ActivityLookupState) => void;
}) {
    const labels = lookupFieldLabels[field];

    return (
        <QuickActionFormRow>
            <QuickActionLookup
                error={error}
                label={labels.label}
                objectLabel={labels.objectLabel}
                options={lookupOptions[field]}
                placeholder={labels.placeholder}
                required={required}
                value={lookups[field]}
                onChange={(value) => onLookupChange({ ...lookups, [field]: value })}
            />
        </QuickActionFormRow>
    );
}

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
            <QuickActionFormRows>
                <QuickActionFormRow>
                    <QuickActionSubjectCombobox
                        error={errors.Subject}
                        label="件名"
                        required
                        value={form.Subject}
                        onChange={(Subject) => onChange({ ...form, Subject })}
                    />
                </QuickActionFormRow>
                <QuickActionFormRow>
                    <QuickActionDateTimePicker
                        error={errors.StartDateTime}
                        label="開始"
                        required
                        idPrefix="event-start"
                        value={form.StartDateTime}
                        onChange={(StartDateTime) => onChange({ ...form, StartDateTime })}
                    />
                </QuickActionFormRow>
                <QuickActionFormRow>
                    <QuickActionDateTimePicker
                        error={errors.EndDateTime}
                        label="終了"
                        required
                        idPrefix="event-end"
                        value={form.EndDateTime}
                        onChange={(EndDateTime) => onChange({ ...form, EndDateTime })}
                    />
                </QuickActionFormRow>
                <ActivityLookupRow
                    field="name"
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    onLookupChange={onLookupChange}
                />
                <ActivityLookupRow
                    field="related"
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    onLookupChange={onLookupChange}
                />
                <ActivityLookupRow
                    error={errors.assignedUserName}
                    field="assigned"
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    required
                    onLookupChange={onLookupChange}
                />
                <QuickActionFormRow>
                    <QuickActionTextInput
                        label="場所"
                        value={form.Location}
                        onChange={(Location) => onChange({ ...form, Location })}
                    />
                </QuickActionFormRow>
                <QuickActionFormRow>
                    <QuickActionLongTextInput
                        label="説明"
                        value={form.Description}
                        onChange={(Description) => onChange({ ...form, Description })}
                    />
                </QuickActionFormRow>
            </QuickActionFormRows>
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
            <QuickActionFormRows>
                <QuickActionFormRow>
                    <QuickActionSubjectCombobox
                        error={errors.Subject}
                        label="件名"
                        required
                        value={form.Subject}
                        onChange={(Subject) => onChange({ ...form, Subject })}
                    />
                </QuickActionFormRow>
                {isCallLog ? null : (
                    <>
                        <QuickActionFormRow>
                            <div className="slds-form-element slds-size_1-of-1">
                                <QuickActionDatepicker
                                    label="期日"
                                    value={form.ActivityDate}
                                    onChange={(ActivityDate) => onChange({ ...form, ActivityDate })}
                                />
                            </div>
                        </QuickActionFormRow>
                        <ActivityLookupRow
                            field="name"
                            lookupOptions={lookupOptions}
                            lookups={lookups}
                            onLookupChange={onLookupChange}
                        />
                        <ActivityLookupRow
                            field="related"
                            lookupOptions={lookupOptions}
                            lookups={lookups}
                            onLookupChange={onLookupChange}
                        />
                    </>
                )}
                {isCallLog && lookups.assigned ? null : (
                    <ActivityLookupRow
                        error={errors.assignedUserName}
                        field="assigned"
                        lookupOptions={lookupOptions}
                        lookups={lookups}
                        required
                        onLookupChange={onLookupChange}
                    />
                )}
                {isCallLog ? null : (
                    <QuickActionFormRow>
                        <QuickActionSelect
                            error={errors.Status}
                            label="状況"
                            required
                            value={form.Status}
                            onChange={(Status) => onChange({ ...form, Status })}
                        />
                    </QuickActionFormRow>
                )}
                <QuickActionFormRow>
                    <QuickActionLongTextInput
                        label="説明"
                        value={form.Description}
                        onChange={(Description) => onChange({ ...form, Description })}
                    />
                </QuickActionFormRow>
            </QuickActionFormRows>
        </ActivityDockedComposerFrame>
    );
}
