"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import type { ActivityComposerKind } from "./ActivityPanel";
import type { TaskStatusOverride } from "./ActivityTimeline";

export function useActivityCardState({
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
}: ActivityRecordContext & {
    activeTab: "activity" | "related";
    nameLookupOptions: ActivityLookupOption[];
    relatedLookupOptions: ActivityLookupOption[];
}) {
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

    return {
        activeComposer,
        activities,
        activityLookups,
        activityMessage,
        closeComposer,
        composerExpanded,
        composerMinimized,
        context,
        eventForm,
        eventFormErrors,
        loadActivities,
        lookupOptions: {
            assigned: taskAssignedOptions,
            name: taskNameOptions,
            related: taskRelatedOptions
        },
        openComposer,
        saveEvent,
        saveTask,
        savingActivity,
        loadingActivities,
        taskForm,
        taskFormErrors,
        taskStatusOverrides,
        toggleTaskCompleted,
        updateEventForm: (value: EventForm) => {
            setEventForm(value);
            setEventFormErrors({});
        },
        updateLookups: (value: ActivityLookupState) => {
            setActivityLookups(value);
            setEventFormErrors({});
            setTaskFormErrors({});
        },
        updateTaskForm: (value: TaskForm) => {
            setTaskForm(value);
            setTaskFormErrors({});
        },
        toggleComposerExpanded: () => {
            setComposerMinimized(false);
            setComposerExpanded((current) => !current);
        },
        toggleComposerMinimized: () => {
            setComposerExpanded(false);
            setComposerMinimized((current) => !current);
        }
    };
}
