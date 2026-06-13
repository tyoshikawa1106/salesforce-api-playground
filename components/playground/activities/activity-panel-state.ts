import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import {
    getActivityTimelineEntryKey,
    groupActivityTimelineSections,
    type ActivityTimelineSection,
    type TaskStatusOverride
} from "./activity-timeline-helpers";

export const emptyFutureActivityTimelineSection: ActivityTimelineSection = {
    activities: [],
    history: false,
    key: "future",
    title: "今後 & 期限切れ"
};

export type ActivityTimelineExpansionState = {
    collapsedSectionKeys: Set<string>;
    expandedActivityKeys: Set<string>;
};

export function getDisplayedTimelineSections(
    activities: ActivityTimelineItem[],
    taskStatusOverrides: Record<string, TaskStatusOverride>
): ActivityTimelineSection[] {
    const sections = groupActivityTimelineSections(activities, taskStatusOverrides);
    return sections.length > 0 ? sections : [emptyFutureActivityTimelineSection];
}

export function getActivityTimelineKeys(sections: ActivityTimelineSection[]): string[] {
    return sections.flatMap((section) => section.activities.map(getActivityTimelineEntryKey));
}

export function getExpandedSectionKeys(
    sections: ActivityTimelineSection[],
    collapsedSectionKeys: Set<string>
): Set<string> {
    return new Set(
        sections
            .map((section) => section.key)
            .filter((key) => !collapsedSectionKeys.has(key))
    );
}

export function areAllTimelineSectionsExpanded(
    sections: ActivityTimelineSection[],
    collapsedSectionKeys: Set<string>
): boolean {
    return sections.every((section) => !collapsedSectionKeys.has(section.key));
}

export function areAllTimelineActivitiesExpanded(
    activityKeys: string[],
    expandedActivityKeys: Set<string>
): boolean {
    return activityKeys.length === 0 || activityKeys.every((key) => expandedActivityKeys.has(key));
}

export function areAllTimelineItemsExpanded({
    activityKeys,
    collapsedSectionKeys,
    expandedActivityKeys,
    sections
}: {
    activityKeys: string[];
    collapsedSectionKeys: Set<string>;
    expandedActivityKeys: Set<string>;
    sections: ActivityTimelineSection[];
}): boolean {
    return areAllTimelineSectionsExpanded(sections, collapsedSectionKeys)
        && areAllTimelineActivitiesExpanded(activityKeys, expandedActivityKeys);
}

export function toggleSetValue(values: Set<string>, value: string): Set<string> {
    const next = new Set(values);
    if (next.has(value)) {
        next.delete(value);
    } else {
        next.add(value);
    }

    return next;
}

export function getNextTimelineExpansionState({
    activityKeys,
    allTimelineExpanded,
    sections
}: {
    activityKeys: string[];
    allTimelineExpanded: boolean;
    sections: ActivityTimelineSection[];
}): ActivityTimelineExpansionState {
    return {
        collapsedSectionKeys: allTimelineExpanded
            ? new Set(sections.map((section) => section.key))
            : new Set(),
        expandedActivityKeys: allTimelineExpanded
            ? new Set()
            : new Set(activityKeys)
    };
}
