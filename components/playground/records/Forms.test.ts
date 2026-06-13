import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountFormFields, ContactFormFields } from "./Forms";
import {
    accountTextFields,
    accountRecordToForm,
    blankAccount,
    blankContact,
    contactAccountField,
    contactRecordToForm,
    contactTextFields,
    getRequiredFieldMessage
} from "./record-forms";
import { accountFixture, noop } from "../utils/test-fixtures";

describe("record form builders", () => {
    it("builds blank forms when no record is provided", () => {
        expect(accountRecordToForm()).toEqual(blankAccount);
        expect(contactRecordToForm()).toEqual(blankContact);
    });

    it("maps account record fields to editable form values", () => {
        expect(
            accountRecordToForm({
                Id: "001xx000003DGbY",
                Name: "Acme",
                Phone: "03-1234-5678",
                Website: "https://example.test",
                BillingCity: "Tokyo"
            })
        ).toEqual({
            Name: "Acme",
            Phone: "03-1234-5678",
            Website: "https://example.test",
            Industry: "",
            Type: "",
            BillingCity: "Tokyo",
            BillingCountry: ""
        });
    });

    it("maps contact record fields to editable form values", () => {
        expect(
            contactRecordToForm({
                Id: "003xx000004TmiQ",
                FirstName: "Taro",
                LastName: "Yamada",
                Email: "taro@example.test",
                Department: "Sales",
                AccountId: "001xx000003DGbY"
            })
        ).toEqual({
            FirstName: "Taro",
            LastName: "Yamada",
            Email: "taro@example.test",
            Phone: "",
            Title: "",
            Department: "Sales",
            AccountId: "001xx000003DGbY"
        });
    });

    it("defines stable form field ids and required messages", () => {
        expect(accountTextFields.find((field) => field.key === "BillingCity")).toMatchObject({
            id: "account-billing-city",
            label: "請求先市区郡"
        });
        expect(contactTextFields.find((field) => field.key === "LastName")).toMatchObject({
            id: "contact-last-name",
            required: true,
            requiredMessage: "取引先責任者の姓は必須です。"
        });
        expect(contactTextFields.find((field) => field.key === "Department")).toMatchObject({
            id: "contact-department",
            label: "部署"
        });
        expect(contactAccountField).toEqual({
            key: "AccountId",
            id: "contact-account",
            label: "取引先"
        });
        expect(getRequiredFieldMessage(accountTextFields, "Name")).toBe("取引先名は必須です。");
    });

    it("renders the contact account field as an account lookup", () => {
        const markup = renderToStaticMarkup(
            createElement(ContactFormFields, {
                accounts: [accountFixture],
                value: {
                    ...blankContact,
                    AccountId: accountFixture.Id
                },
                onChange: noop
            })
        );

        expect(markup).toContain("contact-account-listbox-input");
        expect(markup).toContain("role=\"combobox\"");
        expect(markup).toContain("slds-combobox__input-value");
        expect(markup).toContain(accountFixture.Name);
        expect(markup).not.toContain("<select");
        expect(markup).not.toContain("取引先なし");
    });

    it("renders account picklists as SLDS select-only comboboxes", () => {
        const markup = renderToStaticMarkup(
            createElement(AccountFormFields, {
                picklistOptions: {
                    Industry: [{ label: "Apparel", value: "Apparel" }],
                    Type: [{ label: "Customer", value: "Customer" }]
                },
                value: {
                    ...blankAccount,
                    Industry: "Apparel",
                    Type: "Customer"
                },
                onChange: noop
            })
        );

        expect(markup).toContain("id=\"account-industry\"");
        expect(markup).toContain("id=\"account-type\"");
        expect(markup).toContain("role=\"combobox\"");
        expect(markup).toContain("slds-combobox__input slds-input_faux slds-combobox__input-value");
        expect(markup).not.toContain("<select");
        expect(markup).not.toContain("slds-select");
    });

    it("renders account required field errors with SLDS error markup", () => {
        const markup = renderToStaticMarkup(
            createElement(AccountFormFields, {
                fieldErrors: {
                    Name: "取引先名は必須です。"
                },
                value: blankAccount,
                onChange: noop
            })
        );

        expect(markup).toContain("slds-form-element slds-has-error");
        expect(markup).toContain("aria-describedby=\"account-name-error\"");
        expect(markup).toContain("aria-invalid=\"true\"");
        expect(markup).toContain("id=\"account-name-error\"");
        expect(markup).toContain("取引先名は必須です。");
    });

    it("renders loading account picklists without visible loading text", () => {
        const markup = renderToStaticMarkup(
            createElement(AccountFormFields, {
                loadingPicklists: true,
                value: blankAccount,
                onChange: noop
            })
        );

        expect(markup).toContain("aria-disabled=\"true\"");
        expect(markup).not.toContain("読み込み中...");
    });

    it("renders required indicators without native required validation", () => {
        const markup = renderToStaticMarkup(
            createElement(AccountFormFields, {
                value: blankAccount,
                onChange: noop
            })
        );

        expect(markup).toContain("<abbr class=\"slds-required\" title=\"required\" aria-hidden=\"true\">* </abbr>");
        expect(markup).not.toContain("required=\"\"");
        expect(markup).not.toContain("required=\"required\"");
    });
});
