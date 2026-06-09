import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { LoginPage, SessionLoadingPage } from "./LoginPage";
import { EnvironmentLabelBanner } from "./EnvironmentLabelBanner";
import { HomePanel } from "./HomePanel";
import { IntegrationPanel } from "./IntegrationPanel";
import { ObjectHomeHeader } from "./ObjectHome";
import { AccountPanel, ContactPanel, filterAccounts, filterContacts, getSelectedVisibleRecords, getSelectionState } from "./RecordLists";
import { AccountRecordPage, ActivityRecordPage, ContactRecordPage } from "./RecordPages";
import { RecycleBinPanel } from "./RecycleBinPanel";
import { GlobalHeader } from "./GlobalHeader";
import { AppNavigation } from "./Navigation";
import type { Account, Activity, Contact, RecycleBinItem } from "./types";

const account: Account = {
    Id: "001xx000003DGbY",
    Name: "Acme",
    Phone: "03-1234-5678",
    Website: "https://example.test",
    Industry: "Technology",
    Type: "Customer",
    BillingCity: "Tokyo",
    BillingCountry: "Japan",
    CreatedDate: "2026-04-01T10:00:00.000Z",
    LastModifiedDate: "2026-05-01T10:00:00.000Z",
    LastModifiedBy: {
        Name: "Admin User"
    }
};

const contact: Contact = {
    Id: "003xx000004TmiQ",
    FirstName: "Taro",
    LastName: "Yamada",
    Email: "taro@example.test",
    Phone: "090-1234-5678",
    Title: "Manager",
    Department: "Sales",
    AccountId: account.Id,
    Account: {
        Name: account.Name
    },
    CreatedDate: "2026-04-01T10:00:00.000Z",
    LastModifiedDate: "2026-05-01T10:00:00.000Z",
    LastModifiedBy: {
        Name: "Sales User"
    }
};

const activity: Activity = {
    type: "task",
    id: "00Txx0000012345",
    subject: "Call",
    date: "2026-06-08",
    whoId: contact.Id,
    whoName: "Taro Yamada",
    ownerId: "005xx0000012345",
    ownerName: "Admin User",
    whatId: account.Id,
    whatName: account.Name,
    status: "Not Started",
    description: "Follow up",
    createdDate: "2026-04-01T10:00:00.000Z",
    lastModifiedDate: "2026-05-01T10:00:00.000Z"
};

const noop = () => {};

const recycleBinItem: RecycleBinItem = {
    objectApiName: "Account",
    objectLabel: "取引先",
    id: account.Id,
    name: account.Name,
    deletedAt: account.LastModifiedDate,
    deletedByName: "Taro Admin"
};

