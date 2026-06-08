import { describe, expect, it } from "vitest";
import {
    readAccountCreatePayload,
    readAccountUpdatePayload,
    readBulkDeletePayload,
    readContactCreatePayload,
    readContactUpdatePayload,
    readRecycleBinUndeletePayload
} from "./request-payloads";

function jsonRequest(body: unknown): Pick<Request, "json"> {
    return {
        json: async () => body
    };
}

describe("Salesforce request payload readers", () => {
    it("normalizes account create payloads and omits empty optional fields", async () => {
        const body = {
            Name: " Acme ",
            Phone: "",
            Website: undefined
        };

        await expect(readAccountCreatePayload(jsonRequest(body))).resolves.toEqual({
            Name: "Acme"
        });
    });

    it("normalizes account update payloads without rewriting nulls", async () => {
        const body = {
            Name: " Acme ",
            Phone: null,
            Website: ""
        };

        await expect(readAccountUpdatePayload(jsonRequest(body))).resolves.toEqual({
            Name: "Acme",
            Phone: null,
            Website: null
        });
    });

    it("normalizes contact create payloads and omits empty optional fields", async () => {
        const body = {
            FirstName: "",
            LastName: " Yamada ",
            AccountId: undefined
        };

        await expect(readContactCreatePayload(jsonRequest(body))).resolves.toEqual({
            LastName: "Yamada"
        });
    });

    it("normalizes contact update payloads without rewriting nulls", async () => {
        const body = {
            FirstName: null,
            LastName: " Yamada ",
            AccountId: null,
            Department: " Sales ",
            Title: ""
        };

        await expect(readContactUpdatePayload(jsonRequest(body))).resolves.toEqual({
            FirstName: null,
            LastName: "Yamada",
            AccountId: null,
            Department: "Sales",
            Title: null
        });
    });

    it("rejects non-object payloads", async () => {
        await expect(readAccountCreatePayload(jsonRequest(null))).rejects.toMatchObject({
            message: "Request body must be a JSON object.",
            status: 400
        });
    });

    it("rejects invalid JSON bodies as request errors", async () => {
        await expect(readAccountCreatePayload({
            json: async () => {
                throw new SyntaxError("Unexpected end of JSON input");
            }
        })).rejects.toMatchObject({
            message: "Request body must be valid JSON.",
            status: 400
        });
    });

    it("rejects unexpected fields before calling Salesforce", async () => {
        await expect(
            readContactCreatePayload(jsonRequest({ LastName: "Yamada", OwnerId: "005xx0000012345" }))
        ).rejects.toMatchObject({
            message: "Unexpected Contact field: OwnerId.",
            status: 400
        });
    });

    it("rejects missing required create fields", async () => {
        await expect(readAccountCreatePayload(jsonRequest({ Name: " " }))).rejects.toMatchObject({
            message: "Name is required.",
            status: 400
        });
    });

    it("rejects null values in create payloads", async () => {
        await expect(readContactCreatePayload(jsonRequest({ LastName: "Yamada", Email: null }))).rejects.toMatchObject({
            message: "Email must be a string.",
            status: 400
        });
    });

    it("rejects non-string field values", async () => {
        await expect(readAccountUpdatePayload(jsonRequest({ Phone: 123 }))).rejects.toMatchObject({
            message: "Phone must be a string.",
            status: 400
        });
    });

    it("normalizes bulk delete ids", async () => {
        await expect(readBulkDeletePayload(jsonRequest({ ids: [" 001xx000003DGbY ", "001xx000003DGbZ"] }))).resolves.toEqual({
            ids: ["001xx000003DGbY", "001xx000003DGbZ"]
        });
    });

    it("rejects empty bulk delete ids", async () => {
        await expect(readBulkDeletePayload(jsonRequest({ ids: [] }))).rejects.toMatchObject({
            message: "ids must include at least one id.",
            status: 400
        });
    });

    it("rejects non-string bulk delete ids", async () => {
        await expect(readBulkDeletePayload(jsonRequest({ ids: ["001xx000003DGbY", 123] }))).rejects.toMatchObject({
            message: "ids must include only non-empty strings.",
            status: 400
        });
    });

    it("normalizes recycle bin undelete items", async () => {
        await expect(
            readRecycleBinUndeletePayload(jsonRequest({
                items: [
                    { objectApiName: "Account", id: " 001xx000003DGbY " },
                    { objectApiName: "Contact", id: "003xx000004TmiQ" }
                ]
            }))
        ).resolves.toEqual({
            items: [
                { objectApiName: "Account", id: "001xx000003DGbY" },
                { objectApiName: "Contact", id: "003xx000004TmiQ" }
            ]
        });
    });

    it("rejects unsupported recycle bin objects", async () => {
        await expect(
            readRecycleBinUndeletePayload(jsonRequest({ items: [{ objectApiName: "Case", id: "500xx0000012345" }] }))
        ).rejects.toMatchObject({
            message: "Unsupported recycle bin object.",
            status: 400
        });
    });

    it("rejects recycle bin ids for another object", async () => {
        await expect(
            readRecycleBinUndeletePayload(jsonRequest({ items: [{ objectApiName: "Account", id: "003xx000004TmiQ" }] }))
        ).rejects.toMatchObject({
            message: "Invalid Account id.",
            status: 400
        });
    });
});
