import { describe, expect, it } from "vitest";
import { getDefaultEventForm, getDefaultTaskForm } from "./activity-form-defaults";
import {
    buildEventActivityCreateRequest,
    buildTaskActivityCreateRequest,
    getTaskCreateSuccessMessage,
    mergeCreatedActivity
} from "./activity-create-helpers";
import { accountFixture, activityFixture, contactFixture } from "./test-fixtures";
import type { ActivityLookupOption, ActivityLookupState } from "./activity-task-form";

const assignedLookup = {
    id: "005xx0000012345",
    label: "Admin User",
    objectLabel: "ユーザー"
} satisfies ActivityLookupOption;

const contactLookup = {
    id: contactFixture.Id,
    label: contactFixture.LastName,
    objectLabel: "取引先責任者"
} satisfies ActivityLookupOption;

const accountLookup = {
    id: accountFixture.Id,
    label: accountFixture.Name,
    objectLabel: "取引先"
} satisfies ActivityLookupOption;

const activityLookups: ActivityLookupState = {
    assigned: assignedLookup,
    name: contactLookup,
    related: accountLookup
};

const parentPayload = {
    parentId: accountFixture.Id,
    parentType: "account" as const
};

function parseRequestBody(request: ReturnType<typeof buildTaskActivityCreateRequest>) {
    return JSON.parse(request.init.body as string) as Record<string, string>;
}

describe("buildTaskActivityCreateRequest", () => {
    it("builds a compact task create request with selected lookups", () => {
        const request = buildTaskActivityCreateRequest({
            activityLookups,
            form: {
                ...getDefaultTaskForm(),
                ActivityDate: "2026-06-12",
                Description: " Follow up ",
                Priority: " Normal ",
                Status: "Not Started",
                Subject: " Call ",
                TaskSubtype: "Call"
            },
            parentPayload
        });

        expect(request.url).toBe("/api/activities/tasks");
        expect(request.init.method).toBe("POST");
        expect(parseRequestBody(request)).toEqual({
            ActivityDate: "2026-06-12",
            Description: "Follow up",
            OwnerId: assignedLookup.id,
            Priority: "Normal",
            Status: "Not Started",
            Subject: "Call",
            TaskSubtype: "Call",
            WhatId: accountLookup.id,
            WhoId: contactLookup.id,
            parentId: parentPayload.parentId,
            parentType: parentPayload.parentType
        });
    });
});

describe("buildEventActivityCreateRequest", () => {
    it("builds an event create request with Salesforce datetime values", () => {
        const form = {
            ...getDefaultEventForm(),
            Description: " Discuss rollout ",
            EndDateTime: "2026-06-12T11:00",
            Location: " Conference room ",
            StartDateTime: "2026-06-12T10:00",
            Subject: " Meeting "
        };
        const request = buildEventActivityCreateRequest({
            activityLookups,
            form,
            parentPayload
        });

        expect(request.url).toBe("/api/activities/events");
        expect(request.init.method).toBe("POST");
        expect(JSON.parse(request.init.body as string)).toEqual({
            Description: "Discuss rollout",
            EndDateTime: new Date(form.EndDateTime).toISOString(),
            Location: "Conference room",
            OwnerId: assignedLookup.id,
            StartDateTime: new Date(form.StartDateTime).toISOString(),
            Subject: "Meeting",
            WhatId: accountLookup.id,
            WhoId: contactLookup.id,
            parentId: parentPayload.parentId,
            parentType: parentPayload.parentType
        });
    });
});

describe("getTaskCreateSuccessMessage", () => {
    it("uses the call log message for call composer saves", () => {
        expect(getTaskCreateSuccessMessage("call")).toBe("電話を記録しました。");
    });

    it("uses the task message for standard task composer saves", () => {
        expect(getTaskCreateSuccessMessage("task")).toBe("ToDo を作成しました。");
    });
});

describe("mergeCreatedActivity", () => {
    it("adds a created activity without duplicating existing items", () => {
        const existingEvent = {
            type: "event" as const,
            id: "00Uxx0000012345",
            subject: "Meeting",
            startDateTime: "2026-06-09T10:00:00.000Z"
        };
        const createdTask = {
            type: "task" as const,
            id: activityFixture.id,
            subject: "Call",
            date: "2026-06-12"
        };

        const merged = mergeCreatedActivity([activityFixture, existingEvent], createdTask);

        expect(merged).toEqual([
            createdTask,
            existingEvent
        ]);
    });
});
