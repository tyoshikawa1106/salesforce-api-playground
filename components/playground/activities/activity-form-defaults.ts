import type { EventForm, TaskForm } from "./activity-task-types";
import { buildDateTimeValue, buildDateValue } from "./activity-date-utils";

export const taskSubjectOptions = ["", "Call", "Email", "Send Letter", "Send Quote", "Other"] as const;

export function getDefaultTaskForm(): TaskForm {
    return {
        Subject: "",
        ActivityDate: buildDateValue(new Date()),
        Status: "Not Started",
        Priority: "Normal",
        TaskSubtype: undefined,
        Description: ""
    };
}

export function getDefaultLoggedCallTaskForm(): TaskForm {
    return {
        Subject: "Call",
        ActivityDate: buildDateValue(new Date()),
        Status: "Completed",
        Priority: "Normal",
        TaskSubtype: "Call",
        Description: ""
    };
}

export function getDefaultEventForm(): EventForm {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return {
        Subject: "",
        StartDateTime: buildDateTimeValue(start),
        EndDateTime: buildDateTimeValue(end),
        Location: "",
        Description: ""
    };
}
