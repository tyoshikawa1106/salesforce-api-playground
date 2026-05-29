import { afterEach, describe, expect, it, vi } from "vitest";
import { SalesforceApiError } from "./salesforce/client";
import { logServerError } from "./server-log";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("logServerError", () => {
    it("redacts Salesforce token and secret details before writing logs", () => {
        const error = new SalesforceApiError("token revoke failed", 400, {
            access_token: "access-token",
            nested: {
                clientSecret: "client-secret",
                message: "authorization=Bearer abc123"
            }
        });
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        logServerError("Salesforce token revocation failed during logout.", error);

        expect(consoleError).toHaveBeenCalledWith(
            "Salesforce token revocation failed during logout.",
            {
                name: "Error",
                message: "token revoke failed",
                status: 400,
                details: {
                    access_token: "[REDACTED]",
                    nested: {
                        clientSecret: "[REDACTED]",
                        message: "authorization=[REDACTED]"
                    }
                },
                cause: undefined
            }
        );
    });
});
