import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";
import { EnvironmentLabelBanner } from "./EnvironmentLabelBanner";
import { HomePanel, IntegrationPanel, ObjectHomeHeader } from "./ObjectHome";
import { AccountPanel, ContactPanel, filterAccounts, filterContacts, getSelectionState } from "./RecordLists";
import { AccountRecordPage, ContactRecordPage } from "./RecordPages";
import { GlobalHeader } from "./GlobalHeader";
import type { Account, Contact } from "./types";

const account: Account = {
    Id: "001xx000003DGbY",
    Name: "Acme",
    Phone: "03-1234-5678",
    Website: "https://example.test",
    Industry: "Technology",
    Type: "Customer",
    BillingCity: "Tokyo",
    BillingCountry: "Japan",
    LastModifiedDate: "2026-05-01T10:00:00.000Z"
};

const contact: Contact = {
    Id: "003xx000004TmiQ",
    FirstName: "Taro",
    LastName: "Yamada",
    Email: "taro@example.test",
    Phone: "090-1234-5678",
    Title: "Manager",
    AccountId: account.Id,
    Account: {
        Name: account.Name
    },
    LastModifiedDate: "2026-05-01T10:00:00.000Z"
};

const noop = () => {};

describe("playground UI smoke rendering", () => {
    it("renders an environment label banner for non-production environments", () => {
        const markup = renderToStaticMarkup(
            createElement(EnvironmentLabelBanner, {
                environmentLabel: { label: "STAGING" }
            })
        );

        expect(markup).toContain("STAGING");
        expect(markup).not.toContain("slds-badge");
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

    it("renders account and contact list views with record actions", () => {
        const accountMarkup = renderToStaticMarkup(
            createElement(AccountPanel, {
                accounts: [account],
                connected: true,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpen: noop
            })
        );
        const contactMarkup = renderToStaticMarkup(
            createElement(ContactPanel, {
                contacts: [contact],
                connected: true,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpen: noop
            })
        );

        expect(accountMarkup).toContain("Acme");
        expect(accountMarkup).toContain("このリストを検索...");
        expect(accountMarkup).toContain("aria-label=\"表示中の取引先をすべて選択\"");
        expect(accountMarkup).not.toContain("List view controls");
        expect(accountMarkup).not.toContain("Display as table");
        expect(accountMarkup).not.toContain("Refresh list");
        expect(accountMarkup).toContain("編集");
        expect(accountMarkup).toContain("削除");
        expect(contactMarkup).toContain("Taro Yamada");
        expect(contactMarkup).toContain("Manager");
        expect(contactMarkup).toContain("aria-label=\"表示中の取引先責任者をすべて選択\"");
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
    });

    it("renders account and contact record pages with detail sections", () => {
        const accountMarkup = renderToStaticMarkup(
            createElement(AccountRecordPage, {
                account,
                contacts: [contact],
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onRefresh: noop
            })
        );
        const contactMarkup = renderToStaticMarkup(
            createElement(ContactRecordPage, {
                contact,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onRefresh: noop
            })
        );

        expect(accountMarkup).toContain("関連");
        expect(accountMarkup).toContain("取引先責任者 (1)");
        expect(accountMarkup).toContain("slds-m-top_small playground-record-body");
        expect(accountMarkup).toContain("slds-tabs_default slds-tabs_card playground-record-tabs");
        expect(accountMarkup).toContain("slds-tabs_default__content slds-show slds-p-around_x-small");
        expect(accountMarkup).toContain("aria-controls=\"record-related-panel\"");
        expect(accountMarkup).toContain("aria-labelledby=\"record-related-tab\"");
        expect(accountMarkup).toContain("slds-box slds-box_x-small slds-theme_default slds-m-bottom_x-small");
        expect(accountMarkup).toContain("slds-card slds-card_boundary playground-record-related-card");
        expect(accountMarkup).not.toContain("新規取引先責任者");
        expect(accountMarkup).not.toContain("slds-box slds-box_x-small slds-theme_default\"><div class=\"slds-grid slds-wrap slds-gutters_x-small");
        expect(accountMarkup).toContain("slds-button-group");
        expect(accountMarkup).not.toContain("slds-button_destructive");
        expect(contactMarkup).toContain("取引先");
        expect(contactMarkup).toContain("この取引先責任者に関連する活動はまだありません。");
        expect(contactMarkup).toContain("slds-m-top_small playground-record-body");
        expect(contactMarkup).not.toContain("新規ケース");
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

        expect(markup).toContain("title=\"レコード一覧\"");
        expect(markup).toContain("レコード一覧");
        expect(markup).not.toContain("最近参照したデータ");
        expect(markup).not.toContain("たった今更新");
        expect(markup).not.toContain("slds-page-header__meta-text");
        expect(markup).not.toContain("slds-page-header__name-meta");
    });

    it("renders the Home page header with SLDS meta text and refresh icon button", () => {
        const markup = renderToStaticMarkup(
            createElement(HomePanel, {
                accountsCount: 2,
                contactsCount: 3,
                connected: true,
                instanceUrl: "https://example.my.salesforce.com",
                loading: false,
                onRefresh: noop
            })
        );

        expect(markup).toContain("slds-text-title_caps\">ホーム");
        expect(markup).toContain("slds-page-header__meta-text");
        expect(markup).toContain("OAuth と REST API で取引先 / 取引先責任者を直接操作する学習アプリ");
        expect(markup).toContain("slds-button_icon-border-filled");
        expect(markup).toContain("slds-button__icon");
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
