import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountRecordPage, ActivityRecordPage, ContactRecordPage } from "./RecordPages";
import {
    accountFixture as account,
    activityFixture as activity,
    contactFixture as contact,
    noop
} from "./test-fixtures";

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
        expect(accountMarkup).toContain("slds-m-top_small playground-record-body");
        expect(accountMarkup).toContain("slds-tabs_default slds-tabs_card playground-record-tabs");
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
        expect(contactMarkup).toContain("slds-icon-action-call");
        expect(contactMarkup).toContain("新規ToDo");
        expect(contactMarkup).toContain("新規行動");
        expect(contactMarkup).toContain("今後 &amp; 期限切れ");
        expect(contactMarkup).not.toContain("aria-controls=\"activity-related-panel\"");
        expect(contactMarkup).not.toContain("Chatter");
        expect(contactMarkup).not.toContain("この取引先責任者に関連する活動はまだありません。");
        expect(contactMarkup).toContain("slds-m-top_small playground-record-body");
        expect(contactMarkup).not.toContain("新規ケース");
        expect(activityMarkup).toContain("ToDo");
        expect(activityMarkup).toContain("システム情報");
        expect(activityMarkup).toContain("作成日");
        expect(activityMarkup).toContain("最終更新日");
        expect(activityMarkup).toContain("playground-record-body_single");
        expect(activityMarkup).not.toContain("新規ToDo");
        expect(activityMarkup).not.toContain("aria-controls=\"activity-related-panel\"");
    });
});
