import { afterEach, describe, expect, it, vi } from "vitest";
import {
    assertSalesforceRecordId,
    assertSameOriginRequest
} from "./request-security";
import { DEFAULT_SALESFORCE_API_VERSION } from "./api-version";
import { getSalesforceConfig } from "./config";

vi.mock("./config", () => ({
    getSalesforceConfig: vi.fn()
}));

const getSalesforceConfigMock = vi.mocked(getSalesforceConfig);

function requestWithHeaders(
    headers: HeadersInit,
    url = "https://app.example.test/api/accounts"
): Pick<Request, "headers" | "url"> {
    return {
        headers: new Headers(headers),
        url
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
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
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
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
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
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(requestWithHeaders({ origin: "https://evil.example.test" }))
        ).toThrow("Invalid request origin.");
    });

    it("accepts localhost requests when the request origin matches the request URL origin", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "http://localhost:3000/api/auth/callback",
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(
                requestWithHeaders(
                    { origin: "http://localhost:3003" },
                    "http://localhost:3003/api/activities/events"
                )
            )
        ).not.toThrow();
    });

    it("rejects localhost requests when the request origin does not match the request URL origin", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "http://localhost:3000/api/auth/callback",
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(
                requestWithHeaders(
                    { origin: "http://localhost:3003" },
                    "http://localhost:3004/api/activities/events"
                )
            )
        ).toThrow("Invalid request origin.");
    });

    it("rejects requests with an invalid referer URL", () => {
        getSalesforceConfigMock.mockReturnValue({
            clientId: "client-id",
            clientSecret: "client-secret",
            loginUrl: "https://login.example.test",
            redirectUri: "https://app.example.test/api/auth/callback",
            apiVersion: DEFAULT_SALESFORCE_API_VERSION,
            sessionSecret: "session-secret"
        });

        expect(() =>
            assertSameOriginRequest(requestWithHeaders({ referer: "not a url" }))
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
