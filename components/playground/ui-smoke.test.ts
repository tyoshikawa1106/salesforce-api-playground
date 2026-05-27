import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";
import { IntegrationPanel } from "./ObjectHome";
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
        expect(markup).toContain("Connect Salesforce");
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
        expect(accountMarkup).toContain("Edit");
        expect(accountMarkup).toContain("Delete");
        expect(contactMarkup).toContain("Taro Yamada");
        expect(contactMarkup).toContain("Manager");
    });

    it("renders account and contact record pages with detail sections", () => {
        const accountMarkup = renderToStaticMarkup(
            createElement(AccountRecordPage, {
                account,
                contacts: [contact],
                loading: false,
                onBack: noop,
                onDelete: noop,
                onEdit: noop,
                onRefresh: noop
            })
        );
        const contactMarkup = renderToStaticMarkup(
            createElement(ContactRecordPage, {
                contact,
                loading: false,
                onBack: noop,
                onDelete: noop,
                onEdit: noop,
                onRefresh: noop
            })
        );

        expect(accountMarkup).toContain("Related");
        expect(accountMarkup).toContain("Contacts (1)");
        expect(contactMarkup).toContain("Account");
        expect(contactMarkup).toContain("No activities are related to this Contact yet.");
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

        expect(markup).toContain("Integration User Account Create");
        expect(markup).toContain("Create Account");
        expect(markup).toContain("Account Name");
    });
});
