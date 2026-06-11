"use client";

import { type Dispatch, type FormEvent, type SetStateAction, useCallback } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import { apiRequest } from "./api";
import {
    buildActivityLookupPayload,
    compactActivityPayload,
    compactEventActivityPayload,
    getDefaultEventForm,
    getDefaultTaskForm,
    type ActivityLookupState,
    type EventForm,
    type EventFormErrors,
    type TaskForm,
    type TaskFormErrors,
    validateEventForm,
    validateTaskForm
} from "./activity-task-form";
import type { ActivityComposerKind } from "./ActivityPanel";
import type { TaskStatusOverride } from "./ActivityTimeline";

type UseActivityActionsOptions = {
    activeComposer: ActivityComposerKind | null;
    activityLookups: ActivityLookupState;
    eventForm: EventForm;
    parentId: string;
    parentPayload: { parentId: string; parentType: "account" | "contact" };
    parentType: "account" | "contact";
    taskForm: TaskForm;
    taskStatusOverrides: Record<string, TaskStatusOverride>;
    closeComposer: () => void;
    setActivities: Dispatch<SetStateAction<ActivityTimelineItem[]>>;
    setActivityMessage: Dispatch<SetStateAction<string>>;
    setEventForm: Dispatch<SetStateAction<EventForm>>;
    setEventFormErrors: Dispatch<SetStateAction<EventFormErrors>>;
    setLoadingActivities: Dispatch<SetStateAction<boolean>>;
    setSavingActivity: Dispatch<SetStateAction<boolean>>;
    setTaskForm: Dispatch<SetStateAction<TaskForm>>;
    setTaskFormErrors: Dispatch<SetStateAction<TaskFormErrors>>;
    setTaskStatusOverrides: Dispatch<SetStateAction<Record<string, TaskStatusOverride>>>;
};

type ActivityCreateResponse = {
    activity?: ActivityTimelineItem | null;
};

export function mergeCreatedActivity(
    activities: ActivityTimelineItem[],
    createdActivity: ActivityTimelineItem
): ActivityTimelineItem[] {
    return [
        createdActivity,
        ...activities.filter((activity) => activity.id !== createdActivity.id || activity.type !== createdActivity.type)
    ].sort(compareActivityTimelineItems);
}

function compareActivityTimelineItems(a: ActivityTimelineItem, b: ActivityTimelineItem) {
    const aDate = a.type === "event" ? a.startDateTime : a.date;
    const bDate = b.type === "event" ? b.startDateTime : b.date;

    return (bDate ?? b.lastModifiedDate ?? "").localeCompare(aDate ?? a.lastModifiedDate ?? "");
}

export function useActivityActions({
    activeComposer,
    activityLookups,
    closeComposer,
    eventForm,
    parentId,
    parentPayload,
    parentType,
    setActivities,
    setActivityMessage,
    setEventForm,
    setEventFormErrors,
    setLoadingActivities,
    setSavingActivity,
    setTaskForm,
    setTaskFormErrors,
    setTaskStatusOverrides,
    taskForm,
    taskStatusOverrides
}: UseActivityActionsOptions) {
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
    }, [parentId, parentType, setActivities, setActivityMessage, setLoadingActivities, setTaskStatusOverrides]);

    function completeComposerSave(message: string) {
        closeComposer();
        setActivityMessage(message);
    }

    function addCreatedActivity(activity: ActivityTimelineItem | null | undefined) {
        if (!activity) {
            return false;
        }

        setActivities((current) => mergeCreatedActivity(current, activity));
        if (activity.type === "task") {
            setTaskStatusOverrides((current) => {
                if (!(activity.id in current)) {
                    return current;
                }

                const next = { ...current };
                delete next[activity.id];
                return next;
            });
        }

        return true;
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
            const data = await apiRequest<ActivityCreateResponse>(
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
            if (!addCreatedActivity(data.activity)) {
                await loadActivities();
            }
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
            const data = await apiRequest<ActivityCreateResponse>(
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
            if (!addCreatedActivity(data.activity)) {
                await loadActivities();
            }
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "行動の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

    return {
        loadActivities,
        saveEvent,
        saveTask,
        toggleTaskCompleted
    };
}
