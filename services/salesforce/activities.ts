import type { SaveResult } from "jsforce";
import type {
    ActivityParent,
    ActivityTimelineItem,
    EventActivityInput,
    EventActivityRecord,
    EventActivityUpdateInput,
    TaskActivityInput,
    TaskActivityUpdateInput,
    TaskActivityRecord
} from "@/lib/salesforce/activities";
import { withStandardObjectConnection } from "./client";
import { createStandardObject, deleteStandardObject, updateStandardObject } from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";

const taskFields = [
    "Id",
    "Subject",
    "ActivityDate",
    "WhoId",
    "Who.Name",
    "OwnerId",
    "Owner.Name",
    "WhatId",
    "What.Name",
    "Status",
    "Priority",
    "Description",
    "CreatedDate",
    "LastModifiedDate"
] as const;

const eventFields = [
    "Id",
    "Subject",
    "StartDateTime",
    "EndDateTime",
    "WhoId",
    "Who.Name",
    "OwnerId",
    "Owner.Name",
    "WhatId",
    "What.Name",
    "Location",
    "Description",
    "CreatedDate",
    "LastModifiedDate"
] as const;

function activityRelationField(parentType: ActivityParent["parentType"]) {
    return parentType === "account" ? "WhatId" : "WhoId";
}

function buildActivityRelationFields({
    parentId,
    parentType,
    WhatId,
    WhoId
}: ActivityParent & {
    WhatId?: string;
    WhoId?: string;
}) {
    const relationField = activityRelationField(parentType);

    return {
        ...(relationField === "WhoId" ? { WhoId: parentId } : WhoId ? { WhoId } : {}),
        ...(relationField === "WhatId" ? { WhatId: parentId } : WhatId ? { WhatId } : {})
    };
}

function compareActivityItems(a: ActivityTimelineItem, b: ActivityTimelineItem) {
    const aDate = a.type === "event" ? a.startDateTime : a.date;
    const bDate = b.type === "event" ? b.startDateTime : b.date;

    return (bDate ?? b.lastModifiedDate ?? "").localeCompare(aDate ?? a.lastModifiedDate ?? "");
}

function toTaskItem(record: TaskActivityRecord): ActivityTimelineItem {
    return {
        type: "task",
        id: record.Id,
        subject: record.Subject || "ToDo",
        date: record.ActivityDate,
        whoId: record.WhoId,
        whoName: record.Who?.Name,
        ownerId: record.OwnerId,
        ownerName: record.Owner?.Name,
        whatId: record.WhatId,
        whatName: record.What?.Name,
        status: record.Status,
        priority: record.Priority,
        description: record.Description,
        createdDate: record.CreatedDate,
        lastModifiedDate: record.LastModifiedDate
    };
}

function toEventItem(record: EventActivityRecord): ActivityTimelineItem {
    return {
        type: "event",
        id: record.Id,
        subject: record.Subject || "Event",
        startDateTime: record.StartDateTime,
        endDateTime: record.EndDateTime,
        whoId: record.WhoId,
        whoName: record.Who?.Name,
        ownerId: record.OwnerId,
        ownerName: record.Owner?.Name,
        whatId: record.WhatId,
        whatName: record.What?.Name,
        location: record.Location,
        description: record.Description,
        createdDate: record.CreatedDate,
        lastModifiedDate: record.LastModifiedDate
    };
}

function getActivityById<TRecord extends TaskActivityRecord | EventActivityRecord, TItem extends ActivityTimelineItem>(
    objectName: "Task" | "Event",
    fields: readonly string[],
    id: string,
    mapRecord: (record: TRecord) => TItem
) {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "queryable");
        const result = await connection.query<TRecord>([
            `SELECT ${fields.join(", ")}`,
            `FROM ${objectName}`,
            `WHERE Id = '${id}'`,
            "LIMIT 1"
        ].join(" "));
        const record = result.records[0];

        if (!record) {
            return { activity: null };
        }

        return { activity: mapRecord(record) };
    });
}

export async function listActivities(parent: ActivityParent) {
    return withStandardObjectConnection(async (connection) => {
        const relationField = activityRelationField(parent.parentType);

        await assertObjectPermission(connection, "Task", "queryable");
        await assertObjectPermission(connection, "Event", "queryable");

        const [tasks, events] = await Promise.all([
            connection.query<TaskActivityRecord>([
                `SELECT ${taskFields.join(", ")}`,
                "FROM Task",
                `WHERE ${relationField} = '${parent.parentId}'`,
                "ORDER BY LastModifiedDate DESC",
                "LIMIT 20"
            ].join(" ")),
            connection.query<EventActivityRecord>([
                `SELECT ${eventFields.join(", ")}`,
                "FROM Event",
                `WHERE ${relationField} = '${parent.parentId}'`,
                "ORDER BY StartDateTime DESC",
                "LIMIT 20"
            ].join(" "))
        ]);

        return {
            activities: [
                ...tasks.records.map(toTaskItem),
                ...events.records.map(toEventItem)
            ].sort(compareActivityItems)
        };
    });
}

export async function createTaskActivity(input: TaskActivityInput) {
    const { parentId, parentType, WhatId, WhoId, ...fields } = input;

    return createStandardObject("Task", {
        ...fields,
        ...buildActivityRelationFields({ parentId, parentType, WhatId, WhoId })
    });
}

export async function updateTaskActivity(id: string, input: TaskActivityUpdateInput) {
    return updateStandardObject("Task", id, input);
}

export async function getTaskActivity(id: string) {
    return getActivityById("Task", taskFields, id, toTaskItem);
}

export async function deleteTaskActivity(id: string) {
    return deleteStandardObject("Task", id);
}

export async function createEventActivity(input: EventActivityInput) {
    const { parentId, parentType, WhatId, WhoId, ...fields } = input;

    return createStandardObject("Event", {
        ...fields,
        ...buildActivityRelationFields({ parentId, parentType, WhatId, WhoId })
    });
}

export async function getEventActivity(id: string) {
    return getActivityById("Event", eventFields, id, toEventItem);
}

export async function updateEventActivity(id: string, input: EventActivityUpdateInput) {
    return updateStandardObject("Event", id, input);
}

export async function deleteEventActivity(id: string) {
    return deleteStandardObject("Event", id);
}

export type { SaveResult };
