import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createEmptyHomeRecordCounts } from "@/lib/playground-record-counts";
import { getVisibleComponentLogGroups } from "../component-logs";
import { EnvironmentLabelBanner } from "./EnvironmentLabelBanner";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalHeaderActions } from "./GlobalHeaderActions";
import { HomeCounts, HomePanel } from "../home/HomePanel";
import type { HomeCountValues } from "../home/HomePanel";
import {
    IntegrationPanel,
    shouldResetAccountCreateValidation,
    shouldShowAccountCreateNameError
} from "../integration/IntegrationPanel";
import { LoginPage, SessionLoadingPage } from "./LoginPage";
import { shouldReplaceLoginNavigation } from "./LoginLink";
import { Modal, ModalFooter } from "./Modal";
import { AppNavigation, getVisibleNavigationCount } from "./Navigation";
import { ObjectHomeHeader } from "../records/ObjectHome";
import { PlaygroundWorkspace } from "../PlaygroundWorkspace";
import { RecordModals } from "../records/RecordModals";
import { UtilityBar } from "./UtilityBar";
import { getDefaultEventForm, getDefaultTaskForm } from "../activities/activity-task-form";
import { blankAccount, blankContact } from "../records/record-forms";
import { accountFixture, noop } from "../utils/test-fixtures";