describe("playground UI smoke rendering", () => {
    it("renders an environment label banner for non-production environments", () => {
        const markup = renderToStaticMarkup(
            createElement(EnvironmentLabelBanner, {
                environmentLabel: { label: "STAGING" }
            })
        );

        expect(markup).toContain("STAGING");
        expect(markup).toContain("role=\"alert\"");
        expect(markup).toContain("<h2");
        expect(markup).not.toContain("slds-badge");
        expect(markup).not.toContain("slds-icon_container");
        expect(markup).not.toContain("slds-notify__close");
        expect(markup).not.toContain("本番環境ではありません");
    });

    it("does not render an environment label banner without label data", () => {
        const markup = renderToStaticMarkup(
            createElement(EnvironmentLabelBanner, {
                environmentLabel: null
            })
        );

        expect(markup).toBe("");
    });

    it("renders the login page without losing the primary action", () => {
        const markup = renderToStaticMarkup(createElement(LoginPage));

        expect(markup).toContain("Salesforce API Playground");
        expect(markup).toContain("Salesforce に接続");
        expect(markup).toContain("/api/auth/login");
    });

    it("renders session loading without the login action", () => {
        const markup = renderToStaticMarkup(createElement(SessionLoadingPage));

        expect(markup).toContain("接続状態を確認しています...");
        expect(markup).toContain("aria-busy=\"true\"");
        expect(markup).not.toContain("/api/auth/login");
        expect(markup).not.toContain("Salesforce に接続");
    });

    it("renders account and contact list views with record actions", () => {
        const accountMarkup = renderToStaticMarkup(
            createElement(AccountPanel, {
                accounts: [account],
                connected: true,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpen: noop,
                onBulkDelete: noop,
                onBulkDeleteEmpty: noop
            })
        );
        const contactMarkup = renderToStaticMarkup(
            createElement(ContactPanel, {
                contacts: [contact],
                connected: true,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpen: noop,
                onOpenAccountById: noop,
                onBulkDelete: noop,
                onBulkDeleteEmpty: noop
            })
        );

        expect(accountMarkup).toContain("Acme");
        expect(accountMarkup).toContain("最終更新者");
        expect(accountMarkup).toContain("Admin User");
        expect(accountMarkup).toContain("1 件");
        expect(accountMarkup).toContain("このリストを検索...");
        expect(accountMarkup).toContain("role=\"grid\"");
        expect(accountMarkup).toContain("aria-multiselectable=\"true\"");
        expect(accountMarkup).not.toContain("slds-table_cell-buffer");
        expect(accountMarkup).toContain("slds-line-height_reset");
        expect(accountMarkup).toContain("slds-th__action slds-th__action_form");
        expect(accountMarkup).toContain("slds-cell_action-mode");
        expect(accountMarkup).toContain("role=\"gridcell\"");
        expect(accountMarkup).toContain("aria-label=\"表示中の取引先をすべて選択\"");
        expect(accountMarkup).not.toContain("ビュー: 自分の取引先");
        expect(accountMarkup).not.toContain("List view controls");
        expect(accountMarkup).not.toContain("Display as table");
        expect(accountMarkup).not.toContain("Refresh list");
        expect(accountMarkup).toContain("slds-checkbox__label");
        expect(accountMarkup).toContain("slds-text-align_right slds-cell_action-mode");
        expect(accountMarkup).toContain("aria-label=\"選択した取引先を削除\"");
        expect(accountMarkup).toContain("slds-m-left_x-small");
        expect(accountMarkup).not.toContain("playground-list-selection");
        expect(accountMarkup).toContain("slds-dropdown-trigger slds-dropdown-trigger_click");
        expect(accountMarkup).toContain("slds-button_icon-border-filled slds-button_icon-x-small");
        expect(accountMarkup).toContain("aria-haspopup=\"true\"");
        expect(accountMarkup).toContain("aria-expanded=\"false\"");
        expect(accountMarkup).toContain("slds-dropdown slds-dropdown_right");
        expect(accountMarkup).toContain("slds-dropdown__list");
        expect(accountMarkup).toContain("role=\"menuitem\"");
        expect(accountMarkup).toContain("編集");
        expect(accountMarkup).toContain("削除");
        expect(accountMarkup).not.toContain("slds-has-divider_top-space");
        expect(accountMarkup).not.toContain("選択を解除");
        expect(accountMarkup).not.toContain("件の取引先を選択中");
        expect(accountMarkup).not.toContain("slds-button_destructive");
        expect(accountMarkup).not.toContain("slds-button-group");
        expect(accountMarkup).not.toContain("slds-row-number");
        expect(accountMarkup).not.toContain("data-label=\"行番号\"");
        expect(contactMarkup).toContain("Taro Yamada");
        expect(contactMarkup).toContain("最終更新者");
        expect(contactMarkup).toContain("Sales User");
        expect(contactMarkup).toContain("1 件");
        expect(contactMarkup).toContain("Manager");
        expect(contactMarkup).toContain("aria-label=\"表示中の取引先責任者をすべて選択\"");
        expect(contactMarkup).toContain("aria-label=\"選択した取引先責任者を削除\"");
        expect(contactMarkup).not.toContain("ビュー: 自分の取引先責任者");
    });

    it("renders connected navigation with the recycle bin tab", () => {
        const markup = renderToStaticMarkup(
            createElement(AppNavigation, {
                activeTab: "recycleBin",
                connected: true,
                onChange: noop
            })
        );

        expect(markup).toContain("ごみ箱");
        expect(markup).toContain("aria-current=\"page\"");
    });

    it("renders recycle bin list with mixed object restore controls", () => {
        const markup = renderToStaticMarkup(
            createElement(RecycleBinPanel, {
                items: [recycleBinItem],
                loading: false,
                onRestore: noop,
                onRestoreEmpty: noop
            })
        );

        expect(markup).toContain("最近削除された項目");
        expect(markup).not.toContain("完全に削除");
        expect(markup).not.toContain("Recycle Bin に残っている Account / Contact を表示します。");
        expect(markup).toContain("復元");
        expect(markup).not.toContain("このリストを検索");
        expect(markup).toContain("aria-label=\"表示中の項目をすべて選択\"");
        expect(markup).toContain("ごみ箱の項目一覧");
        expect(markup).toContain("取引先");
        expect(markup).toContain("Acme");
        expect(markup).toContain("削除したユーザー");
        expect(markup).toContain("Taro Admin");
    });

    it("filters account and contact list records by visible list values", () => {
        const anotherAccount: Account = {
            ...account,
            Id: "001xx000003DGbZ",
            Name: "Global Media",
            Phone: "03-9999-9999",
            Website: "https://global.example.test",
            Industry: "Media",
            BillingCity: "Osaka"
        };
        const anotherContact: Contact = {
            ...contact,
            Id: "003xx000004TmiR",
            FirstName: "Hanako",
            LastName: "Suzuki",
            Email: "hanako@example.test",
            Title: "Designer",
            AccountId: anotherAccount.Id,
            Account: {
                Name: anotherAccount.Name
            }
        };

        expect(filterAccounts([account, anotherAccount], "media")).toEqual([anotherAccount]);
        expect(filterAccounts([account, anotherAccount], " TOKYO ")).toEqual([account]);
        expect(filterContacts([contact, anotherContact], "designer")).toEqual([anotherContact]);
        expect(filterContacts([contact, anotherContact], "acme")).toEqual([contact]);
    });

    it("reports visible list selection state for checked and mixed header checkboxes", () => {
        const anotherAccount: Account = {
            ...account,
            Id: "001xx000003DGbZ",
            Name: "Global Media"
        };

        expect(getSelectionState([account, anotherAccount], new Set([account.Id]))).toEqual({
            allVisibleSelected: false,
            someVisibleSelected: true,
            selectedVisibleCount: 1
        });
        expect(getSelectionState([account, anotherAccount], new Set([account.Id, anotherAccount.Id]))).toEqual({
            allVisibleSelected: true,
            someVisibleSelected: false,
            selectedVisibleCount: 2
        });
        expect(getSelectionState([anotherAccount], new Set([account.Id]))).toEqual({
            allVisibleSelected: false,
            someVisibleSelected: false,
            selectedVisibleCount: 0
        });
        expect(getSelectedVisibleRecords([account, anotherAccount], new Set([anotherAccount.Id]))).toEqual([anotherAccount]);
    });

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

    it("renders the Integration tab account create form", () => {
        const markup = renderToStaticMarkup(
            createElement(IntegrationPanel, {
                accountForm: {
                    Name: "",
                    Phone: "",
                    Website: "",
                    Industry: "",
                    Type: "",
                    BillingCity: "",
                    BillingCountry: ""
                },
                loading: false,
                saving: false,
                onAccountFormChange: noop,
                onCreateAccount: noop,
                onRefresh: noop
            })
        );

        expect(markup).toContain("連携ユーザーによる取引先作成");
        expect(markup).toContain("slds-page-header__meta-text");
        expect(markup).toContain("取引先を作成");
        expect(markup).toContain("取引先名");
        expect(markup).toContain("slds-m-top_small\"><form");
        expect(markup).not.toContain("slds-p-around_medium\"><form");
        expect(markup).not.toContain("slds-theme_default slds-p-vertical_medium");
    });

    it("renders list view page header without the stale update meta text", () => {
        const markup = renderToStaticMarkup(
            createElement(ObjectHomeHeader, {
                activeTab: "accounts",
                loading: false,
                onCreate: noop,
                onRefresh: noop
            })
        );

        expect(markup).toContain("title=\"リストビュー\"");
        expect(markup).toContain("リストビュー");
        expect(markup).toContain("slds-button slds-button_neutral");
        expect(markup).toContain(">新規</button>");
        expect(markup).not.toContain("新規取引先");
        expect(markup).not.toContain("slds-button_brand");
        expect(markup).not.toContain("最近参照したデータ");
        expect(markup).not.toContain("たった今更新");
        expect(markup).not.toContain("slds-page-header__meta-text");
        expect(markup).not.toContain("slds-page-header__name-meta");
    });

    it("renders the Home page header with SLDS meta text and refresh icon button", () => {
        const markup = renderToStaticMarkup(
            createElement(HomePanel, {
                connected: true,
                instanceUrl: "https://example.my.salesforce.com"
            })
        );

        expect(markup).toContain("slds-text-title_caps\">ホーム");
        expect(markup).toContain("slds-page-header__meta-text");
        expect(markup).toContain("Salesforce OAuth と REST API を試すための Next.js アプリ");
        expect(markup).not.toContain("取引先責任者");
        expect(markup).not.toContain("slds-button_icon-border-filled");
        expect(markup).not.toContain("title=\"更新\"");
        expect(markup).not.toContain("slds-text-title_caps\">App");
    });

    it("renders GlobalHeader menus with explicit popup and menu relationships", () => {
        const markup = renderToStaticMarkup(createElement(GlobalHeader, { connected: true }));

        expect(markup).toContain("aria-controls=\"global-action-popover\"");
        expect(markup).toContain("aria-controls=\"global-help-popover\"");
        expect(markup).toContain("aria-controls=\"global-settings-popover\"");
        expect(markup).toContain("aria-haspopup=\"dialog\"");
        expect(markup).toContain("aria-controls=\"profile-menu\"");
        expect(markup).toContain("aria-haspopup=\"menu\"");
        expect(markup).toContain("id=\"profile-menu\"");
        expect(markup).toContain("role=\"menu\"");
        expect(markup).toContain("role=\"menuitem\"");
        expect(markup).toContain("role=\"presentation\"");
    });
});
