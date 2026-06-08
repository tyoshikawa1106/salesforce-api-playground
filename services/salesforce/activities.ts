import type { SaveResult } from "jsforce";
import type {
    ActivityParent,
    ActivityTimelineItem,
    EventActivityRecord,
    TaskActivityInput,
    TaskActivityRecord
} from "@/lib/salesforce/activities";
import { withStandardObjectConnection } from "./client";
import { createStandardObject } from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";

const taskFields = [
    "Id",
    "Subject",
    "ActivityDate",
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
    "Location",
    "Description",
    "CreatedDate",
    "LastModifiedDate"
] as const;

function activityRelationField(parentType: ActivityParent["parentType"]) {
    return parentType === "account" ? "WhatId" : "WhoId";
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
        location: record.Location,
        description: record.Description,
        createdDate: record.CreatedDate,
        lastModifiedDate: record.LastModifiedDate
    };
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
    const { parentId, parentType, ...fields } = input;

    return createStandardObject("Task", {
        ...fields,
        [activityRelationField(parentType)]: parentId
    });
}

export type { SaveResult };
