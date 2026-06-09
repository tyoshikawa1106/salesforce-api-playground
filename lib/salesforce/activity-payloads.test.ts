import { describe, expect, it } from "vitest";
import {
    readActivityParentFromUrl,
    readEventActivityCreatePayload,
    readEventActivityUpdatePayload,
    readTaskActivityCreatePayload,
    readTaskActivityUpdatePayload
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
                OwnerId: "005xx0000012345",
                WhoId: "003xx000004TmiQ",
                WhatId: "001xx000003DGbY",
                Status: " Not Started ",
                Priority: "",
                Description: " Follow up "
            }))
        ).resolves.toEqual({
            parentType: "account",
            parentId: "001xx000003DGbY",
            Subject: "Call customer",
            ActivityDate: "2026-06-08",
            OwnerId: "005xx0000012345",
            WhoId: "003xx000004TmiQ",
            WhatId: "001xx000003DGbY",
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
                StartDateTime: " 2026-06-08T10:00:00.000Z ",
                EndDateTime: "2026-06-08T11:00:00.000Z",
                OwnerId: "005xx0000012345",
                WhoId: "003xx000004TmiQ",
                WhatId: "001xx000003DGbY",
                Location: "",
                Description: " Discuss plan "
            }))
        ).resolves.toEqual({
            parentType: "contact",
            parentId: "003xx000004TmiQ",
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00:00.000Z",
            EndDateTime: "2026-06-08T11:00:00.000Z",
            OwnerId: "005xx0000012345",
            WhoId: "003xx000004TmiQ",
            WhatId: "001xx000003DGbY",
            Location: undefined,
            Description: "Discuss plan"
        });
    });

    it("accepts activity polymorphic lookup ids", async () => {
        await expect(
            readTaskActivityCreatePayload(jsonRequest({
                parentType: "account",
                parentId: "001xx000003DGbY",
                Subject: "Call lead",
                WhoId: "00Qxx000004TmiQ",
                WhatId: "006xx000003DGbY"
            }))
        ).resolves.toMatchObject({
            WhoId: "00Qxx000004TmiQ",
            WhatId: "006xx000003DGbY"
        });
    });

    it("rejects invalid activity lookup ids", async () => {
        await expect(
            readEventActivityCreatePayload(jsonRequest({
                parentType: "account",
                parentId: "001xx000003DGbY",
                Subject: "Meeting",
                StartDateTime: "2026-06-08T10:00:00.000Z",
                EndDateTime: "2026-06-08T11:00:00.000Z",
                OwnerId: "003xx000004TmiQ"
            }))
        ).rejects.toMatchObject({
            message: "Invalid User id.",
            status: 400
        });
    });

    it("rejects WhoId values outside Lead and Contact", async () => {
        await expect(
            readTaskActivityCreatePayload(jsonRequest({
                parentType: "account",
                parentId: "001xx000003DGbY",
                Subject: "Call",
                WhoId: "001xx000003DGbY"
            }))
        ).rejects.toMatchObject({
            message: "Invalid Who id.",
            status: 400
        });
    });

    it("normalizes task update payloads", async () => {
        await expect(
            readTaskActivityUpdatePayload(jsonRequest({
                Status: " Completed "
            }))
        ).resolves.toEqual({
            Status: "Completed"
        });
    });

    it("omits empty task update fields", async () => {
        await expect(
            readTaskActivityUpdatePayload(jsonRequest({
                Status: " "
            }))
        ).resolves.toEqual({});
    });

    it("normalizes task detail update payloads with nullable optional fields", async () => {
        await expect(
            readTaskActivityUpdatePayload(jsonRequest({
                Subject: " Call ",
                ActivityDate: "",
                OwnerId: "005xx0000012345",
                WhoId: null,
                WhatId: "001xx000003DGbY",
                Status: "In Progress",
                Description: " "
            }))
        ).resolves.toEqual({
            Subject: "Call",
            ActivityDate: null,
            OwnerId: "005xx0000012345",
            WhoId: null,
            WhatId: "001xx000003DGbY",
            Status: "In Progress",
            Description: null
        });
    });

    it("normalizes event detail update payloads", async () => {
        await expect(
            readEventActivityUpdatePayload(jsonRequest({
                Subject: " Meeting ",
                StartDateTime: "2026-06-08T10:00:00.000Z",
                EndDateTime: "2026-06-08T11:00:00.000Z",
                OwnerId: "005xx0000012345",
                WhoId: "003xx000004TmiQ",
                WhatId: null,
                Location: "",
                Description: " Discuss "
            }))
        ).resolves.toEqual({
            Subject: "Meeting",
            StartDateTime: "2026-06-08T10:00:00.000Z",
            EndDateTime: "2026-06-08T11:00:00.000Z",
            OwnerId: "005xx0000012345",
            WhoId: "003xx000004TmiQ",
            WhatId: null,
            Location: null,
            Description: "Discuss"
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

    it("rejects missing required event fields", async () => {
        await expect(
            readEventActivityCreatePayload(jsonRequest({
                parentType: "account",
                parentId: "001xx000003DGbY",
                Subject: "Meeting",
                StartDateTime: "2026-06-08T10:00:00.000Z",
                EndDateTime: ""
            }))
        ).rejects.toMatchObject({
            message: "EndDateTime is required.",
            status: 400
        });
    });
});
