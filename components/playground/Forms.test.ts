import { describe, expect, it } from "vitest";
import {
    accountRecordToForm,
    blankAccount,
    blankContact,
    contactRecordToForm
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
});
