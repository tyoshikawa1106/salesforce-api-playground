"use client";

import { useState } from "react";
import {
    getDefaultEventForm,
    getDefaultLoggedCallTaskForm,
    getDefaultTaskForm,
    type ActivityLookupState,
    type EventForm,
    type EventFormErrors,
    type TaskForm,
    type TaskFormErrors
} from "./activity-task-form";
import type { ActivityComposerKind } from "./ActivityPanel";

export function useActivityComposerState(defaultLookups: ActivityLookupState) {
    const [eventForm, setEventForm] = useState<EventForm>(() => getDefaultEventForm());
    const [eventFormErrors, setEventFormErrors] = useState<EventFormErrors>({});
    const [taskForm, setTaskForm] = useState<TaskForm>(() => getDefaultTaskForm());
    const [taskFormErrors, setTaskFormErrors] = useState<TaskFormErrors>({});
    const [activeComposer, setActiveComposer] = useState<ActivityComposerKind | null>(null);
    const [composerExpanded, setComposerExpanded] = useState(false);
    const [composerMinimized, setComposerMinimized] = useState(false);
    const [activityLookups, setActivityLookups] = useState<ActivityLookupState>(() => defaultLookups);

    function closeComposer() {
        setActiveComposer(null);
        setComposerExpanded(false);
        setComposerMinimized(false);
        setActivityLookups(defaultLookups);
        setEventFormErrors({});
        setTaskFormErrors({});
    }

    function openComposer(composer: ActivityComposerKind) {
        setActivityLookups(defaultLookups);
        setComposerMinimized(false);
        if (composer === "event") {
            setEventForm(getDefaultEventForm());
        } else {
            setTaskForm(composer === "call" ? getDefaultLoggedCallTaskForm() : getDefaultTaskForm());
        }
        setActiveComposer(composer);
    }

    return {
        activeComposer,
        activityLookups,
        closeComposer,
        composerExpanded,
        composerMinimized,
        eventForm,
        eventFormErrors,
        openComposer,
        setActivityLookups,
        setComposerExpanded,
        setComposerMinimized,
        setEventForm,
        setEventFormErrors,
        setTaskForm,
        setTaskFormErrors,
        taskForm,
        taskFormErrors,
        toggleComposerExpanded: () => {
            setComposerMinimized(false);
            setComposerExpanded((current) => !current);
        },
        toggleComposerMinimized: () => {
            setComposerExpanded(false);
            setComposerMinimized((current) => !current);
        },
        updateEventForm: (value: EventForm) => {
            setEventForm(value);
            setEventFormErrors({});
        },
        updateLookups: (value: ActivityLookupState) => {
            setActivityLookups(value);
            setEventFormErrors({});
            setTaskFormErrors({});
        },
        updateTaskForm: (value: TaskForm) => {
            setTaskForm(value);
            setTaskFormErrors({});
        }
    };
}
