import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EnvironmentLabelBanner } from "./EnvironmentLabelBanner";
import { GlobalHeader } from "./GlobalHeader";
import { HomePanel } from "./HomePanel";
import { IntegrationPanel } from "./IntegrationPanel";
import { LoginPage, SessionLoadingPage } from "./LoginPage";
import { AppNavigation } from "./Navigation";
import { ObjectHomeHeader } from "./ObjectHome";
import { noop } from "./test-fixtures";

describe("playground shell smoke rendering", () => {
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

        expect(markup).toContain("title=\"一覧\"");
        expect(markup).toContain("一覧");
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
        expect(markup).toContain("playground-home-status-grid");
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
