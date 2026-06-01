import { describe, expect, it } from "vitest";
import {
    sanitizeErrorForLog,
    sanitizeSalesforceDetails
} from "./error-sanitizer";

describe("sanitizeSalesforceDetails", () => {
    it("redacts sensitive keys and token-like strings deeply", () => {
        const sanitized = sanitizeSalesforceDetails({
            accessToken: "access-token-secret",
            nested: {
                url: "https://example.test/callback?access_token=secret&state=ok",
                header: "Authorization=Bearer token-secret",
                bearer: "Bearer token-secret"
            },
            list: ["api_key=secret", 123, null]
        });

        expect(sanitized).toEqual({
            accessToken: "[REDACTED]",
            nested: {
                url: "https://example.test/callback?access_token=[REDACTED]&state=ok",
                header: "authorization=[REDACTED]",
                bearer: "Bearer [REDACTED]"
            },
            list: ["api_key=[REDACTED]", 123, null]
        });
    });

    it("marks circular references without exposing the original object", () => {
        const value: { name: string; self?: unknown } = { name: "root" };
        value.self = value;

        expect(sanitizeSalesforceDetails(value)).toEqual({
            name: "root",
            self: "[Circular]"
        });
    });
});

describe("sanitizeErrorForLog", () => {
    it("sanitizes Error metadata", () => {
        const error = new Error("Salesforce failed") as Error & {
            status: number;
            details: unknown;
            cause: unknown;
        };
        error.status = 401;
        error.details = { refresh_token: "refresh-token-secret" };
        error.cause = "Bearer cause-token";

        expect(sanitizeErrorForLog(error)).toEqual({
            name: "Error",
            message: "Salesforce failed",
            status: 401,
            details: { refresh_token: "[REDACTED]" },
            cause: "Bearer [REDACTED]"
        });
    });

    it("sanitizes non-error values", () => {
        expect(sanitizeErrorForLog({
            message: "authorization=Bearer token-secret",
            client_secret: "client-secret"
        })).toEqual({
            message: "authorization=[REDACTED]",
            client_secret: "[REDACTED]"
        });
    });
});
