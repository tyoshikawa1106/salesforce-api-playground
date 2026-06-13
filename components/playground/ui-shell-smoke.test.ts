import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EnvironmentLabelBanner } from "./EnvironmentLabelBanner";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalHeaderActions } from "./GlobalHeaderActions";
import { HomePanel } from "./HomePanel";
import { IntegrationPanel } from "./IntegrationPanel";
import { LoginPage, SessionLoadingPage } from "./LoginPage";
import { Modal, ModalFooter } from "./Modal";
import { AppNavigation, getVisibleNavigationCount } from "./Navigation";
import { ObjectHomeHeader } from "./ObjectHome";
import { RecordModals } from "./RecordModals";
import { getDefaultEventForm, getDefaultTaskForm } from "./activity-task-form";
import { blankAccount, blankContact } from "./record-forms";
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
        expect(markup).toContain("slds-theme_shade playground-login-page");
        expect(markup).toContain("slds-p-around_none");
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
        expect(markup).not.toContain("連携 のサブメニューを開く");
        expect(markup).not.toContain("ごみ箱 のサブメニューを開く");
    });

    it("calculates visible navigation items with an overflow menu reservation", () => {
        expect(getVisibleNavigationCount(500, [80, 110, 140], 120)).toBe(3);
        expect(getVisibleNavigationCount(329, [80, 110, 140], 120)).toBe(2);
        expect(getVisibleNavigationCount(190, [80, 110, 140], 120)).toBe(0);
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
        expect(markup).toContain("aria-controls=\"global-guidance-popover\"");
        expect(markup).toContain("aria-controls=\"global-help-popover\"");
        expect(markup).toContain("aria-controls=\"global-settings-popover\"");
        expect(markup).toContain("aria-haspopup=\"dialog\"");
        expect(markup).toContain("aria-haspopup=\"menu\"");
        expect(markup).toContain("slds-nubbin_top-right");
        expect(markup).toContain("slds-text-body_regular");
        expect(markup).toContain("新規行動");
        expect(markup).toContain("新規ToDo");
        expect(markup).toContain("aria-controls=\"profile-menu\"");
        expect(markup).toContain("aria-haspopup=\"dialog\"");
    });

    it("renders the environment label above the fixed global header", () => {
        const markup = renderToStaticMarkup(
            createElement(GlobalHeader, {
                connected: true,
                environmentLabel: { label: "STAGING" }
            })
        );
        const labelStart = markup.indexOf("playground-environment-label");
        const headerStart = markup.indexOf("slds-global-header slds-grid");

        expect(labelStart).toBeGreaterThanOrEqual(0);
        expect(headerStart).toBeGreaterThan(labelStart);
        expect(markup).toContain("STAGING");
    });

    it("renders the Salesforce-style profile panel when open", () => {
        const markup = renderToStaticMarkup(
            createElement(GlobalHeaderActions, {
                activeActionPopover: null,
                cancelActionPopoverClose: noop,
                cancelProfileMenuClose: noop,
                instanceUrl: "https://example.my.salesforce.com",
                profileMenuOpen: true,
                scheduleActionPopoverClose: noop,
                scheduleProfileMenuClose: noop,
                showNotificationBadge: false,
                toggleActionPopover: noop,
                toggleNotificationBadge: noop,
                toggleProfileMenu: noop,
                userName: "Admin User"
            })
        );

        const profilePanelStart = markup.indexOf("id=\"profile-menu\"");
        const profilePanelEnd = markup.indexOf("</section>", profilePanelStart);
        const profilePanelMarkup = markup.slice(profilePanelStart, profilePanelEnd);

        expect(profilePanelStart).toBeGreaterThanOrEqual(0);
        expect(profilePanelEnd).toBeGreaterThan(profilePanelStart);
        expect(profilePanelMarkup).toContain("id=\"profile-menu\"");
        expect(profilePanelMarkup).toContain("role=\"dialog\"");
        expect(profilePanelMarkup).toContain("ログアウト");
        expect(profilePanelMarkup).not.toContain("表示密度");
        expect(profilePanelMarkup).not.toContain("カンファタブル");
        expect(profilePanelMarkup).not.toContain("コンパクト");
        expect(profilePanelMarkup).not.toContain("設定");
    });

    it("renders GlobalHeader icons with SLDS global action classes", () => {
        const markup = renderToStaticMarkup(createElement(GlobalHeader, { connected: true }));

        expect(markup).toContain("aria-pressed=\"false\"");
        expect(markup).toContain("slds-icon-text-default");
        expect(markup).toContain("slds-global-actions__task");
        expect(markup).toContain("slds-global-actions__guidance");
        expect(markup).toContain("slds-icon-standard-event");
        expect(markup).toContain("slds-icon-standard-task");
        expect(markup).toContain("slds-global-actions__help");
        expect(markup).toContain("slds-global-actions__setup");
        expect(markup).toContain("slds-global-actions__notifications");
        expect(markup).toContain("slds-avatar_profile-image-medium");
        expect(markup).toContain("slds-global-header__logo");
        expect(markup).not.toContain("playground-global-header-container");
        expect(markup).not.toContain("slds-show_medium");
        expect(markup).not.toContain("playground-global-search-icon");
        expect(markup).not.toContain("playground-global-action-icon");
        expect(markup).not.toContain("playground-global-action");
        expect(markup).not.toContain("playground-menu-icon");
    });

    it("renders global activity create actions as docked composers", () => {
        const markup = renderToStaticMarkup(
            createElement(RecordModals, {
                forms: {
                    accountForm: blankAccount,
                    accountOptions: [],
                    activityLookups: {},
                    contactForm: blankContact,
                    eventForm: getDefaultEventForm(),
                    taskForm: getDefaultTaskForm(),
                    onAccountFormChange: noop,
                    onActivityLookupsChange: noop,
                    onContactFormChange: noop,
                    onEventFormChange: noop,
                    onTaskFormChange: noop
                },
                state: {
                    deleteState: null,
                    modal: { type: "activity", mode: "create", activityType: "task" },
                    restoreState: null,
                    saving: false
                },
                actions: {
                    onCancelDelete: noop,
                    onCancelRestore: noop,
                    onCloseRecordModal: noop,
                    onConfirmDelete: noop,
                    onConfirmRestore: noop,
                    onSaveAccount: noop,
                    onSaveActivity: noop,
                    onSaveContact: noop
                }
            })
        );

        expect(markup).toContain("slds-docked-composer");
        expect(markup).toContain("新規ToDo");
        expect(markup).not.toContain("slds-modal__container");
    });

    it("renders Modal with the SLDS blueprint structure", () => {
        const markup = renderToStaticMarkup(
            createElement(
                Modal,
                {
                    title: "新規取引先",
                    onClose: noop
                },
                createElement("div", {
                    className: "slds-modal__content slds-p-around_medium",
                    id: "modal-content-id-test"
                }, "本文"),
                createElement(ModalFooter, {
                    saving: false,
                    onCancel: noop
                })
            )
        );
        const closeStart = markup.indexOf("slds-modal__close");
        const headerStart = markup.indexOf("slds-modal__header");

        expect(closeStart).toBeGreaterThanOrEqual(0);
        expect(headerStart).toBeGreaterThan(closeStart);
        expect(markup).toContain("slds-button__icon slds-button__icon_large");
        expect(markup).toContain("<h1");
        expect(markup).toContain("tabindex=\"-1\"");
        expect(markup).toContain("role=\"presentation\"");
        expect(markup).toContain("aria-label=\"キャンセルして閉じる\"");
    });

});
