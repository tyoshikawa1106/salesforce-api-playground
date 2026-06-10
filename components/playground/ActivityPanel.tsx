"use client";

import { type FormEvent, useState } from "react";
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
import { ActivityComposerBar } from "./ActivityComposerBar";
import { EventDockedComposer, TaskDockedComposer } from "./ActivityDockedComposers";
import { ActivityTimelineToolbar } from "./ActivityTimelineToolbar";

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
