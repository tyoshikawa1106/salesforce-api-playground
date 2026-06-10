"use client";

import { type CSSProperties, type FormEvent, useState } from "react";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import type {
    ActivityLookupOption,
    ActivityLookupState,
    ActivityRecordContext,
    EventForm,
    EventFormErrors,
    TaskForm,
    TaskFormErrors
} from "./activity-task-form";
import {
    ActivityTimeline,
    groupActivityTimelineSections,
    type TaskStatusOverride
} from "./ActivityTimeline";
import { EventDockedComposer, TaskDockedComposer } from "./ActivityDockedComposers";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

export type ActivityComposerKind = "call" | "event" | "task";

type ActivityComposerAction = {
    icon: "event" | "task";
    iconStyle: CSSProperties;
    label: string;
    onClick: () => void;
    value: string;
};

export function ActivityPanel({
    activeComposer,
    activities,
    composerExpanded,
    composerMinimized,
    context,
    eventForm,
    eventFormErrors,
    lookupOptions,
    lookups,
    loading,
    message,
    saving,
    taskStatusOverrides,
    taskForm,
    taskFormErrors,
    onCloseComposer,
    onEventFormChange,
    onLookupChange,
    onOpenEventComposer,
    onOpenCallComposer,
    onOpenTaskComposer,
    onRefresh,
    onSaveEvent,
    onSaveTask,
    onTaskFormChange,
    onToggleTaskCompleted,
    onDeleteActivity,
    onEditActivity,
    onOpenActivity,
    onToggleComposerExpanded,
    onToggleComposerMinimized
}: {
    activeComposer: ActivityComposerKind | null;
    activities: ActivityTimelineItem[];
    composerExpanded: boolean;
    composerMinimized: boolean;
    context: ActivityRecordContext;
    eventForm: EventForm;
    eventFormErrors: EventFormErrors;
    lookupOptions: {
        assigned: ActivityLookupOption[];
        name: ActivityLookupOption[];
        related: ActivityLookupOption[];
    };
    lookups: ActivityLookupState;
    loading: boolean;
    message: string;
    saving: boolean;
    taskStatusOverrides: Record<string, TaskStatusOverride>;
    taskForm: TaskForm;
    taskFormErrors: TaskFormErrors;
    onCloseComposer: () => void;
    onEventFormChange: (value: EventForm) => void;
    onLookupChange: (value: ActivityLookupState) => void;
    onOpenEventComposer: () => void;
    onOpenCallComposer: () => void;
    onOpenTaskComposer: () => void;
    onRefresh: () => void;
    onSaveEvent: (event: FormEvent<HTMLFormElement>) => void;
    onSaveTask: (event: FormEvent<HTMLFormElement>) => void;
    onTaskFormChange: (value: TaskForm) => void;
    onToggleTaskCompleted: (activity: Extract<ActivityTimelineItem, { type: "task" }>) => void;
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    onToggleComposerExpanded: () => void;
    onToggleComposerMinimized: () => void;
}) {
    const timelineSections = groupActivityTimelineSections(activities, taskStatusOverrides);
    const [expandedSectionKeys, setExpandedSectionKeys] = useState<Set<string>>(() => new Set());
    const [openActionActivityId, setOpenActionActivityId] = useState<string | null>(null);
    const allSectionsExpanded = timelineSections.length > 0
        && timelineSections.every((section) => expandedSectionKeys.has(section.key));

    function toggleAllTimelineSections() {
        setExpandedSectionKeys(allSectionsExpanded
            ? new Set()
            : new Set(timelineSections.map((section) => section.key)));
    }

    function toggleTimelineSection(key: string) {
        setExpandedSectionKeys((current) => {
            const next = new Set(current);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }

    return (
        <div className="playground-activity-panel">
            <ActivityComposerBar onOpenCall={onOpenCallComposer} onOpenEvent={onOpenEventComposer} onOpenTask={onOpenTaskComposer} />
            <ActivityTimelineToolbar
                allSectionsExpanded={allSectionsExpanded}
                loading={loading}
                sectionCount={timelineSections.length}
                onRefresh={onRefresh}
                onToggleAllSections={toggleAllTimelineSections}
            />
            {message ? <p className="slds-text-color_weak slds-m-bottom_x-small">{message}</p> : null}
            {loading ? (
                <p className="slds-text-color_weak slds-p-around_medium">活動を読み込んでいます...</p>
            ) : (
                <ActivityTimeline
                    context={context}
                    expandedSectionKeys={expandedSectionKeys}
                    sections={timelineSections}
                    taskStatusOverrides={taskStatusOverrides}
                    openActionActivityId={openActionActivityId}
                    onCloseActionMenu={() => setOpenActionActivityId(null)}
                    onDeleteActivity={onDeleteActivity}
                    onEditActivity={onEditActivity}
                    onToggleSection={toggleTimelineSection}
                    onToggleTaskCompleted={onToggleTaskCompleted}
                    onOpenActivity={onOpenActivity}
                    onToggleActionMenu={(activityId) =>
                        setOpenActionActivityId((currentActivityId) => (currentActivityId === activityId ? null : activityId))
                    }
                />
            )}
            {activeComposer === "task" ? (
                <TaskDockedComposer
                    errors={taskFormErrors}
                    expanded={composerExpanded}
                    form={taskForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    onCancel={onCloseComposer}
                    onChange={onTaskFormChange}
                    onLookupChange={onLookupChange}
                    onToggleMinimized={onToggleComposerMinimized}
                    onSubmit={onSaveTask}
                    onToggleExpanded={onToggleComposerExpanded}
                />
            ) : null}
            {activeComposer === "call" ? (
                <TaskDockedComposer
                    errors={taskFormErrors}
                    expanded={composerExpanded}
                    form={taskForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    variant="call"
                    onCancel={onCloseComposer}
                    onChange={onTaskFormChange}
                    onLookupChange={onLookupChange}
                    onToggleMinimized={onToggleComposerMinimized}
                    onSubmit={onSaveTask}
                    onToggleExpanded={onToggleComposerExpanded}
                />
            ) : null}
            {activeComposer === "event" ? (
                <EventDockedComposer
                    errors={eventFormErrors}
                    expanded={composerExpanded}
                    form={eventForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    onCancel={onCloseComposer}
                    onChange={onEventFormChange}
                    onLookupChange={onLookupChange}
                    onToggleMinimized={onToggleComposerMinimized}
                    onSubmit={onSaveEvent}
                    onToggleExpanded={onToggleComposerExpanded}
                />
            ) : null}
        </div>
    );
}

function ActivityComposerBar({
    onOpenCall,
    onOpenEvent,
    onOpenTask
}: {
    onOpenCall: () => void;
    onOpenEvent: () => void;
    onOpenTask: () => void;
}) {
    const taskIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(59, 167, 85))"
    } as CSSProperties;
    const eventIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(235, 112, 146))"
    } as CSSProperties;
    const callIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(84, 105, 141))"
    } as CSSProperties;

    const actions: ActivityComposerAction[] = [
        { icon: "task", iconStyle: callIconStyle, label: "電話を記録", onClick: onOpenCall, value: "LogCall" },
        { icon: "task", iconStyle: taskIconStyle, label: "新規ToDo", onClick: onOpenTask, value: "NewTask" },
        { icon: "event", iconStyle: eventIconStyle, label: "新規行動", onClick: onOpenEvent, value: "NewEvent" }
    ];

    return (
        <ul className="slds-button-group-row playground-activity-composer-bar" aria-label="活動作成">
            {actions.map((action) => (
                <li className="slds-button-group-item" key={action.value}>
                    <div className="slds-button-group fix_button-group-flexbox" role="group" aria-label={action.label} part="button-group">
                        <button className="slds-button slds-button_neutral playground-activity-composer-action" type="button" aria-label={action.label} title={action.label} value={action.value} onClick={action.onClick}>
                            <span className={`slds-icon-standard-${action.icon} slds-icon_container playground-activity-composer-action__icon`} title={action.label}>
                                <span className="playground-activity-composer-action__icon-boundary" style={action.iconStyle}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={action.icon} />
                                </span>
                                <span className="slds-assistive-text">{action.label}</span>
                            </span>
                            <span className="hidden playground-activity-composer-action__label" aria-hidden="true">{action.label}</span>
                        </button>
                        <button
                            className="slds-button slds-button_icon-border-filled fix-slds-button_icon-border-filled slds-button_last playground-activity-composer-action__menu"
                            type="button"
                            aria-expanded="false"
                            aria-haspopup="true"
                            title={`追加の ${action.label} アクションはありません`}
                            disabled
                        >
                            <UtilityIcon className="slds-button__icon" name="down" />
                            <span className="slds-assistive-text">追加の {action.label} アクションはありません</span>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function ActivityTimelineToolbar({
    allSectionsExpanded,
    loading,
    sectionCount,
    onRefresh,
    onToggleAllSections
}: {
    allSectionsExpanded: boolean;
    loading: boolean;
    sectionCount: number;
    onRefresh: () => void;
    onToggleAllSections: () => void;
}) {
    return (
        <div className="playground-activity-toolbar">
            <div className="slds-text-align_right playground-activity-links">
                <button className="slds-button_reset slds-text-link" type="button" disabled={loading} onClick={() => void onRefresh()}>
                    更新
                </button>
                <span aria-hidden="true">・</span>
                <button
                    className="slds-button_reset slds-text-link"
                    type="button"
                    disabled={loading || sectionCount === 0}
                    onClick={onToggleAllSections}
                >
                    {allSectionsExpanded ? "すべて折りたたむ" : "すべて展開"}
                </button>
            </div>
        </div>
    );
}
