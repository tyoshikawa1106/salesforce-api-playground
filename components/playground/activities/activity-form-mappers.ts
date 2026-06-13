import type { ActivityLookupOption, ActivityLookupState, EventForm, TaskForm } from "./activity-task-form";
import {
    getDefaultEventForm,
    getDefaultTaskForm
} from "./activity-task-form";
import type { Activity } from "../utils/types";

function activityLookupOption(
    id: string | undefined,
    label: string | undefined,
    objectLabel: ActivityLookupOption["objectLabel"]
): ActivityLookupOption | undefined {
    return id && label ? { id, label, objectLabel } : undefined;
}

export function activityToTaskForm(activity?: Activity): TaskForm {
    if (!activity || activity.type !== "task") {
        return getDefaultTaskForm();
    }

    return {
        Subject: activity.subject,
        ActivityDate: activity.date ?? "",
        Status: activity.status ?? "Not Started",
        Priority: activity.priority ?? "Normal",
        TaskSubtype: activity.taskSubtype,
        Description: activity.description ?? ""
    };
}

export function activityToEventForm(activity?: Activity): EventForm {
    if (!activity || activity.type !== "event") {
        return getDefaultEventForm();
    }

    return {
        Subject: activity.subject,
        StartDateTime: activity.startDateTime?.slice(0, 16) ?? "",
        EndDateTime: activity.endDateTime?.slice(0, 16) ?? "",
        Location: activity.location ?? "",
        Description: activity.description ?? ""
    };
}

export function activityToLookupState(activity?: Activity): ActivityLookupState {
    return {
        assigned: activityLookupOption(activity?.ownerId, activity?.ownerName, "ユーザー"),
        name: activityLookupOption(activity?.whoId, activity?.whoName, "取引先責任者"),
        related: activityLookupOption(activity?.whatId, activity?.whatName, "取引先")
    };
}