const homeCountValues: HomeCountValues = {
    accounts: 12,
    campaigns: 6,
    cases: 7,
    contacts: 34,
    emailMessages: 8,
    events: 5,
    leads: 3,
    opportunities: 4,
    products: 5,
    recycleBinItems: 2,
    tasks: 67,
    users: 8
};

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

    it("renders session loading without visible content", () => {
        const markup = renderToStaticMarkup(createElement(SessionLoadingPage));

        expect(markup).toContain("aria-busy=\"true\"");
        expect(markup).not.toContain("接続状態を確認しています...");
        expect(markup).not.toContain("slds-spinner");
        expect(markup).not.toContain("/api/auth/login");
        expect(markup).not.toContain("Salesforce に接続");
    });

    it("replaces browser history only for normal login clicks", () => {
        expect(shouldReplaceLoginNavigation({
            button: 0,
            ctrlKey: false,
            defaultPrevented: false,
            metaKey: false,
            shiftKey: false
        })).toBe(true);
        expect(shouldReplaceLoginNavigation({
            button: 0,
            ctrlKey: false,
            defaultPrevented: false,
            metaKey: true,
            shiftKey: false
        })).toBe(false);
        expect(shouldReplaceLoginNavigation({
            button: 1,
            ctrlKey: false,
            defaultPrevented: false,
            metaKey: false,
            shiftKey: false
        })).toBe(false);
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
        expect(markup).toContain("取引先 のサブメニューを開く");
        expect(markup).toContain("取引先責任者 のサブメニューを開く");
        expect(markup).toContain("aria-expanded=\"false\"");
        expect(markup).toContain("aria-label=\"取引先 のサブメニュー\"");
        expect(markup).toContain("role=\"menuitem\"");
        expect(markup).toContain("tabindex=\"-1\"");
        expect(markup).toContain("title=\"取引先 を新規作成\"");
        expect(markup).toContain(">新規</span>");
        expect(markup).not.toContain("主操作");
        expect(markup).not.toContain("連携 のサブメニューを開く");
        expect(markup).not.toContain("ごみ箱 のサブメニューを開く");
    });

    it("renders the favorites menu as a toggleable SLDS menu", () => {
        const markup = renderToStaticMarkup(
            createElement(GlobalHeaderActions, {
                activeActionPopover: null,
                cancelActionPopoverClose: noop,
                cancelProfileMenuClose: noop,
                profileMenuOpen: false,
                scheduleActionPopoverClose: noop,
                scheduleProfileMenuClose: noop,
                showNotificationBadge: false,
                toggleActionPopover: noop,
                toggleNotificationBadge: noop,
                toggleProfileMenu: noop
            })
        );

        expect(markup).toContain("title=\"お気に入りを表示\"");
        expect(markup).toContain("aria-haspopup=\"menu\"");
        expect(markup).toContain("aria-expanded=\"false\"");
        expect(markup).toContain("role=\"menu\"");
        expect(markup).toContain("aria-label=\"お気に入り\"");
        expect(markup).toContain("お気に入りはありません");
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
        expect(markup).toContain("slds-page-header__name-meta");
        expect(markup).not.toContain("slds-page-header__meta-text");
        expect(markup).toContain("取引先を作成");
        expect(markup).toContain("取引先名");
        expect(markup).toContain("autoComplete=\"off\"");
        expect(markup).toContain("noValidate=\"\"");
        expect(markup).toContain("slds-m-top_small\"><form");
        expect(markup).not.toContain("slds-p-around_medium\"><form");
        expect(markup).not.toContain("slds-theme_default slds-p-vertical_medium");
    });

    it("disables the Integration account create action while loading", () => {
        const markup = renderToStaticMarkup(
            createElement(IntegrationPanel, {
                accountForm: blankAccount,
                loading: true,
                saving: false,
                onAccountFormChange: noop,
                onCreateAccount: noop,
                onRefresh: noop
            })
        );

        expect(markup).toContain("type=\"submit\" disabled=\"\"");
        expect(markup).toContain("取引先を作成");
    });

    it("resets Integration account validation only after a completed blank-form save", () => {
        expect(shouldResetAccountCreateValidation({
            accountName: "",
            previousSaving: true,
            saving: false
        })).toBe(true);
        expect(shouldResetAccountCreateValidation({
            accountName: "",
            previousSaving: false,
            saving: false
        })).toBe(false);
        expect(shouldResetAccountCreateValidation({
            accountName: "Acme",
            previousSaving: true,
            saving: false
        })).toBe(false);
        expect(shouldResetAccountCreateValidation({
            accountName: "",
            previousSaving: true,
            saving: true
        })).toBe(false);
    });

    it("suppresses transient Integration account validation while saving resets the form", () => {
        expect(shouldShowAccountCreateNameError({
            accountName: "",
            saving: false,
            showValidation: true
        })).toBe(true);
        expect(shouldShowAccountCreateNameError({
            accountName: "",
            saving: true,
            showValidation: true
        })).toBe(false);
        expect(shouldShowAccountCreateNameError({
            accountName: "Acme",
            saving: false,
            showValidation: true
        })).toBe(false);
        expect(shouldShowAccountCreateNameError({
            accountName: "",
            saving: false,
            showValidation: false
        })).toBe(false);
    });

    it("renders list view page header with the standard list view title", () => {
        const markup = renderToStaticMarkup(
            createElement(ObjectHomeHeader, {
                activeTab: "accounts",
                onCreate: noop
            })
        );

        expect(markup).toContain("title=\"最近参照したデータ\"");
        expect(markup).toContain("最近参照したデータ");
        expect(markup).toContain("slds-button slds-button_neutral");
        expect(markup).toContain(">新規</button>");
        expect(markup).not.toContain("新規取引先");
        expect(markup).not.toContain("slds-button_brand");
        expect(markup).not.toContain("たった今更新");
        expect(markup).not.toContain("slds-page-header__meta-text");
        expect(markup).not.toContain("slds-page-header__name-meta");
    });

    it("disables the list view create action while loading", () => {
        const markup = renderToStaticMarkup(
            createElement(ObjectHomeHeader, {
                activeTab: "accounts",
                loading: true,
                onCreate: noop
            })
        );

        expect(markup).toContain("type=\"button\" disabled=\"\">新規</button>");
    });

    it("removes the outer content padding for record list views", () => {
        const markup = renderToStaticMarkup(
            createElement(PlaygroundWorkspace, {
                view: {
                    activeTab: "accounts",
                    activityCounts: { events: 0, tasks: 0 },
                    loading: false
                },
                session: {
                    connected: true,
                    userName: "Taro Admin"
                },
                recordSelection: {
                    accounts: [accountFixture],
                    contacts: [],
                    recordCounts: createEmptyHomeRecordCounts(),
                    selectedAccount: null,
                    selectedActivity: null,
                    selectedContact: null,
                    userCounts: { active: 0 }
                },
                recordActions: {
                    onBulkDeleteEmpty: noop,
                    onCreateAccount: noop,
                    onCreateContact: noop,
                    onDeleteRecord: noop,
                    onEditAccount: noop,
                    onEditActivity: noop,
                    onEditContact: noop,
                    onOpenAccount: noop,
                    onOpenAccountById: noop,
                    onOpenActivity: noop,
                    onOpenContact: noop,
                    onOpenContactById: noop,
                    onRefresh: noop
                },
                integrationForm: {
                    accountForm: blankAccount,
                    saving: false,
                    onAccountFormChange: noop,
                    onCreateAccount: noop
                },
                recycleBinActions: {
                    items: [],
                    onRestoreEmpty: noop,
                    onRestoreItems: noop
                }
            })
        );

        expect(markup).toContain("slds-template_default playground-main-content_flush-record-list");
    });

    it("renders the Home page header without status summary content", () => {
        const markup = renderToStaticMarkup(createElement(HomePanel, { userName: "Taro Admin" }));

        expect(markup).toContain("slds-page-header__title slds-truncate");
        expect(markup).toContain("title=\"Salesforce API Playground\"");
        expect(markup).toContain("slds-page-header__name-meta\">Login: Taro Admin");
        expect(markup).not.toContain("slds-page-header__meta-text");
        expect(markup).not.toContain("ログインユーザー");
        expect(markup).not.toContain("playground-home-counts");
        expect(markup).not.toContain("playground-home-instance");
        expect(markup).not.toContain("インスタンス");
        expect(markup).not.toContain("接続済み");
        expect(markup).not.toContain("Salesforce OAuth と REST API を試すための Next.js アプリ");
        expect(markup).not.toContain("slds-button_icon-border-filled");
        expect(markup).not.toContain("title=\"更新\"");
        expect(markup).not.toContain("slds-text-title_caps");
        expect(markup).not.toContain("slds-text-title_caps\">App");
    });

    it("keeps the Home login label visible before the user name loads", () => {
        const markup = renderToStaticMarkup(createElement(HomePanel));

        expect(markup).toContain("slds-page-header__name-meta\">Login:");
        expect(markup).not.toContain("Login: Salesforce ユーザー");
    });

    it("renders Home count summaries as content below the header card", () => {
        const markup = renderToStaticMarkup(createElement(HomeCounts, {
            counts: homeCountValues
        }));

        expect(markup).toContain("playground-home-count-summary");
        expect(markup).toContain("playground-home-counts");
        expect(markup).toContain("取引先");
        expect(markup).toContain("取引先責任者");
        expect(markup).toContain("行動");
        expect(markup).toContain("ToDo");
        expect(markup).toContain("ユーザー");
        expect(markup).toContain("ごみ箱");
        expect(markup).toContain("リード");
        expect(markup).toContain("商談");
        expect(markup).toContain("商品");
        expect(markup).toContain("キャンペーン");
        expect(markup).toContain("ケース");
        expect(markup).toContain("メールメッセージ");
        expect(markup).not.toContain("slds-page-header");
        expect(markup).not.toContain("slds-spinner_small");
    });

    it("renders Home count summaries as loading spinners while data is loading", () => {
        const markup = renderToStaticMarkup(createElement(HomeCounts, {
            counts: {
                ...createEmptyHomeRecordCounts(),
                accounts: 0,
                contacts: 0,
                events: 0,
                recycleBinItems: 0,
                tasks: 0,
                users: 0
            },
            loading: true
        }));

        expect(markup).toContain("playground-home-count-summary");
        expect(markup).toContain("slds-spinner_small");
        expect(markup).toContain("slds-is-relative");
        expect(markup).toContain("取引先の件数を読み込んでいます...");
        expect(markup).not.toContain("title=\"0 件\"");
        expect(markup).not.toContain(">0</p>");
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
        expect(markup).toContain("playground-global-actions__mobile-hidden");
        expect(markup).toContain("playground-global-actions__profile");
        expect(markup).toContain("slds-avatar_profile-image-medium");
        expect(markup).toContain("slds-global-header__logo");
        expect(markup).not.toContain("playground-global-header-container");
        expect(markup).not.toContain("slds-show_medium");
        expect(markup).not.toContain("playground-global-search-icon");
        expect(markup).not.toContain("playground-global-action-icon");
        expect(markup).not.toContain("playground-menu-icon");
    });

    it("renders the docked utility bar with SLDS structure", () => {
        const markup = renderToStaticMarkup(createElement(UtilityBar));

        expect(markup).toContain("slds-utility-bar_container");
        expect(markup).toContain("aria-label=\"Utility Bar\"");
        expect(markup).toContain("slds-utility-bar__item");
        expect(markup).toContain("slds-button slds-utility-bar__action");
        expect(markup).toContain("slds-utility-bar__text");
        expect(markup).toContain("Call");
        expect(markup).toContain("History");
        expect(markup).toContain("Notes");
        expect(markup).toContain("Logs");
        expect(markup).toContain("aria-pressed=\"false\"");
        expect(markup).not.toContain("Omni-Channel");
        expect(markup).not.toContain("Online");
        expect(markup).not.toContain("slds-utility-panel");
    });

    it("lists visible component files for the Home workspace logs", () => {
        const groups = getVisibleComponentLogGroups({
            activeTab: "home",
            hasSelectedAccount: false,
            hasSelectedActivity: false,
            hasSelectedContact: false
        });

        expect(groups.map((group) => group.label)).toEqual(["表示中の画面", "共通レイアウト"]);
        expect(groups).toEqual(expect.arrayContaining([
            expect.objectContaining({
                label: "共通レイアウト",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        name: "UtilityBar",
                        filePath: "components/playground/shell/UtilityBar.tsx"
                    })
                ])
            }),
            expect.objectContaining({
                label: "表示中の画面",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        description: "ホーム画面のヘッダーを表示する。",
                        name: "HomePanel",
                        filePath: "components/playground/home/HomePanel.tsx"
                    }),
                    expect.objectContaining({
                        name: "HomeCounts",
                        filePath: "components/playground/home/HomePanel.tsx"
                    })
                ])
            })
        ]));
    });

    it("switches component file logs for record detail workspaces", () => {
        const groups = getVisibleComponentLogGroups({
            activeTab: "accounts",
            hasSelectedAccount: true,
            hasSelectedActivity: false,
            hasSelectedContact: false
        });
        const workspaceGroup = groups.find((group) => group.label === "表示中の画面");

        expect(workspaceGroup?.entries).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: "AccountDetailWorkspace",
                filePath: "components/playground/records/RecordWorkspacePanels.tsx"
            }),
            expect.objectContaining({
                name: "AccountRecordPage",
                filePath: "components/playground/records/RecordPages.tsx"
            })
        ]));
        expect(workspaceGroup?.entries).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: "AccountListWorkspace"
            })
        ]));
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

    it("renders record modal forms without native browser validation", () => {
        const accountMarkup = renderToStaticMarkup(
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
                    modal: { type: "account", mode: "create" },
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
        const contactMarkup = renderToStaticMarkup(
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
                    modal: { type: "contact", mode: "create" },
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

        expect(accountMarkup).toContain("noValidate=\"\"");
        expect(contactMarkup).toContain("noValidate=\"\"");
        expect(accountMarkup).toContain("autoComplete=\"off\"");
        expect(contactMarkup).toContain("autoComplete=\"off\"");
        expect(accountMarkup).not.toContain("required=\"\"");
        expect(contactMarkup).not.toContain("required=\"\"");
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

    it("disables modal footer actions while saving", () => {
        const markup = renderToStaticMarkup(
            createElement(ModalFooter, {
                saving: true,
                onCancel: noop
            })
        );

        expect(markup).toContain("aria-label=\"キャンセルして閉じる\" disabled=\"\"");
        expect(markup).toContain("type=\"submit\" disabled=\"\">保存中...");
    });

});
