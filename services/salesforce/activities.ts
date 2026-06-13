import type { Connection, SaveResult } from "jsforce";
import type {
    ActivityParent,
    ActivityCreateParent,
    ActivityTimelineItem,
    EventActivityInput,
    EventActivityRecord,
    EventActivityUpdateInput,
    TaskActivityInput,
    TaskActivityUpdateInput,
    TaskActivityRecord
} from "@/lib/salesforce/activities";
import { DEFAULT_SALESFORCE_QUERY_LIMIT } from "@/lib/salesforce/query-limits";
import { createdSalesforceResult, withStandardObjectConnection } from "./client";
import { countQueryableRecords } from "./count-results";
import { createStandardObjectOperations } from "./object-mutations";
import { assertObjectPermission } from "./object-permissions";

type ActivityObjectName = "Task" | "Event";
type ActivityCreateInput = TaskActivityInput | EventActivityInput;
type TaskTimelineItem = Extract<ActivityTimelineItem, { type: "task" }>;
type EventTimelineItem = Extract<ActivityTimelineItem, { type: "event" }>;

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
    "TaskSubtype",
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
}: ActivityCreateParent & {
    WhatId?: string;
    WhoId?: string;
}) {
    if (!parentId || !parentType) {
        return {
            ...(WhoId ? { WhoId } : {}),
            ...(WhatId ? { WhatId } : {})
        };
    }

    const relationField = activityRelationField(parentType);

    return {
        ...(relationField === "WhoId" ? { WhoId: parentId } : WhoId ? { WhoId } : {}),
        ...(relationField === "WhatId" ? { WhatId: parentId } : WhatId ? { WhatId } : {})
    };
}

function buildActivityCreateFields<TInput extends ActivityCreateInput>(input: TInput) {
    const { parentId, parentType, WhatId, WhoId, ...fields } = input;

    return {
        ...fields,
        ...buildActivityRelationFields({ parentId, parentType, WhatId, WhoId })
    };
}

function compareActivityItems(a: ActivityTimelineItem, b: ActivityTimelineItem) {
    const aDate = a.type === "event" ? a.startDateTime : a.date;
    const bDate = b.type === "event" ? b.startDateTime : b.date;

    return (bDate ?? b.lastModifiedDate ?? "").localeCompare(aDate ?? a.lastModifiedDate ?? "");
}

function toTaskItem(record: TaskActivityRecord): TaskTimelineItem {
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
        taskSubtype: record.TaskSubtype,
        description: record.Description,
        createdDate: record.CreatedDate,
        lastModifiedDate: record.LastModifiedDate
    };
}

function toEventItem(record: EventActivityRecord): EventTimelineItem {
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

async function queryActivityById<TRecord extends TaskActivityRecord | EventActivityRecord, TItem extends ActivityTimelineItem>(
    connection: Connection,
    objectName: ActivityObjectName,
    fields: readonly string[],
    id: string,
    mapRecord: (record: TRecord) => TItem
) {
    const result = await connection.query<TRecord>([
        `SELECT ${fields.join(", ")}`,
        `FROM ${objectName}`,
        `WHERE Id = '${id}'`,
        "LIMIT 1"
    ].join(" "));

    return result.records[0] ? mapRecord(result.records[0]) : null;
}

function createActivityWithHydratedResult<
    TInput extends ActivityCreateInput,
    TRecord extends TaskActivityRecord | EventActivityRecord,
    TItem extends ActivityTimelineItem
>(
    objectName: ActivityObjectName,
    fields: readonly string[],
    input: TInput,
    mapRecord: (record: TRecord) => TItem
) {
    return withStandardObjectConnection(async (connection) => {
        await assertObjectPermission(connection, objectName, "createable");
        await assertObjectPermission(connection, objectName, "queryable");

        const result = await connection.sobject(objectName).create(buildActivityCreateFields(input));
        const created = createdSalesforceResult(result);
        const activity = await queryActivityById<TRecord, TItem>(connection, objectName, fields, created.id, mapRecord);

        return {
            ...created,
            activity
        };
    });
}

const taskActivities = createStandardObjectOperations<TaskActivityInput, TaskActivityUpdateInput>("Task", {
    buildCreateInput: buildActivityCreateFields
});
const eventActivities = createStandardObjectOperations<EventActivityInput, EventActivityUpdateInput>("Event", {
    buildCreateInput: buildActivityCreateFields
});

export async function countActivities() {
    return withStandardObjectConnection(async (connection) => {
        const [tasks, events] = await Promise.all([
            countQueryableRecords(connection, "Task"),
            countQueryableRecords(connection, "Event")
        ]);

        return {
            activityCounts: {
                tasks,
                events
            }
        };
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
                `LIMIT ${DEFAULT_SALESFORCE_QUERY_LIMIT}`
            ].join(" ")),
            connection.query<EventActivityRecord>([
                `SELECT ${eventFields.join(", ")}`,
                "FROM Event",
                `WHERE ${relationField} = '${parent.parentId}'`,
                "ORDER BY StartDateTime DESC",
                `LIMIT ${DEFAULT_SALESFORCE_QUERY_LIMIT}`
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
    return createActivityWithHydratedResult<TaskActivityInput, TaskActivityRecord, TaskTimelineItem>(
        "Task",
        taskFields,
        input,
        toTaskItem
    );
}

export async function updateTaskActivity(id: string, input: TaskActivityUpdateInput) {
    return taskActivities.update(id, input);
}

export async function getTaskActivity(id: string) {
    return getActivityById("Task", taskFields, id, toTaskItem);
}

export async function deleteTaskActivity(id: string) {
    return taskActivities.deleteOne(id);
}

export async function createEventActivity(input: EventActivityInput) {
    return createActivityWithHydratedResult<EventActivityInput, EventActivityRecord, EventTimelineItem>(
        "Event",
        eventFields,
        input,
        toEventItem
    );
}

export async function getEventActivity(id: string) {
    return getActivityById("Event", eventFields, id, toEventItem);
}

export async function updateEventActivity(id: string, input: EventActivityUpdateInput) {
    return eventActivities.update(id, input);
}

export async function deleteEventActivity(id: string) {
    return eventActivities.deleteOne(id);
}

export type { SaveResult };
