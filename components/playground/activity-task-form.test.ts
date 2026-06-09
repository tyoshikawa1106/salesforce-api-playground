import { describe, expect, it } from "vitest";
import {
    buildCalendarWeeks,
    buildActivityLookupPayload,
    buildDateValue,
    buildDateTimeValue,
    buildDateTimeInputValue,
    buildDefaultTaskLookups,
    compactActivityPayload,
    compactEventActivityPayload,
    compactLookupOptions,
    formatDateInputValue,
    getDateTimeDateValue,
    getDateTimeTimeValue,
    getEventFormErrorLabels,
    getDefaultLoggedCallTaskForm,
    getLookupApiObject,
    getLookupObjectLabel,
    getTaskFormErrorLabels,
    normalizeDateInputValue,
    normalizeTimeInputValue,
    validateEventForm,
    validateTaskForm,
    type ActivityLookupOption,
    type EventForm,
    type ActivityRecordContext,
    type TaskForm
} from "./activity-task-form";

const validTaskForm: TaskForm = {
    Subject: "Call",
    ActivityDate: "2026-06-08",
    Status: "Not Started",
    Priority: "Normal",
    Description: ""
};
const validEventForm: EventForm = {
    Subject: "Meeting",
    StartDateTime: "2026-06-08T10:00",
    EndDateTime: "2026-06-08T11:00",
    Location: "",
    Description: ""
};

describe("activity task form helpers", () => {
    it("compacts task payload fields before sending them to the API", () => {
        expect(compactActivityPayload({
            Subject: "  Call  ",
            Description: "   "
        })).toEqual({
            Subject: "Call",
            Description: undefined
        });
    });

    it("converts event datetime fields before sending them to the API", () => {
        expect(compactEventActivityPayload({
            ...validEventForm,
            Subject: " Meeting ",
            StartDateTime: "2026-06-08T10:00",
            EndDateTime: "2026-06-08T11:00"
        })).toEqual({
            Subject: "Meeting",
            StartDateTime: new Date("2026-06-08T10:00").toISOString(),
            EndDateTime: new Date("2026-06-08T11:00").toISOString(),
            Location: undefined,
            Description: undefined
        });
    });

    it("normalizes and formats date values", () => {
        expect(buildDateValue(new Date(2026, 5, 8))).toBe("2026-06-08");
        expect(buildDateTimeValue(new Date(2026, 5, 8, 10, 5))).toBe("2026-06-08T10:05");
        expect(formatDateInputValue("2026-06-08")).toBe("2026/06/08");
        expect(normalizeDateInputValue("2026/6/8")).toBe("2026-06-08");
        expect(normalizeDateInputValue("2026/02/30")).toBe("");
    });

    it("builds default values for logged call tasks", () => {
        expect(getDefaultLoggedCallTaskForm()).toMatchObject({
            Subject: "Call",
            Status: "Completed",
            Priority: "Normal",
            TaskSubtype: "Call",
            Description: ""
        });
        expect(getDefaultLoggedCallTaskForm().ActivityDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("splits and combines date time input values", () => {
        expect(getDateTimeDateValue("2026-06-08T10:30")).toBe("2026-06-08");
        expect(getDateTimeTimeValue("2026-06-08T10:30")).toBe("10:30");
        expect(normalizeTimeInputValue("9:05")).toBe("09:05");
        expect(normalizeTimeInputValue("24:00")).toBe("");
        expect(buildDateTimeInputValue("2026/6/8", "9:05")).toBe("2026-06-08T09:05");
    });

    it("builds a six-week calendar grid from the visible month", () => {
        const weeks = buildCalendarWeeks(new Date(2026, 5, 8));

        expect(weeks).toHaveLength(6);
        expect(weeks[0]).toHaveLength(7);
        expect(buildDateValue(weeks[0][0])).toBe("2026-05-31");
        expect(buildDateValue(weeks[1][1])).toBe("2026-06-08");
    });

    it("validates required task fields", () => {
        const errors = validateTaskForm({
            ...validTaskForm,
            Subject: "",
            Status: ""
        }, "");

        expect(errors).toEqual({
            Subject: "件名を入力してください。",
            assignedUserName: "割り当て先を選択してください。",
            Status: "状況を選択してください。"
        });
        expect(getTaskFormErrorLabels(errors)).toEqual(["件名", "割り当て先", "状況"]);
    });

    it("validates required event fields and time order", () => {
        const errors = validateEventForm({
            ...validEventForm,
            Subject: "",
            EndDateTime: "2026-06-08T09:00"
        }, "");

        expect(errors).toEqual({
            Subject: "件名を入力してください。",
            EndDateTime: "終了日時は開始日時より後にしてください。",
            assignedUserName: "割り当て先を選択してください。"
        });
        expect(getEventFormErrorLabels(errors)).toEqual(["件名", "終了", "割り当て先"]);
    });

    it("deduplicates lookup options while keeping object boundaries", () => {
        const options: ActivityLookupOption[] = [
            { id: "001A", label: "Edge Communications", objectLabel: "取引先" },
            { id: "001A", label: "Edge Communications", objectLabel: "取引先" },
            { id: "001A", label: "Edge Communications", objectLabel: "取引先責任者" },
            { id: "empty", label: "", objectLabel: "取引先" }
        ];

        expect(compactLookupOptions(options)).toEqual([
            { id: "001A", label: "Edge Communications", objectLabel: "取引先" },
            { id: "001A", label: "Edge Communications", objectLabel: "取引先責任者" }
        ]);
    });

    it("builds default lookups from the current record context", () => {
        const assigned = { id: "005A", label: "Yoshikawa Taiki", objectLabel: "ユーザー" } as const;
        const contact = { id: "003A", label: "Gonzalez Rose", objectLabel: "取引先責任者" } as const;
        const account = { id: "001A", label: "Edge Communications", objectLabel: "取引先" } as const;
        const context: ActivityRecordContext = {
            parentId: "003A",
            parentName: "Gonzalez Rose",
            parentType: "contact"
        };

        expect(buildDefaultTaskLookups({
            assignedOptions: [assigned],
            context,
            nameOptions: [contact],
            relatedOptions: [account]
        })).toEqual({
            assigned,
            name: contact,
            related: account
        });
    });

    it("builds activity lookup payloads for task and event creation", () => {
        expect(buildActivityLookupPayload({
            assigned: { id: "005A", label: "Yoshikawa Taiki", objectLabel: "ユーザー" },
            name: { id: "00QA", label: "Pyramid Construction", objectLabel: "リード" },
            related: { id: "006A", label: "Edge Renewal", objectLabel: "商談" }
        })).toEqual({
            OwnerId: "005A",
            WhoId: "00QA",
            WhatId: "006A"
        });
    });

    it("maps lookup labels to API objects and back", () => {
        expect(getLookupApiObject("取引先")).toBe("account");
        expect(getLookupApiObject("取引先責任者")).toBe("contact");
        expect(getLookupApiObject("ユーザー")).toBe("user");
        expect(getLookupObjectLabel("account")).toBe("取引先");
        expect(getLookupObjectLabel("contact")).toBe("取引先責任者");
        expect(getLookupObjectLabel("user")).toBe("ユーザー");
    });
});
