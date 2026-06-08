import { describe, expect, it } from "vitest";
import {
    readActivityParentFromUrl,
    readEventActivityCreatePayload,
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

    it("normalizes event create payloads for contacts", async () => {
        await expect(
            readEventActivityCreatePayload(jsonRequest({
                parentType: "contact",
                parentId: "003xx000004TmiQ",
                Subject: " Meeting ",
                StartDateTime: "2026-06-08T10:00:00.000Z",
                EndDateTime: "2026-06-08T11:00:00.000Z",
                Location: " Online ",
                Description: ""
            }))
        ).resolves.toEqual({
            parentType: "contact",
            parentId: "003xx000004TmiQ",
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00:00.000Z",
            EndDateTime: "2026-06-08T11:00:00.000Z",
            Location: "Online",
            Description: undefined
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
        await expect(readEventActivityCreatePayload({
            json: async () => {
                throw new SyntaxError("Unexpected end of JSON input");
            }
        })).rejects.toMatchObject({
            message: "Request body must be valid JSON.",
            status: 400
        });
    });

    it("rejects missing required event fields", async () => {
        await expect(
            readEventActivityCreatePayload(jsonRequest({
                parentType: "contact",
                parentId: "003xx000004TmiQ",
                Subject: "Meeting",
                StartDateTime: "2026-06-08T10:00:00.000Z"
            }))
        ).rejects.toMatchObject({
            message: "EndDateTime is required.",
            status: 400
        });
    });
});
