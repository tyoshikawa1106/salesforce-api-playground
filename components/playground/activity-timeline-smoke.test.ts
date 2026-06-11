import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActivityTimeline } from "./ActivityCard";
import { ActivityPanel } from "./ActivityPanel";
import type { ActivityTimelineSection } from "./ActivityTimeline";
import { getDefaultEventForm, getDefaultTaskForm } from "./activity-task-form";
import {
    accountFixture as account,
    activityFixture as activity,
    noop
} from "./test-fixtures";
import type { Activity } from "./types";

const downIconPath = "M83 140h354c10 0 17 13 9 22L273 374c-6 8-19 8-25 0L73 162c-7-9-1-22 10-22";
const rightIconPath = "M140 437V83c0-10 13-17 22-9l212 173c8 6 8 19 0 25L162 447c-9 7-22 1-22-10";

describe("activity timeline smoke rendering", () => {
    it("renders timeline sections expanded by default", () => {
        const markup = renderToStaticMarkup(
            createElement(ActivityPanel, {
                activeComposer: null,
                activities: [activity],
                composerExpanded: false,
                composerMinimized: false,
                context: {
                    parentId: account.Id,
                    parentName: account.Name,
                    parentType: "account"
                },
                eventForm: getDefaultEventForm(),
                eventFormErrors: {},
                lookupOptions: {
                    assigned: [],
                    name: [],
                    related: []
                },
                lookups: {},
                loading: false,
                message: "",
                saving: false,
                taskStatusOverrides: {},
                taskForm: getDefaultTaskForm(),
                taskFormErrors: {},
                onCloseComposer: noop,
                onEventFormChange: noop,
                onLookupChange: noop,
                onOpenCallComposer: noop,
                onOpenEventComposer: noop,
                onOpenTaskComposer: noop,
                onRefresh: noop,
                onSaveEvent: noop,
                onSaveTask: noop,
                onTaskFormChange: noop,
                onToggleComposerExpanded: noop,
                onToggleComposerMinimized: noop,
                onToggleTaskCompleted: noop
            })
        );

        expect(markup).toContain("すべて展開");
        expect(markup).toContain("aria-expanded=\"true\"");
        expect(markup).toContain(activity.subject);
        expect(markup).not.toContain("slds-timeline__item_details");
    });

    it("renders an interactive empty timeline section", () => {
        const markup = renderToStaticMarkup(
            createElement(ActivityPanel, {
                activeComposer: null,
                activities: [],
                composerExpanded: false,
                composerMinimized: false,
                context: {
                    parentId: account.Id,
                    parentName: account.Name,
                    parentType: "account"
                },
                eventForm: getDefaultEventForm(),
                eventFormErrors: {},
                lookupOptions: {
                    assigned: [],
                    name: [],
                    related: []
                },
                lookups: {},
                loading: false,
                message: "",
                saving: false,
                taskStatusOverrides: {},
                taskForm: getDefaultTaskForm(),
                taskFormErrors: {},
                onCloseComposer: noop,
                onEventFormChange: noop,
                onLookupChange: noop,
                onOpenCallComposer: noop,
                onOpenEventComposer: noop,
                onOpenTaskComposer: noop,
                onRefresh: noop,
                onSaveEvent: noop,
                onSaveTask: noop,
                onTaskFormChange: noop,
                onToggleComposerExpanded: noop,
                onToggleComposerMinimized: noop,
                onToggleTaskCompleted: noop
            })
        );

        expect(markup).toContain("すべて折りたたむ");
        expect(markup).toContain("<button class=\"slds-button_reset slds-text-link\" type=\"button\">すべて折りたたむ</button>");
        expect(markup).toContain("aria-expanded=\"true\"");
        expect(markup).toContain("表示できる活動はまだありません。");
    });

    it("renders activity timeline entries with record action menus", () => {
        const callActivity = { ...activity, taskSubtype: "Call" } as Extract<Activity, { type: "task" }>;

        const markup = renderToStaticMarkup(
            createElement(ActivityTimeline, {
                context: {
                    parentId: account.Id,
                    parentName: account.Name,
                    parentType: "account"
                },
                expandedActivityKeys: new Set<string>(),
                expandedSectionKeys: new Set(["future"]),
                openActionActivityId: activity.id,
                sections: [{
                    activities: [callActivity],
                    history: false,
                    key: "future",
                    title: "今後 & 期限切れ"
                }],
                taskStatusOverrides: {},
                onCloseActionMenu: noop,
                onDeleteActivity: noop,
                onEditActivity: noop,
                onToggleActivity: noop,
                onOpenActivity: noop,
                onToggleActionMenu: noop,
                onToggleSection: noop,
                onToggleTaskCompleted: noop
            })
        );

        expect(markup).toContain("ToDo Call の操作");
        expect(markup).toContain("slds-icon-standard-log-a-call");
        expect(markup).toContain("slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open");
        expect(markup).toContain("aria-expanded=\"true\"");
        expect(markup).toContain("role=\"menu\"");
        expect(markup).toContain("role=\"menuitem\"");
        expect(markup).toContain("編集");
        expect(markup).toContain("削除");
    });

    it("uses different section icons for expanded and collapsed sections", () => {
        const sections: ActivityTimelineSection[] = [{
            activities: [activity],
            history: false,
            key: "future",
            title: "今後 & 期限切れ"
        }];
        const baseProps = {
            context: {
                parentId: account.Id,
                parentName: account.Name,
                parentType: "account"
            },
            expandedActivityKeys: new Set<string>(),
            openActionActivityId: null,
            sections,
            taskStatusOverrides: {},
            onCloseActionMenu: noop,
            onDeleteActivity: noop,
            onEditActivity: noop,
            onToggleActivity: noop,
            onOpenActivity: noop,
            onToggleActionMenu: noop,
            onToggleSection: noop,
            onToggleTaskCompleted: noop
        } as const;
        const expandedMarkup = renderToStaticMarkup(
            createElement(ActivityTimeline, {
                ...baseProps,
                expandedSectionKeys: new Set(["future"])
            })
        );
        const collapsedMarkup = renderToStaticMarkup(
            createElement(ActivityTimeline, {
                ...baseProps,
                expandedSectionKeys: new Set<string>()
            })
        );

        expect(expandedMarkup).toContain(downIconPath);
        expect(expandedMarkup).not.toContain(rightIconPath);
        expect(expandedMarkup).not.toContain("slds-section__title-action-icon");
        expect(collapsedMarkup).toContain(rightIconPath);
        expect(collapsedMarkup).not.toContain(downIconPath);
        expect(collapsedMarkup).not.toContain("slds-section__title-action-icon");
    });

    it("hides the empty timeline message when an empty section is collapsed", () => {
        const sections: ActivityTimelineSection[] = [{
            activities: [],
            history: false,
            key: "future",
            title: "今後 & 期限切れ"
        }];
        const markup = renderToStaticMarkup(
            createElement(ActivityTimeline, {
                context: {
                    parentId: account.Id,
                    parentName: account.Name,
                    parentType: "account"
                },
                expandedActivityKeys: new Set<string>(),
                expandedSectionKeys: new Set<string>(),
                openActionActivityId: null,
                sections,
                taskStatusOverrides: {},
                onCloseActionMenu: noop,
                onDeleteActivity: noop,
                onEditActivity: noop,
                onToggleActivity: noop,
                onOpenActivity: noop,
                onToggleActionMenu: noop,
                onToggleSection: noop,
                onToggleTaskCompleted: noop
            })
        );

        expect(markup).toContain("aria-expanded=\"false\"");
        expect(markup).toContain(rightIconPath);
        expect(markup).not.toContain("表示できる活動はまだありません。");
    });

    it("expands activity item details when entry keys are expanded", () => {
        const sections: ActivityTimelineSection[] = [{
            activities: [activity],
            history: false,
            key: "future",
            title: "今後 & 期限切れ"
        }];
        const markup = renderToStaticMarkup(
            createElement(ActivityTimeline, {
                context: {
                    parentId: account.Id,
                    parentName: account.Name,
                    parentType: "account"
                },
                expandedActivityKeys: new Set([`${activity.type}-${activity.id}`]),
                expandedSectionKeys: new Set(["future"]),
                openActionActivityId: null,
                sections,
                taskStatusOverrides: {},
                onCloseActionMenu: noop,
                onDeleteActivity: noop,
                onEditActivity: noop,
                onToggleActivity: noop,
                onOpenActivity: noop,
                onToggleActionMenu: noop,
                onToggleSection: noop,
                onToggleTaskCompleted: noop
            })
        );

        expect(markup).toContain(`${activity.subject} の詳細を閉じる`);
        expect(markup).toContain("slds-timeline__item_details");
    });
});
