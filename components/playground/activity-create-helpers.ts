import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import {
    buildActivityLookupPayload,
    compactActivityPayload,
    compactEventActivityPayload,
    type ActivityLookupState,
    type EventForm,
    type TaskForm
} from "./activity-task-form";
import type { ActivityComposerKind } from "./ActivityPanel";

type ActivityParentPayload = {
    parentId: string;
    parentType: "account" | "contact";
};

export type ActivityCreateResponse = {
    activity?: ActivityTimelineItem | null;
};

type ActivityCreateRequestOptions<TForm> = {
    activityLookups: ActivityLookupState;
    form: TForm;
    parentPayload?: ActivityParentPayload;
};

export function buildTaskActivityCreateRequest({
    activityLookups,
    form,
    parentPayload
}: ActivityCreateRequestOptions<TaskForm>) {
    return buildPlaygroundApiRequest(playgroundApiPaths.activityTasks, {
        method: "POST",
        body: {
            ...(parentPayload ?? {}),
            ...compactActivityPayload(form),
            ...buildActivityLookupPayload(activityLookups)
        }
    });
}

export function buildEventActivityCreateRequest({
    activityLookups,
    form,
    parentPayload
}: ActivityCreateRequestOptions<EventForm>) {
    return buildPlaygroundApiRequest(playgroundApiPaths.activityEvents, {
        method: "POST",
        body: {
            ...(parentPayload ?? {}),
            ...compactEventActivityPayload(form),
            ...buildActivityLookupPayload(activityLookups)
        }
    });
}

export function getTaskCreateSuccessMessage(activeComposer: ActivityComposerKind | null) {
    return activeComposer === "call" ? "電話を記録しました。" : "ToDo を作成しました。";
}

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
