"use client";

import { useState } from "react";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import type { ActivityRecordContext } from "./activity-task-form";
import { formatDate } from "./formatting";
import { RecordTableActions } from "./RecordListTableParts";
import { StandardIcon, UtilityIcon } from "./SldsIcon";
import {
    formatTaskDueDate,
    getTaskSummary,
    type TaskStatusOverride
} from "./activity-timeline-helpers";

export function ActivityTimelineEntry({
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
    const isCallTask = isTask && activity.taskSubtype === "Call";
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
    const iconLabel = isCallTask ? "電話" : objectLabel;
    const iconClassName = isCallTask ? "slds-icon-action-call" : isTask ? "slds-icon-standard-task" : "slds-icon-standard-event";
    const iconName = isCallTask ? "call" : isTask ? "task" : "event";

    return (
        <li>
            <div className={`slds-timeline__item_expandable ${itemClassName} ${expandedClassName} playground-activity-timeline-item`}>
                <span className="slds-assistive-text">{iconLabel}</span>
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
                        <span className={`slds-icon_container ${iconClassName} slds-timeline__icon`} title={iconLabel}>
                            <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
                            <span className="slds-assistive-text">{iconLabel}</span>
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
