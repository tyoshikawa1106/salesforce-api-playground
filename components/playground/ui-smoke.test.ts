import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";
import { HomePanel, IntegrationPanel, ObjectHomeHeader } from "./ObjectHome";
import { AccountPanel, ContactPanel } from "./RecordLists";
import { AccountRecordPage, ContactRecordPage } from "./RecordPages";
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
                onOpen: noop,
                onRefresh: noop
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
                onRefresh: noop
            })
        );

        expect(accountMarkup).toContain("Acme");
        expect(accountMarkup).toContain("このリストを検索...");
        expect(accountMarkup).not.toContain("List view controls");
        expect(accountMarkup).not.toContain("Display as table");
        expect(accountMarkup).not.toContain("Refresh list");
        expect(accountMarkup).toContain("編集");
        expect(accountMarkup).toContain("削除");
        expect(contactMarkup).toContain("Taro Yamada");
        expect(contactMarkup).toContain("Manager");
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

    it("renders list view page header meta text in the SLDS meta row", () => {
        const markup = renderToStaticMarkup(
            createElement(ObjectHomeHeader, {
                activeTab: "accounts",
                accountsCount: 15,
                contactsCount: 0,
                loading: false,
                onCreate: noop,
                onRefresh: noop
            })
        );

        expect(markup).toContain("15 件 - たった今更新");
        expect(markup).toContain("slds-page-header__meta-text");
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
});
