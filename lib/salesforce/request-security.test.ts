import { afterEach, describe, expect, it, vi } from "vitest";
import {
    assertSalesforceRecordId,
    assertSameOriginRequest
} from "./request-security";
import { getSalesforceConfig } from "./config";

vi.mock("./config", () => ({
    getSalesforceConfig: vi.fn()
}));

const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);

function requestWithHeaders(headers: HeadersInit): Pick<Request, "headers"> {
    return {
        headers: new Headers(headers)
    };
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("assertSameOriginRequest", () => {
    it("accepts requests with the configured origin header", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "https://app.example.test/api/auth/callback",
            apiVersion: "v62.0",
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(requestWithHeaders({ origin: "https://app.example.test" }))
        ).not.toThrow();
    });

    it("accepts requests with a same-origin referer when origin is missing", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "https://app.example.test/api/auth/callback",
            apiVersion: "v62.0",
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(requestWithHeaders({ referer: "https://app.example.test/accounts" }))
        ).not.toThrow();
    });

    it("rejects requests without a same-origin origin or referer", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "https://app.example.test/api/auth/callback",
            apiVersion: "v62.0",
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(requestWithHeaders({ origin: "https://evil.example.test" }))
        ).toThrow("Invalid request origin.");
    });
});

describe("assertSalesforceRecordId", () => {
    it("accepts 15 and 18 character ids for the expected standard object", () => {
        expect(() => assertSalesforceRecordId("001xx000003DGbY", "Account")).not.toThrow();
        expect(() => assertSalesforceRecordId("003xx000004TmiQAAA", "Contact")).not.toThrow();
    });

    it("rejects malformed ids and ids for another object prefix", () => {
        expect(() => assertSalesforceRecordId("003xx000004TmiQ", "Account")).toThrow("Invalid Account id.");
        expect(() => assertSalesforceRecordId("001xx000003DGbY!", "Account")).toThrow("Invalid Account id.");
    });
});
