"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import { apiRequest } from "./api";
import {
    buildActivityLookupPayload,
    buildDefaultTaskLookups,
    compactActivityPayload,
    compactEventActivityPayload,
    compactLookupOptions,
    getDefaultEventForm,
    getDefaultLoggedCallTaskForm,
    getDefaultTaskForm,
    type ActivityLookupOption,
    type ActivityLookupState,
    type ActivityRecordContext,
    type EventForm,
    type EventFormErrors,
    type TaskForm,
    type TaskFormErrors,
    validateEventForm,
    validateTaskForm
} from "./activity-task-form";
import { ActivityPanel, type ActivityComposerKind } from "./ActivityPanel";
import type { TaskStatusOverride } from "./ActivityTimeline";

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
    const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);
    const [activityMessage, setActivityMessage] = useState("");
    const [eventForm, setEventForm] = useState<EventForm>(() => getDefaultEventForm());
    const [eventFormErrors, setEventFormErrors] = useState<EventFormErrors>({});
    const [taskForm, setTaskForm] = useState<TaskForm>(() => getDefaultTaskForm());
    const [taskFormErrors, setTaskFormErrors] = useState<TaskFormErrors>({});
    const [activeComposer, setActiveComposer] = useState<ActivityComposerKind | null>(null);
    const [composerExpanded, setComposerExpanded] = useState(false);
    const [composerMinimized, setComposerMinimized] = useState(false);
    const [taskStatusOverrides, setTaskStatusOverrides] = useState<Record<string, TaskStatusOverride>>({});
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [savingActivity, setSavingActivity] = useState(false);
    const hasRelatedContent = Boolean(relatedContent);
    const activityTabId = "activity-tab";
    const activityPanelId = "activity-panel";
    const relatedTabId = "activity-related-tab";
    const relatedPanelId = "activity-related-panel";
    const parentPayload = useMemo(() => ({ parentType, parentId }), [parentId, parentType]);
    const context = useMemo(
        () => ({
            assignedUserName,
            assignedUserId,
            parentId,
            parentName,
            parentType,
            relatedId,
            relatedName
        }),
        [assignedUserId, assignedUserName, parentId, parentName, parentType, relatedId, relatedName]
    );
    const taskNameOptions = useMemo(() => compactLookupOptions(nameLookupOptions), [nameLookupOptions]);
    const taskRelatedOptions = useMemo(
        () =>
            compactLookupOptions([
                ...relatedLookupOptions,
                ...(parentType === "account" ? [{ id: parentId, label: parentName, objectLabel: "取引先" as const }] : []),
                ...(parentType === "contact" && relatedName ? [{ id: relatedId || relatedName, label: relatedName, objectLabel: "取引先" as const }] : [])
            ]),
        [parentId, parentName, parentType, relatedId, relatedLookupOptions, relatedName]
    );
    const taskAssignedOptions = useMemo(
        () =>
            compactLookupOptions(
                assignedUserName
                    ? [{
                        id: assignedUserId || assignedUserName,
                        label: assignedUserName,
                        objectLabel: "ユーザー" as const
                    }]
                    : []
            ),
        [assignedUserId, assignedUserName]
    );
    const defaultTaskLookups = useMemo(
        () =>
            buildDefaultTaskLookups({
                assignedOptions: taskAssignedOptions,
                context,
                nameOptions: taskNameOptions,
                relatedOptions: taskRelatedOptions
            }),
        [context, taskAssignedOptions, taskNameOptions, taskRelatedOptions]
    );
    const [activityLookups, setActivityLookups] = useState<ActivityLookupState>(() => defaultTaskLookups);

    const loadActivities = useCallback(async () => {
        setLoadingActivities(true);
        try {
            const data = await apiRequest<{ activities: ActivityTimelineItem[] }>({
                url: playgroundApiPaths.activities(parentType, parentId),
                init: {
                    headers: {
                        "content-type": "application/json"
                    }
                }
            });

            setActivities(data.activities);
            setTaskStatusOverrides({});
            setActivityMessage("");
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "活動を読み込めませんでした。");
        } finally {
            setLoadingActivities(false);
        }
    }, [parentId, parentType]);

    useEffect(() => {
        if (activeTab === "activity") {
            void loadActivities();
        }
    }, [activeTab, loadActivities]);

    function closeComposer() {
        setActiveComposer(null);
        setComposerExpanded(false);
        setComposerMinimized(false);
        setActivityLookups(defaultTaskLookups);
        setEventFormErrors({});
        setTaskFormErrors({});
    }

    function openComposer(composer: ActivityComposerKind) {
        setActivityLookups(defaultTaskLookups);
        setComposerMinimized(false);
        if (composer === "event") {
            setEventForm(getDefaultEventForm());
        } else {
            setTaskForm(composer === "call" ? getDefaultLoggedCallTaskForm() : getDefaultTaskForm());
        }
        setActiveComposer(composer);
    }

    function completeComposerSave(message: string) {
        closeComposer();
        setActivityMessage(message);
    }

    async function saveTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationErrors = validateTaskForm(taskForm, activityLookups.assigned?.label);

        setTaskFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setActivityMessage("");
            return;
        }

        setSavingActivity(true);
        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityTasks, {
                    method: "POST",
                    body: {
                        ...parentPayload,
                        ...compactActivityPayload(taskForm),
                        ...buildActivityLookupPayload(activityLookups)
                    }
                })
            );
            setTaskForm(getDefaultTaskForm());
            completeComposerSave(activeComposer === "call" ? "電話を記録しました。" : "ToDo を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "ToDo の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

    async function toggleTaskCompleted(activity: Extract<ActivityTimelineItem, { type: "task" }>) {
        const override = taskStatusOverrides[activity.id];
        const currentStatus = override?.status ?? activity.status ?? "Not Started";
        const completed = currentStatus === "Completed";
        const previousStatus = override?.previousStatus ?? activity.status ?? "Not Started";
        const nextStatus = completed ? previousStatus : "Completed";

        setTaskStatusOverrides((current) => ({
            ...current,
            [activity.id]: {
                previousStatus,
                status: nextStatus
            }
        }));
        setActivityMessage("");

        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityTask(activity.id), {
                    method: "PATCH",
                    body: {
                        Status: nextStatus
                    }
                })
            );
        } catch (error) {
            setTaskStatusOverrides((current) => {
                const next = { ...current };
                delete next[activity.id];
                return next;
            });
            setActivityMessage(error instanceof Error ? error.message : "ToDo の状況更新に失敗しました。");
        }
    }

    async function saveEvent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationErrors = validateEventForm(eventForm, activityLookups.assigned?.label);

        setEventFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setActivityMessage("");
            return;
        }

        setSavingActivity(true);
        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityEvents, {
                    method: "POST",
                    body: {
                        ...parentPayload,
                        ...compactEventActivityPayload(eventForm),
                        ...buildActivityLookupPayload(activityLookups)
                    }
                })
            );
            setEventForm(getDefaultEventForm());
            completeComposerSave("行動を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "行動の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

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
                            activities={activities}
                            context={context}
                            taskStatusOverrides={taskStatusOverrides}
                            loading={loadingActivities}
                            message={activityMessage}
                            activeComposer={activeComposer}
                            eventForm={eventForm}
                            eventFormErrors={eventFormErrors}
                            taskForm={taskForm}
                            composerExpanded={composerExpanded}
                            composerMinimized={composerMinimized}
                            taskFormErrors={taskFormErrors}
                            saving={savingActivity}
                            onCloseComposer={closeComposer}
                            onOpenEventComposer={() => openComposer("event")}
                            onOpenTaskComposer={() => openComposer("task")}
                            onOpenCallComposer={() => openComposer("call")}
                            onRefresh={loadActivities}
                            onSaveEvent={saveEvent}
                            onSaveTask={saveTask}
                            onToggleTaskCompleted={toggleTaskCompleted}
                            onDeleteActivity={onDeleteActivity}
                            onEditActivity={onEditActivity}
                            onOpenActivity={onOpenActivity}
                            onEventFormChange={(value) => {
                                setEventForm(value);
                                setEventFormErrors({});
                            }}
                            onTaskFormChange={(value) => {
                                setTaskForm(value);
                                setTaskFormErrors({});
                            }}
                            lookupOptions={{
                                assigned: taskAssignedOptions,
                                name: taskNameOptions,
                                related: taskRelatedOptions
                            }}
                            lookups={activityLookups}
                            onLookupChange={(value) => {
                                setActivityLookups(value);
                                setEventFormErrors({});
                                setTaskFormErrors({});
                            }}
                            onToggleComposerExpanded={() => {
                                setComposerMinimized(false);
                                setComposerExpanded((current) => !current);
                            }}
                            onToggleComposerMinimized={() => {
                                setComposerExpanded(false);
                                setComposerMinimized((current) => !current);
                            }}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
