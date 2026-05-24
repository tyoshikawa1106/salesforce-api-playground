import { describe, expect, it } from "vitest";
import {
    readAccountCreatePayload,
    readAccountUpdatePayload,
    readContactCreatePayload,
    readContactUpdatePayload
} from "./request-payloads";

function jsonRequest(body: unknown): Pick<Request, "json"> {
    return {
        json: async () => body
    };
}

describe("Salesforce request payload readers", () => {
    it("treats account create request JSON as the Salesforce create payload without rewriting values", async () => {
        const body = {
            Name: "Acme",
            Phone: "",
            Website: undefined
        };

        await expect(readAccountCreatePayload(jsonRequest(body))).resolves.toBe(body);
    });

    it("treats account update request JSON as the Salesforce update payload without rewriting nulls", async () => {
        const body = {
            Name: "Acme",
            Phone: null
        };

        await expect(readAccountUpdatePayload(jsonRequest(body))).resolves.toBe(body);
    });

    it("treats contact create request JSON as the Salesforce create payload without rewriting values", async () => {
        const body = {
            FirstName: "",
            LastName: "Yamada",
            AccountId: undefined
        };

        await expect(readContactCreatePayload(jsonRequest(body))).resolves.toBe(body);
    });

    it("treats contact update request JSON as the Salesforce update payload without rewriting nulls", async () => {
        const body = {
            FirstName: null,
            LastName: "Yamada",
            AccountId: null
        };

        await expect(readContactUpdatePayload(jsonRequest(body))).resolves.toBe(body);
    });
});
