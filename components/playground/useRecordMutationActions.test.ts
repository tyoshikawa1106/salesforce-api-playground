import { describe, expect, it } from "vitest";
import { getDefaultEventForm, getDefaultTaskForm } from "./activity-form-defaults";
import { getActivitySaveRequest } from "./useRecordMutationActions";
import { accountFixture, activityFixture } from "./test-fixtures";
import type { ActivityLookupOption, ActivityLookupState } from "./activity-task-form";
import type { ModalState } from "./types";

const assignedLookup = {
    id: "005xx0000012345",
    label: "Admin User",
    objectLabel: "ユーザー"
} satisfies ActivityLookupOption;

const emptyLookups: ActivityLookupState = {};

describe("getActivitySaveRequest", () => {
    it("ignores non-activity modals", () => {
        const modal: ModalState = { type: "account", mode: "edit", record: accountFixture };

        expect(getActivitySaveRequest({
            activityLookups: emptyLookups,
            eventForm: getDefaultEventForm(),
            modal,
            taskForm: getDefaultTaskForm()
        })).toBeNull();
    });

    it("builds a task save request with validation errors", () => {
        const modal: ModalState = { type: "activity", mode: "edit", record: activityFixture };
        const request = getActivitySaveRequest({
            activityLookups: emptyLookups,
            eventForm: getDefaultEventForm(),
            modal,
            taskForm: { ...getDefaultTaskForm(), Subject: "", Status: "" }
        });

        expect(request).toMatchObject({
            modal,
            validationErrors: {
                Subject: "件名を入力してください。",
                Status: "状況を選択してください。",
                assignedUserName: "割り当て先を選択してください。"
            }
        });
    });

    it("builds an event save request with the selected assigned user", () => {
        const modal: ModalState = {
            type: "activity",
            mode: "edit",
            record: {
                ...activityFixture,
                type: "event"
            }
        };
        const eventForm = {
            ...getDefaultEventForm(),
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00",
            EndDateTime: "2026-06-08T11:00"
        };
        const request = getActivitySaveRequest({
            activityLookups: {
                ...emptyLookups,
                assigned: assignedLookup
            },
            eventForm,
            modal,
            taskForm: getDefaultTaskForm()
        });

        expect(request).toMatchObject({
            form: eventForm,
            modal,
            validationErrors: {}
        });
    });
});
