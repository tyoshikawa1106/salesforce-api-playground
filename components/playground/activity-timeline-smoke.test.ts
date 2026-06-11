import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActivityTimeline } from "./ActivityCard";
import {
    accountFixture as account,
    activityFixture as activity,
    noop
} from "./test-fixtures";
import type { Activity } from "./types";

describe("activity timeline smoke rendering", () => {
    it("renders activity timeline entries with record action menus", () => {
        const callActivity = { ...activity, taskSubtype: "Call" } as Extract<Activity, { type: "task" }>;

        const markup = renderToStaticMarkup(
            createElement(ActivityTimeline, {
                context: {
                    parentId: account.Id,
                    parentName: account.Name,
                    parentType: "account"
                },
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
});
