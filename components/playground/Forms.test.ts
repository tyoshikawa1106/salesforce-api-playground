import { describe, expect, it } from "vitest";
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
                AccountId: "001xx000003DGbY"
            })
        ).toEqual({
            FirstName: "Taro",
            LastName: "Yamada",
            Email: "taro@example.test",
            Phone: "",
            Title: "",
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
        expect(contactAccountField).toEqual({
            key: "AccountId",
            id: "contact-account",
            label: "取引先"
        });
        expect(getRequiredFieldMessage(accountTextFields, "Name")).toBe("取引先名は必須です。");
    });
});
