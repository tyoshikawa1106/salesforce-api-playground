import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountRecordPage, ActivityRecordPage, ContactRecordPage } from "./RecordPages";
import {
    accountFixture as account,
    activityFixture as activity,
    contactFixture as contact,
    noop
} from "../utils/test-fixtures";
import type { Activity } from "../utils/types";

describe("record page smoke rendering", () => {
    it("renders account and contact record pages with detail sections", () => {
        const accountMarkup = renderToStaticMarkup(
            createElement(AccountRecordPage, {
                account,
                contacts: [contact],
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpenContact: noop,
                onRefresh: noop
            })
        );
        const contactMarkup = renderToStaticMarkup(
            createElement(ContactRecordPage, {
                contact,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpenAccount: noop,
                onRefresh: noop
            })
        );
        const activityMarkup = renderToStaticMarkup(
            createElement(ActivityRecordPage, {
                activity,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpenAccountById: noop,
                onOpenContactById: noop,
                onRefresh: noop
            })
        );

        expect(accountMarkup).toContain("詳細");
        expect(accountMarkup).toContain("関連");
        expect(accountMarkup).toContain("今後 &amp; 期限切れ");
        expect(accountMarkup).not.toContain("条件: 常時・すべての活動・すべての種別");
        expect(accountMarkup).not.toContain("活動設定");
        expect(accountMarkup).not.toContain("すべて表示");
        expect(accountMarkup).not.toContain("すべての活動を表示");
        expect(accountMarkup).not.toContain("表示する内容を変更するには、検索条件を変更してください。");
        expect(accountMarkup).toContain("slds-grid slds-wrap slds-gutters_small slds-m-top_small");
        expect(accountMarkup).toContain("slds-large-size_8-of-12");
        expect(accountMarkup).toContain("slds-large-size_4-of-12");
        expect(accountMarkup).toContain("slds-tabs_default slds-tabs_card");
        expect(accountMarkup).toContain("slds-tabs_default__content slds-show slds-p-around_x-small");
        expect(accountMarkup).toContain("aria-controls=\"record-details-panel\"");
        expect(accountMarkup).toContain("aria-labelledby=\"record-details-tab\"");
        expect(accountMarkup).toContain("aria-controls=\"activity-related-panel\"");
        expect(accountMarkup).not.toContain("Chatter");
        expect(accountMarkup).not.toContain("取引先責任者 (1)");
        expect(accountMarkup).not.toContain("新規取引先責任者");
        expect(accountMarkup).not.toContain("slds-box slds-box_x-small slds-theme_default\"><div class=\"slds-grid slds-wrap slds-gutters_x-small");
        expect(accountMarkup).toContain("slds-button-group");
        expect(accountMarkup).not.toContain("slds-button_destructive");
        expect(contactMarkup).toContain("取引先");
        expect(contactMarkup).toContain("slds-button_reset slds-text-link");
        expect(contactMarkup).toContain("電話を記録");
        expect(contactMarkup).toContain("slds-icon-standard-log-a-call");
        expect(contactMarkup).toContain("新規ToDo");
        expect(contactMarkup).toContain("新規行動");
        expect(contactMarkup.indexOf("新規ToDo")).toBeLessThan(contactMarkup.indexOf("電話を記録"));
        expect(contactMarkup.indexOf("新規行動")).toBeLessThan(contactMarkup.indexOf("電話を記録"));
        expect(contactMarkup).toContain("今後 &amp; 期限切れ");
        expect(contactMarkup).not.toContain("aria-controls=\"activity-related-panel\"");
        expect(contactMarkup).not.toContain("Chatter");
        expect(contactMarkup).not.toContain("この取引先責任者に関連する活動はまだありません。");
        expect(contactMarkup).toContain("slds-grid slds-wrap slds-gutters_small slds-m-top_small");
        expect(contactMarkup).not.toContain("新規ケース");
        expect(activityMarkup).toContain("ToDo");
        expect(activityMarkup).toContain("slds-button_reset slds-text-link");
        expect(activityMarkup).toContain("2026/06/08");
        expect(activityMarkup).not.toContain("2026/06/08 9:00");
        expect(activityMarkup).toContain("slds-icon-standard-task");
        expect(activityMarkup).toContain("Taro Yamada");
        expect(activityMarkup).toContain("Acme");
        expect(activityMarkup).toContain("システム情報");
        expect(activityMarkup).toContain("作成日");
        expect(activityMarkup).toContain("最終更新日");
        expect(activityMarkup).toContain("slds-m-top_small");
        expect(activityMarkup).not.toContain("slds-large-size_4-of-12");
        expect(activityMarkup).not.toContain("新規ToDo");
        expect(activityMarkup).not.toContain("aria-controls=\"activity-related-panel\"");
    });

    it("renders activity detail header icons by activity type", () => {
        const eventMarkup = renderToStaticMarkup(
            createElement(ActivityRecordPage, {
                activity: {
                    ...activity,
                    type: "event",
                    id: "00Uxx0000012345",
                    startDateTime: "2026-06-08T10:00:00.000Z",
                    endDateTime: "2026-06-08T11:00:00.000Z",
                    location: "Online"
                },
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpenAccountById: noop,
                onOpenContactById: noop,
                onRefresh: noop
            })
        );
        const callMarkup = renderToStaticMarkup(
            createElement(ActivityRecordPage, {
                activity: {
                    ...(activity as Extract<Activity, { type: "task" }>),
                    taskSubtype: "Call"
                },
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpenAccountById: noop,
                onOpenContactById: noop,
                onRefresh: noop
            })
        );

        expect(eventMarkup).toContain("slds-icon-standard-event");
        expect(eventMarkup).not.toContain("slds-icon-standard-task");
        expect(eventMarkup.indexOf("開始")).toBeLessThan(eventMarkup.indexOf("名前"));
        expect(eventMarkup.indexOf("名前")).toBeLessThan(eventMarkup.indexOf("終了"));
        expect(callMarkup).toContain("slds-icon-standard-log-a-call");
        expect(callMarkup).not.toContain("slds-icon-standard-event");
    });

    it("disables record edit and delete actions while loading", () => {
        const markup = renderToStaticMarkup(
            createElement(AccountRecordPage, {
                account,
                contacts: [contact],
                loading: true,
                onDelete: noop,
                onEdit: noop,
                onOpenContact: noop,
                onRefresh: noop
            })
        );

        expect(markup).toContain("type=\"button\" disabled=\"\">編集</button>");
        expect(markup).toContain("type=\"button\" disabled=\"\">削除</button>");
    });
});
