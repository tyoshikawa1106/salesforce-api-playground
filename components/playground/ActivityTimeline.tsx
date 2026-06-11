"use client";

import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import type { ActivityRecordContext } from "./activity-task-form";
import { ActivityTimelineEntry } from "./ActivityTimelineEntry";
import {
    getActivityTimelineEntryKey,
    groupActivityTimelineSections,
    type ActivityTimelineSection,
    type TaskStatusOverride
} from "./activity-timeline-helpers";
import { UtilityIcon } from "./SldsIcon";

export type {
    ActivityTimelineSection,
    TaskStatusOverride
} from "./activity-timeline-helpers";
export {
    getActivityTimelineEntryKey,
    groupActivityTimelineSections
} from "./activity-timeline-helpers";

export function ActivityTimeline({
    context,
    expandedActivityKeys,
    expandedSectionKeys,
    openActionActivityId,
    sections,
    taskStatusOverrides,
    onCloseActionMenu,
    onDeleteActivity,
    onEditActivity,
    onToggleActivity,
    onToggleSection,
    onToggleTaskCompleted,
    onOpenActivity,
    onToggleActionMenu
}: {
    context: ActivityRecordContext;
    expandedActivityKeys: Set<string>;
    expandedSectionKeys: Set<string>;
    openActionActivityId: string | null;
    sections: ActivityTimelineSection[];
    taskStatusOverrides: Record<string, TaskStatusOverride>;
    onCloseActionMenu: () => void;
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onToggleActivity: (key: string) => void;
    onToggleSection: (key: string) => void;
    onToggleTaskCompleted: (activity: Extract<ActivityTimelineItem, { type: "task" }>) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    onToggleActionMenu: (activityId: string) => void;
}) {
    return (
        <section className="playground-activity-timeline">
            {sections.map((section) => {
                const expanded = expandedSectionKeys.has(section.key);

                return (
                    <div className="playground-activity-timeline__section" key={section.key}>
                        <ActivityTimelineSectionTitle
                            aside={section.aside}
                            expanded={expanded}
                            title={section.title}
                            onToggle={() => onToggleSection(section.key)}
                        />
                        {expanded ? (
                            section.activities.length === 0 ? (
                                <ActivityTimelineEmpty />
                            ) : (
                                <ul className="slds-timeline playground-activity-timeline__list">
                                    {section.activities.map((activity) => {
                                        const activityKey = getActivityTimelineEntryKey(activity);

                                        return (
                                            <ActivityTimelineEntry
                                                actionMenuOpen={openActionActivityId === activity.id}
                                                activity={activity}
                                                context={context}
                                                expanded={expandedActivityKeys.has(activityKey)}
                                                history={section.history}
                                                key={activityKey}
                                                statusOverride={activity.type === "task" ? taskStatusOverrides[activity.id] : undefined}
                                                onCloseActionMenu={onCloseActionMenu}
                                                onDeleteActivity={onDeleteActivity}
                                                onEditActivity={onEditActivity}
                                                onToggleTaskCompleted={onToggleTaskCompleted}
                                                onToggleExpanded={() => onToggleActivity(activityKey)}
                                                onOpenActivity={onOpenActivity}
                                                onToggleActionMenu={() => onToggleActionMenu(activity.id)}
                                            />
                                        );
                                    })}
                                </ul>
                            )
                        ) : null}
                    </div>
                );
            })}
        </section>
    );
}

function ActivityTimelineSectionTitle({
    aside,
    expanded = false,
    onToggle,
    title
}: {
    aside?: string;
    expanded?: boolean;
    onToggle?: () => void;
    title: string;
}) {
    return (
        <h3 className="slds-section__title playground-activity-section-title">
            <button
                className="slds-button slds-section__title-action playground-activity-section-title__content"
                type="button"
                aria-expanded={expanded}
                onClick={onToggle}
            >
                <UtilityIcon
                    className="slds-button__icon slds-button__icon_left playground-activity-section-icon"
                    name={expanded ? "down" : "right"}
                />
                <span className="slds-truncate" title={title}>{title}</span>
                {aside ? <span className="slds-text-body_regular playground-activity-section-title__aside">{aside}</span> : null}
            </button>
        </h3>
    );
}

function ActivityTimelineEmpty() {
    return (
        <div className="slds-p-vertical_small slds-text-align_center slds-text-color_weak playground-activity-empty">
            表示できる活動はまだありません。
        </div>
    );
}
