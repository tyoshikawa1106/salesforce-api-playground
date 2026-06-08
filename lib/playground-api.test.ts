import { describe, expect, it } from "vitest";
import {
    buildAccountCreatePayload,
    buildAccountUpdatePayload,
    buildBulkDeleteRecordsRequest,
    buildContactCreatePayload,
    buildContactUpdatePayload,
    buildCreateRecordPayload,
    buildCreateRecordRequest,
    buildDeleteRecordRequest,
    buildPlaygroundApiRequest,
    buildUpdateRecordPayload,
    buildUpdateRecordRequest,
    compactPayload,
    playgroundApiPaths
} from "./playground-api";

describe("playgroundApiPaths", () => {
    it("builds app API paths for Salesforce playground resources", () => {
        expect(playgroundApiPaths.session).toBe("/api/session");
        expect(playgroundApiPaths.accounts).toBe("/api/accounts");
        expect(playgroundApiPaths.contacts).toBe("/api/contacts");
        expect(playgroundApiPaths.integrationAccounts).toBe("/api/integration/ui/accounts");
        expect(playgroundApiPaths.record("accounts", "001xx000003DGbY")).toBe(
            "/api/accounts/001xx000003DGbY"
        );
    });

    it("encodes user-controlled values before adding them to URLs", () => {
        expect(playgroundApiPaths.search("<script>alert(1)</script>&next=/")).toBe(
            "/api/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E%26next%3D%2F"
        );
        expect(playgroundApiPaths.record("contacts", "003xx000004TmiQ/../../x?<script>")).toBe(
            "/api/contacts/003xx000004TmiQ%2F..%2F..%2Fx%3F%3Cscript%3E"
        );
        expect(playgroundApiPaths.activityLookups("contact", "Gonzalez & Edge")).toBe(
            "/api/activity-lookups?object=contact&q=Gonzalez+%26+Edge"
        );
    });
});

describe("buildPlaygroundApiRequest", () => {
    it("builds a JSON API request without changing GET defaults", () => {
        expect(buildPlaygroundApiRequest(playgroundApiPaths.accounts)).toEqual({
            url: "/api/accounts",
            init: {
                headers: {
                    "content-type": "application/json"
                }
            }
        });
    });

    it("builds method and JSON body for mutations", () => {
        expect(
            buildPlaygroundApiRequest(playgroundApiPaths.contacts, {
                method: "POST",
                body: {
                    LastName: "Yamada",
                    Email: undefined
                }
            })
        ).toEqual({
            url: "/api/contacts",
            init: {
                headers: {
                    "content-type": "application/json"
                },
                method: "POST",
                body: "{\"LastName\":\"Yamada\"}"
            }
        });
    });
});

describe("record request builders", () => {
    it("builds create, update, delete, and bulk delete requests for resources", () => {
        expect(buildCreateRecordRequest("accounts", { Name: "Acme" })).toMatchObject({
            url: "/api/accounts",
            init: { method: "POST" }
        });
        expect(buildUpdateRecordRequest("contacts", "003xx000004TmiQ", { LastName: "Yamada" })).toMatchObject({
            url: "/api/contacts/003xx000004TmiQ",
            init: { method: "PATCH" }
        });
        expect(buildDeleteRecordRequest("accounts", "001xx000003DGbY")).toMatchObject({
            url: "/api/accounts/001xx000003DGbY",
            init: { method: "DELETE" }
        });
        expect(buildBulkDeleteRecordsRequest("contacts", ["003xx000004TmiQ"])).toMatchObject({
            url: "/api/contacts",
            init: {
                method: "DELETE",
                body: JSON.stringify({ ids: ["003xx000004TmiQ"] })
            }
        });
    });
});

describe("compactPayload", () => {
    it("trims form values and omits empty values for create requests", () => {
        expect(
            compactPayload({
                Name: " Acme ",
                Phone: " "
            })
        ).toEqual({
            Name: "Acme",
            Phone: undefined
        });
    });

    it("turns empty values into null for update requests", () => {
        expect(
            compactPayload(
                {
                    Name: " Acme ",
                    Phone: " "
                },
                { emptyAsNull: true }
            )
        ).toEqual({
            Name: "Acme",
            Phone: null
        });
    });
});

describe("form payload builders", () => {
    it("builds account create and update payloads with the existing empty value rules", () => {
        const form = {
            Name: " Acme ",
            Phone: " ",
            Website: " https://example.test ",
            Industry: "",
            Type: "",
            BillingCity: " Tokyo ",
            BillingCountry: ""
        };

        expect(buildAccountCreatePayload(form)).toEqual({
            Name: "Acme",
            Phone: undefined,
            Website: "https://example.test",
            Industry: undefined,
            Type: undefined,
            BillingCity: "Tokyo",
            BillingCountry: undefined
        });
        expect(buildAccountUpdatePayload(form)).toEqual({
            Name: "Acme",
            Phone: null,
            Website: "https://example.test",
            Industry: null,
            Type: null,
            BillingCity: "Tokyo",
            BillingCountry: null
        });
    });

    it("builds contact create and update payloads with the existing empty value rules", () => {
        const form = {
            FirstName: " Taro ",
            LastName: " Yamada ",
            Email: " ",
            Phone: "",
            Title: " Manager ",
            Department: " Sales ",
            AccountId: ""
        };

        expect(buildContactCreatePayload(form)).toEqual({
            FirstName: "Taro",
            LastName: "Yamada",
            Email: undefined,
            Phone: undefined,
            Title: "Manager",
            Department: "Sales",
            AccountId: undefined
        });
        expect(buildContactUpdatePayload(form)).toEqual({
            FirstName: "Taro",
            LastName: "Yamada",
            Email: null,
            Phone: null,
            Title: "Manager",
            Department: "Sales",
            AccountId: null
        });
    });

    it("builds resource-specific create and update payloads", () => {
        expect(buildCreateRecordPayload("accounts", {
            Name: " Acme ",
            Phone: "",
            Website: "",
            Industry: "",
            Type: "",
            BillingCity: "",
            BillingCountry: ""
        })).toMatchObject({
            Name: "Acme",
            Phone: undefined
        });

        expect(buildUpdateRecordPayload("contacts", {
            FirstName: "",
            LastName: " Yamada ",
            Email: "",
            Phone: "",
            Title: "",
            Department: "",
            AccountId: ""
        })).toMatchObject({
            FirstName: null,
            LastName: "Yamada",
            Email: null
        });
    });
});
