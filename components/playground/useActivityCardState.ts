"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import {
    type ActivityLookupOption,
    type ActivityRecordContext
} from "./activity-task-form";
import type { TaskStatusOverride } from "./ActivityTimeline";
import { useActivityActions } from "./useActivityActions";
import { useActivityComposerState } from "./useActivityComposerState";
import { useActivityLookupOptions } from "./useActivityLookupOptions";

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
    const { defaultLookups, lookupOptions } = useActivityLookupOptions({
        assignedUserId,
        assignedUserName,
        context,
        nameLookupOptions,
        parentId,
        parentName,
        parentType,
        relatedId,
        relatedLookupOptions,
        relatedName
    });
    const composerState = useActivityComposerState(defaultLookups);
    const actions = useActivityActions({
        activeComposer: composerState.activeComposer,
        activityLookups: composerState.activityLookups,
        closeComposer: composerState.closeComposer,
        eventForm: composerState.eventForm,
        parentId,
        parentPayload,
        parentType,
        setActivities,
        setActivityMessage,
        setEventForm: composerState.setEventForm,
        setEventFormErrors: composerState.setEventFormErrors,
        setLoadingActivities,
        setSavingActivity,
        setTaskForm: composerState.setTaskForm,
        setTaskFormErrors: composerState.setTaskFormErrors,
        setTaskStatusOverrides,
        taskForm: composerState.taskForm,
        taskStatusOverrides
    });
    const { loadActivities } = actions;

    useEffect(() => {
        if (activeTab === "activity") {
            void loadActivities();
        }
    }, [activeTab, loadActivities]);

    return {
        ...composerState,
        ...actions,
        activities,
        activityMessage,
        context,
        loadingActivities,
        lookupOptions,
        savingActivity,
        taskStatusOverrides
    };
}
