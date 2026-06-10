"use client";

import { useState } from "react";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import { buildDateValue, type ActivityRecordContext } from "./activity-task-form";
import { formatDate } from "./formatting";
import { RecordTableActions } from "./RecordListTableParts";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

export type TaskStatusOverride = {
    previousStatus: string;
    status: string;
};

type ActivityTimelineSection = {
    activities: ActivityTimelineItem[];
    aside?: string;
    history: boolean;
    key: string;
    title: string;
};

export function ActivityTimeline({
    context,
    expandedSectionKeys,
    openActionActivityId,
    sections,
    taskStatusOverrides,
    onCloseActionMenu,
    onDeleteActivity,
    onEditActivity,
    onToggleSection,
    onToggleTaskCompleted,
    onOpenActivity,
    onToggleActionMenu
}: {
    context: ActivityRecordContext;
    expandedSectionKeys: Set<string>;
    openActionActivityId: string | null;
    sections: ActivityTimelineSection[];
    taskStatusOverrides: Record<string, TaskStatusOverride>;
    onCloseActionMenu: () => void;
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onToggleSection: (key: string) => void;
    onToggleTaskCompleted: (activity: Extract<ActivityTimelineItem, { type: "task" }>) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    onToggleActionMenu: (activityId: string) => void;
}) {
    return (
        <section className="playground-activity-timeline">
            {sections.length === 0 ? (
                <>
                    <ActivityTimelineSectionTitle title="今後 & 期限切れ" />
                    <ActivityTimelineEmpty />
                </>
            ) : (
                sections.map((section) => {
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
                                <ul className="slds-timeline playground-activity-timeline__list">
                                    {section.activities.map((activity) => (
                                        <ActivityTimelineEntry
                                            actionMenuOpen={openActionActivityId === activity.id}
                                            activity={activity}
                                            context={context}
                                            history={section.history}
                                            key={`${activity.type}-${activity.id}`}
                                            statusOverride={activity.type === "task" ? taskStatusOverrides[activity.id] : undefined}
                                            onCloseActionMenu={onCloseActionMenu}
                                            onDeleteActivity={onDeleteActivity}
                                            onEditActivity={onEditActivity}
                                            onToggleTaskCompleted={onToggleTaskCompleted}
                                            onOpenActivity={onOpenActivity}
                                            onToggleActionMenu={() => onToggleActionMenu(activity.id)}
                                        />
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    );
                })
            )}
        </section>
    );
}

export function groupActivityTimelineSections(
    activities: ActivityTimelineItem[],
    taskStatusOverrides: Record<string, TaskStatusOverride>
): ActivityTimelineSection[] {
    const futureActivities = activities.filter((activity) => !isHistoryActivity(activity, taskStatusOverrides));
    const historyActivities = activities.filter((activity) => isHistoryActivity(activity, taskStatusOverrides));
    const sections: ActivityTimelineSection[] = [];

    if (futureActivities.length > 0) {
        sections.push({
            activities: futureActivities,
            history: false,
            key: "future",
            title: "今後 & 期限切れ"
        });
    }

    for (const [monthKey, monthActivities] of groupHistoryActivitiesByMonth(historyActivities).entries()) {
        sections.push({
            activities: monthActivities,
            aside: monthKey === buildDateValue(new Date()).slice(0, 7) ? "今月" : undefined,
            history: true,
            key: `month-${monthKey}`,
            title: formatTimelineMonthTitle(monthKey)
        });
    }

    return sections;
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
                <UtilityIcon className={`slds-section__title-action-icon slds-button__icon slds-button__icon_left playground-activity-section-icon ${
                    expanded ? "" : "playground-activity-section-icon_collapsed"
                }`} name="switch" />
                <span className="slds-truncate" title={title}>{title}</span>
                {aside ? <span className="slds-text-body_regular playground-activity-section-title__aside">{aside}</span> : null}
            </button>
        </h3>
    );
}

function isHistoryActivity(
    activity: ActivityTimelineItem,
    taskStatusOverrides: Record<string, TaskStatusOverride>
): boolean {
    if (activity.type === "task") {
        return activity.status === "Completed" && !taskStatusOverrides[activity.id];
    }

    if (!activity.startDateTime) {
        return false;
    }

    return new Date(activity.startDateTime).getTime() < Date.now();
}

function groupHistoryActivitiesByMonth(
    activities: ActivityTimelineItem[]
): Map<string, ActivityTimelineItem[]> {
    const groups = new Map<string, ActivityTimelineItem[]>();

    for (const activity of activities) {
        const activityDate = activity.type === "task" ? activity.date : activity.startDateTime;
        const monthKey = activityDate ? activityDate.slice(0, 7) : "no-date";
        groups.set(monthKey, [...(groups.get(monthKey) ?? []), activity]);
    }

    return new Map([...groups.entries()].sort(([a], [b]) => b.localeCompare(a)));
}

function formatTimelineMonthTitle(monthKey: string): string {
    if (monthKey === "no-date") {
        return "期日なし";
    }

    const [year, month] = monthKey.split("-");
    return `${Number(month)}月・${year}`;
}

function ActivityTimelineEmpty() {
    return (
        <div className="slds-p-vertical_small slds-text-align_center slds-text-color_weak playground-activity-empty">
            表示できる活動はまだありません。
        </div>
    );
}

function ActivityTimelineEntry({
    actionMenuOpen,
    activity,
    context,
    history = false,
    statusOverride,
    onCloseActionMenu,
    onDeleteActivity,
    onEditActivity,
    onToggleTaskCompleted,
    onOpenActivity,
    onToggleActionMenu,
    preview = false
}: {
    actionMenuOpen: boolean;
    activity: ActivityTimelineItem;
    context: ActivityRecordContext;
    history?: boolean;
    statusOverride?: TaskStatusOverride;
    onCloseActionMenu: () => void;
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onToggleTaskCompleted: (activity: Extract<ActivityTimelineItem, { type: "task" }>) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    onToggleActionMenu: () => void;
    preview?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const isTask = activity.type === "task";
    const effectiveTaskStatus = isTask ? statusOverride?.status ?? activity.status ?? "" : "";
    const isCompletedTask = effectiveTaskStatus === "Completed";
    const showTaskCheckbox = isTask && !history;
    const date = isTask ? formatTaskDueDate(activity.date) : formatDate(activity.startDateTime);
    const title = activity.subject || (isTask ? "ToDo" : "行動");
    const itemClassName = isTask ? "slds-timeline__item_task" : "slds-timeline__item_event";
    const expandedClassName = expanded ? "slds-is-open" : "";
    const titleClassName = isCompletedTask && !history ? "playground-activity-timeline-item__title_completed" : undefined;
    const taskSummary = isTask ? getTaskSummary(activity, context, isCompletedTask) : "";
    const objectLabel = isTask ? "ToDo" : "行動";
    const actionRecordLabel = `${objectLabel} ${title}`;

    return (
        <li>
            <div className={`slds-timeline__item_expandable ${itemClassName} ${expandedClassName} playground-activity-timeline-item`}>
                <span className="slds-assistive-text">{isTask ? "ToDo" : "行動"}</span>
                <div className="slds-media">
                    <div className="slds-media__figure">
                        <button
                            className="slds-button slds-button_icon"
                            type="button"
                            aria-expanded={expanded}
                            title={expanded ? `${title} の詳細を閉じる` : `${title} の詳細を表示`}
                            onClick={() => setExpanded((current) => !current)}
                        >
                            <UtilityIcon className={`slds-button__icon slds-timeline__details-action-icon playground-activity-entry-icon ${
                                expanded ? "" : "playground-activity-entry-icon_collapsed"
                            }`} name="switch" />
                            <span className="slds-assistive-text">{expanded ? `${title} の詳細を閉じる` : `${title} の詳細を表示`}</span>
                        </button>
                        <span className={`slds-icon_container ${isTask ? "slds-icon-standard-task" : "slds-icon-standard-event"} slds-timeline__icon`} title={isTask ? "ToDo" : "行動"}>
                            <StandardIcon className="slds-icon slds-icon_small" name={isTask ? "task" : "event"} />
                            <span className="slds-assistive-text">{isTask ? "ToDo" : "行動"}</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                            <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                {showTaskCheckbox ? (
                                    <span className="slds-checkbox playground-activity-checkbox">
                                        <input
                                            id={`activity-checkbox-${activity.id}`}
                                            type="checkbox"
                                            checked={isCompletedTask}
                                            disabled={preview}
                                            onChange={() => onToggleTaskCompleted(activity)}
                                        />
                                        <label className="slds-checkbox__label" htmlFor={`activity-checkbox-${activity.id}`}>
                                            <span className="slds-checkbox_faux" />
                                            <span className="slds-form-element__label slds-assistive-text">完了としてマーク</span>
                                        </label>
                                    </span>
                                ) : null}
                                <h4 className="slds-truncate" title={title}>
                                    <a
                                        className={titleClassName}
                                        href={`#activity-${activity.type}-${encodeURIComponent(activity.id)}`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            onOpenActivity?.(activity);
                                        }}
                                    >
                                        <strong>{title}</strong>
                                    </a>
                                </h4>
                            </div>
                            <div className="slds-timeline__actions slds-timeline__actions_inline">
                                <p className={date === "昨日" && !history ? "slds-timeline__date slds-text-color_error" : "slds-timeline__date"}>{date}</p>
                                <RecordTableActions
                                    record={activity}
                                    recordLabel={actionRecordLabel}
                                    open={actionMenuOpen}
                                    onToggle={onToggleActionMenu}
                                    onClose={onCloseActionMenu}
                                    onEdit={(record) => onEditActivity?.(record)}
                                    onDelete={(record) => onDeleteActivity?.(record)}
                                />
                            </div>
                        </div>
                        <p className="slds-m-horizontal_xx-small slds-text-body_small">
                            {isTask ? (
                                taskSummary
                            ) : (
                                <>
                                    行動
                                    {activity.location ? ` / ${activity.location}` : ""}
                                </>
                            )}
                        </p>
                        {expanded ? (
                            <article className="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small">
                                {!isTask ? (
                                    <>
                                        <p className="slds-text-title slds-m-bottom_xx-small">場所</p>
                                        <p className="slds-text-body_regular slds-m-bottom_small">{activity.location}</p>
                                    </>
                                ) : null}
                                <p className="slds-text-title slds-m-bottom_xx-small">説明</p>
                                <p className="slds-text-body_regular playground-activity-timeline-item__description">{activity.description}</p>
                            </article>
                        ) : null}
                    </div>
                </div>
            </div>
        </li>
    );
}

function formatTaskDueDate(value?: string): string {
    if (!value) {
        return "期日なし";
    }

    const today = buildDateValue(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayValue = buildDateValue(yesterday);

    if (value === today) {
        return "今日";
    }

    if (value === yesterdayValue) {
        return "昨日";
    }

    return formatDate(value);
}

function getTaskSummary(
    activity: Extract<ActivityTimelineItem, { type: "task" }>,
    context: ActivityRecordContext,
    completed: boolean
) {
    if (completed) {
        return "ToDo がありました";
    }

    const contactName = activity.whoName || (context.parentType === "contact" ? context.parentName : "");
    if (contactName) {
        return `${contactName} さんとの今後の ToDo があります`;
    }

    return "今後の ToDo があります";
}
