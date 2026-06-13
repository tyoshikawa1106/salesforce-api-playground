import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_SALESFORCE_API_VERSION,
    toJsforceApiVersion
} from "@/lib/salesforce/api-version";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import { SalesforceApiError } from "@/lib/salesforce/client";
import type { SalesforceSession } from "@/lib/salesforce/session";
import { getSession } from "@/lib/salesforce/session";
import { listPicklistValues, readPicklistValuesParams } from "./picklist-values";

const jsforceMocks = vi.hoisted(() => ({
    describe: vi.fn(),
    request: vi.fn(),
    connection: vi.fn(function Connection(this: unknown) {
        return {
            request: jsforceMocks.request,
            sobject: vi.fn(() => ({
                describe: jsforceMocks.describe
            }))
        };
    })
}));

vi.mock("jsforce", () => ({
    Connection: jsforceMocks.connection
}));

vi.mock("@/lib/salesforce/config", () => ({
    getSalesforceConfig: vi.fn()
}));

vi.mock("@/lib/salesforce/client", () => {
    class SalesforceApiError extends Error {
        constructor(
            message: string,
            public status: number,
            public details?: unknown
        ) {
            super(message);
        }
    }

    return {
        SalesforceApiError,
        refreshAccessToken: vi.fn()
    };
});

vi.mock("@/lib/salesforce/session", () => ({
    getSession: vi.fn()
}));

const getSessionMock = vi.mocked(getSession);
const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);

const session: SalesforceSession = {
    accessToken: "access-token",
    instanceUrl: "https://example.my.salesforce.com",
    issuedAt: 1700000000000,
    refreshToken: "refresh-token",
    userId: "005xx0000012345"
};

function describeResult({ customRecordType = false } = {}) {
    return {
        name: "Account",
        queryable: true,
        fields: [
            {
                name: "Industry",
                picklistValues: [
                    { active: true, label: "Technology", value: "Technology" },
                    { active: false, label: "Old", value: "Old" }
                ]
            },
            {
                name: "Type",
                picklistValues: [
                    { active: true, label: "Customer", value: "Customer" }
                ]
            }
        ],
        recordTypeInfos: customRecordType
            ? [
                {
                    available: true,
                    defaultRecordTypeMapping: true,
                    master: false,
                    recordTypeId: "012xx0000000001AAA"
                }
            ]
            : [
                {
                    available: true,
                    defaultRecordTypeMapping: true,
                    master: true,
                    recordTypeId: "012000000000000AAA"
                }
            ]
    };
}

beforeEach(() => {
    getSalesforceConfigMock.mockReturnValue({
        apiVersion: DEFAULT_SALESFORCE_API_VERSION,
        clientId: "client-id",
        clientSecret: "client-secret",
        loginUrl: "https://login.salesforce.com",
        redirectUri: "https://app.example.test/api/auth/callback",
        sessionSecret: "session-secret"
    });
    getSessionMock.mockResolvedValue(session);
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("Salesforce picklist value services", () => {
    it("uses describe picklist values when the object has no custom record types", async () => {
        jsforceMocks.describe.mockResolvedValue(describeResult());

        await expect(
            listPicklistValues({ objectApiName: "Account", fieldApiNames: ["Industry", "Type"] })
        ).resolves.toEqual({
            data: {
                fields: {
                    Industry: [{ defaultValue: undefined, label: "Technology", value: "Technology" }],
                    Type: [{ defaultValue: undefined, label: "Customer", value: "Customer" }]
                },
                recordTypeId: undefined
            },
            session
        });

        expect(jsforceMocks.request).not.toHaveBeenCalled();
        expect(jsforceMocks.connection).toHaveBeenCalledWith(expect.objectContaining({
            version: toJsforceApiVersion(DEFAULT_SALESFORCE_API_VERSION)
        }));
    });

    it("uses UI API picklist values for the target record type", async () => {
        jsforceMocks.describe.mockResolvedValue(describeResult({ customRecordType: true }));
        jsforceMocks.request.mockResolvedValue({
            values: [
                { label: "Record Type Customer", value: "Customer" }
            ]
        });

        await expect(
            listPicklistValues({ objectApiName: "Account", fieldApiNames: ["Type"] })
        ).resolves.toEqual({
            data: {
                fields: {
                    Type: [{ defaultValue: undefined, label: "Record Type Customer", value: "Customer" }]
                },
                recordTypeId: "012xx0000000001AAA"
            },
            session
        });

        expect(jsforceMocks.request).toHaveBeenCalledWith(
            "/ui-api/object-info/Account/picklist-values/012xx0000000001AAA/Type"
        );
    });

    it("falls back to describe values when UI API picklist retrieval fails", async () => {
        jsforceMocks.describe.mockResolvedValue(describeResult({ customRecordType: true }));
        jsforceMocks.request.mockRejectedValue(new Error("UI API unavailable"));

        await expect(
            listPicklistValues({ objectApiName: "Account", fieldApiNames: ["Industry"] })
        ).resolves.toMatchObject({
            data: {
                fields: {
                    Industry: [{ label: "Technology", value: "Technology" }]
                },
                recordTypeId: "012xx0000000001AAA"
            }
        });
    });

    it("rejects unsupported request params before Salesforce access", () => {
        const request = new Request("https://app.example.test/api/picklist-values?object=Contact&fields=Status");

        expect(() => readPicklistValuesParams(request)).toThrow("Unsupported picklist object.");
    });

    it("rejects invalid record type ids", () => {
        const request = new Request("https://app.example.test/api/picklist-values?object=Task&fields=Status&recordTypeId=bad");

        expect(() => readPicklistValuesParams(request)).toThrow(SalesforceApiError);
    });
});
