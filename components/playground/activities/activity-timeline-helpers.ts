import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import type { ActivityRecordContext } from "./activity-task-form";
import { buildDateValue } from "./activity-date-utils";
import { formatDateOnly } from "../utils/formatting";

export type TaskStatusOverride = {
    pending?: boolean;
    previousStatus: string;
    status: string;
};

export type ActivityTimelineSection = {
    activities: ActivityTimelineItem[];
    aside?: string;
    history: boolean;
    key: string;
    title: string;
};

export function getActivityTimelineEntryKey(activity: ActivityTimelineItem) {
    return `${activity.type}-${activity.id}`;
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

export function formatTaskDueDate(value?: string): string {
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

    return formatDateOnly(value);
}

export function getTaskSummary(
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
