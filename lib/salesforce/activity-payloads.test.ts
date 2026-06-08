import { describe, expect, it } from "vitest";
import {
    readActivityParentFromUrl,
    readTaskActivityCreatePayload
} from "./activity-payloads";

function jsonRequest(body: unknown): Pick<Request, "json"> {
    return {
        json: async () => body
    };
}

describe("Salesforce activity payload readers", () => {
    it("normalizes task create payloads for accounts", async () => {
        await expect(
            readTaskActivityCreatePayload(jsonRequest({
                parentType: "account",
                parentId: "001xx000003DGbY",
                Subject: " Call customer ",
                ActivityDate: "2026-06-08",
                Status: " Not Started ",
                Priority: "",
                Description: " Follow up "
            }))
        ).resolves.toEqual({
            parentType: "account",
            parentId: "001xx000003DGbY",
            Subject: "Call customer",
            ActivityDate: "2026-06-08",
            Status: "Not Started",
            Priority: undefined,
            Description: "Follow up"
        });
    });

    it("reads activity parents from URL query parameters", () => {
        expect(readActivityParentFromUrl(new Request("https://app.example.test/api/activities?parentType=contact&parentId=003xx000004TmiQ"))).toEqual({
            parentType: "contact",
            parentId: "003xx000004TmiQ"
        });
    });

    it("rejects invalid parent types", async () => {
        await expect(
            readTaskActivityCreatePayload(jsonRequest({
                parentType: "lead",
                parentId: "00Qxx000004TmiQ",
                Subject: "Call"
            }))
        ).rejects.toMatchObject({
            message: "parentType must be account or contact.",
            status: 400
        });
    });

    it("rejects invalid parent ids for the selected object", () => {
        expect(() => readActivityParentFromUrl(new Request("https://app.example.test/api/activities?parentType=account&parentId=003xx000004TmiQ"))).toThrow("Invalid Account id.");
    });

    it("rejects invalid JSON bodies", async () => {
        await expect(readTaskActivityCreatePayload({
            json: async () => {
                throw new SyntaxError("Unexpected end of JSON input");
            }
        })).rejects.toMatchObject({
            message: "Request body must be valid JSON.",
            status: 400
        });
    });

    it("rejects missing required task fields", async () => {
        await expect(
            readTaskActivityCreatePayload(jsonRequest({
                parentType: "contact",
                parentId: "003xx000004TmiQ",
                Subject: " "
            }))
        ).rejects.toMatchObject({
            message: "Subject is required.",
            status: 400
        });
    });
});
