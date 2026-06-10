"use client";

import { type ReactNode, useState } from "react";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import {
    type ActivityLookupOption,
    type ActivityRecordContext
} from "./activity-task-form";
import { ActivityPanel } from "./ActivityPanel";
import { useActivityCardState } from "./useActivityCardState";

export type { ActivityLookupOption } from "./activity-task-form";
export { ActivityTimeline } from "./ActivityTimeline";
export {
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

export function ActivityCard({
    assignedUserName,
    assignedUserId,
    nameLookupOptions = [],
    parentId,
    parentName,
    parentType,
    relatedId,
    relatedContent,
    relatedLookupOptions = [],
    relatedName,
    onDeleteActivity,
    onEditActivity,
    onOpenActivity
}: ActivityRecordContext & {
    nameLookupOptions?: ActivityLookupOption[];
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    relatedContent?: ReactNode;
    relatedLookupOptions?: ActivityLookupOption[];
}) {
    const [activeTab, setActiveTab] = useState<"activity" | "related">("activity");
    const hasRelatedContent = Boolean(relatedContent);
    const activityTabId = "activity-tab";
    const activityPanelId = "activity-panel";
    const relatedTabId = "activity-related-tab";
    const relatedPanelId = "activity-related-panel";
    const activityState = useActivityCardState({
        activeTab,
        assignedUserId,
        assignedUserName,
        nameLookupOptions,
        parentId,
        parentName,
        parentType,
        relatedId,
        relatedLookupOptions,
        relatedName
    });

    return (
        <section className="slds-card slds-card_boundary playground-activity-card">
            <div className="slds-card__body slds-card__body_inner playground-activity-card__body">
                <div className="slds-tabs_default">
                    <ul className="slds-tabs_default__nav" role="tablist">
                        <li className={`slds-tabs_default__item ${activeTab === "activity" ? "slds-is-active" : ""}`} role="presentation">
                            <button
                                className="slds-tabs_default__link slds-button_reset"
                                type="button"
                                role="tab"
                                id={activityTabId}
                                aria-selected={activeTab === "activity"}
                                aria-controls={activityPanelId}
                                onClick={() => setActiveTab("activity")}
                            >
                                活動
                            </button>
                        </li>
                        {hasRelatedContent ? (
                            <li className={`slds-tabs_default__item ${activeTab === "related" ? "slds-is-active" : ""}`} role="presentation">
                                <button
                                    className="slds-tabs_default__link slds-button_reset"
                                    type="button"
                                    role="tab"
                                    id={relatedTabId}
                                    aria-selected={activeTab === "related"}
                                    aria-controls={relatedPanelId}
                                    onClick={() => setActiveTab("related")}
                                >
                                    関連
                                </button>
                            </li>
                        ) : null}
                    </ul>
                </div>
                <div
                    className="slds-tabs_default__content slds-show playground-activity-card__panel"
                    role="tabpanel"
                    id={activeTab === "related" && hasRelatedContent ? relatedPanelId : activityPanelId}
                    aria-labelledby={activeTab === "related" && hasRelatedContent ? relatedTabId : activityTabId}
                >
                    {activeTab === "related" && hasRelatedContent ? (
                        relatedContent
                    ) : (
                        <ActivityPanel
                            activities={activityState.activities}
                            context={activityState.context}
                            taskStatusOverrides={activityState.taskStatusOverrides}
                            loading={activityState.loadingActivities}
                            message={activityState.activityMessage}
                            activeComposer={activityState.activeComposer}
                            eventForm={activityState.eventForm}
                            eventFormErrors={activityState.eventFormErrors}
                            taskForm={activityState.taskForm}
                            composerExpanded={activityState.composerExpanded}
                            composerMinimized={activityState.composerMinimized}
                            taskFormErrors={activityState.taskFormErrors}
                            saving={activityState.savingActivity}
                            lookupOptions={activityState.lookupOptions}
                            lookups={activityState.activityLookups}
                            onCloseComposer={activityState.closeComposer}
                            onOpenEventComposer={() => activityState.openComposer("event")}
                            onOpenTaskComposer={() => activityState.openComposer("task")}
                            onOpenCallComposer={() => activityState.openComposer("call")}
                            onRefresh={activityState.loadActivities}
                            onSaveEvent={activityState.saveEvent}
                            onSaveTask={activityState.saveTask}
                            onToggleTaskCompleted={activityState.toggleTaskCompleted}
                            onDeleteActivity={onDeleteActivity}
                            onEditActivity={onEditActivity}
                            onOpenActivity={onOpenActivity}
                            onEventFormChange={activityState.updateEventForm}
                            onTaskFormChange={activityState.updateTaskForm}
                            onLookupChange={activityState.updateLookups}
                            onToggleComposerExpanded={activityState.toggleComposerExpanded}
                            onToggleComposerMinimized={activityState.toggleComposerMinimized}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
