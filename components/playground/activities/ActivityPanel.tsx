"use client";

import { type FormEvent } from "react";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import type {
    ActivityLookupState,
    ActivityRecordContext,
    EventForm,
    EventFormErrors,
    TaskForm,
    TaskFormErrors
} from "./activity-task-form";
import { ActivityTimeline, type TaskStatusOverride } from "./ActivityTimeline";
import { ActivityComposerBar } from "./ActivityComposerBar";
import {
    EventDockedComposer,
    TaskDockedComposer,
    type ActivityLookupOptions
} from "./ActivityDockedComposers";
import { ActivityTimelineToolbar } from "./ActivityTimelineToolbar";
import { getDisplayedTimelineSections } from "./activity-panel-state";
import { useActivityTimelineDisclosure } from "./useActivityTimelineDisclosure";
import type { PicklistOption } from "../utils/picklist-options";

export type ActivityComposerKind = "call" | "event" | "task";

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
    taskStatusOptions,
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
    lookupOptions: ActivityLookupOptions;
    lookups: ActivityLookupState;
    loading: boolean;
    message: string;
    saving: boolean;
    taskStatusOptions?: PicklistOption[];
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
    const displayedTimelineSections = getDisplayedTimelineSections(activities, taskStatusOverrides);
    const taskComposerVariant = activeComposer === "task" || activeComposer === "call"
        ? activeComposer
        : null;
    const {
        allTimelineExpanded,
        closeActionMenu,
        expandedActivityKeys,
        expandedSectionKeys,
        openActionActivityId,
        toggleActionMenu,
        toggleActivity,
        toggleAllTimelineSections,
        toggleTimelineSection
    } = useActivityTimelineDisclosure(displayedTimelineSections);

    return (
        <div className="playground-activity-panel">
            <ActivityComposerBar disabled={loading} onOpenCall={onOpenCallComposer} onOpenEvent={onOpenEventComposer} onOpenTask={onOpenTaskComposer} />
            <ActivityTimelineToolbar
                allSectionsExpanded={allTimelineExpanded}
                loading={loading}
                sectionCount={displayedTimelineSections.length}
                onRefresh={onRefresh}
                onToggleAllSections={toggleAllTimelineSections}
            />
            {message ? <p className="slds-text-color_weak slds-m-bottom_x-small">{message}</p> : null}
            {loading ? (
                <div className="slds-text-align_center slds-is-relative slds-p-around_medium">
                    <div className="slds-spinner slds-spinner_small slds-spinner_brand" role="status">
                        <span className="slds-assistive-text">活動を読み込んでいます...</span>
                        <div className="slds-spinner__dot-a" />
                        <div className="slds-spinner__dot-b" />
                    </div>
                </div>
            ) : (
                <ActivityTimeline
                    context={context}
                    expandedActivityKeys={expandedActivityKeys}
                    expandedSectionKeys={expandedSectionKeys}
                    sections={displayedTimelineSections}
                    taskStatusOverrides={taskStatusOverrides}
                    openActionActivityId={openActionActivityId}
                    onCloseActionMenu={closeActionMenu}
                    onDeleteActivity={onDeleteActivity}
                    onEditActivity={onEditActivity}
                    onToggleActivity={toggleActivity}
                    onToggleSection={toggleTimelineSection}
                    onToggleTaskCompleted={onToggleTaskCompleted}
                    onOpenActivity={onOpenActivity}
                    onToggleActionMenu={toggleActionMenu}
                />
            )}
            {taskComposerVariant ? (
                <TaskDockedComposer
                    errors={taskFormErrors}
                    expanded={composerExpanded}
                    form={taskForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    statusOptions={taskStatusOptions}
                    variant={taskComposerVariant}
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
