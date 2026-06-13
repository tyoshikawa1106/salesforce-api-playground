import { describe, expect, it } from "vitest";
import { getEnvironmentLabel } from "./environment-label";

describe("getEnvironmentLabel", () => {
    it("does not show a label when APP_ENV is missing", () => {
        expect(getEnvironmentLabel({})).toBeNull();
    });

    it.each(["main", "production", "prod", " MAIN "])(
        "does not show a label for production environment %s",
        (appEnv) => {
            expect(getEnvironmentLabel({ APP_ENV: appEnv })).toBeNull();
        }
    );

    it("shows APP_ENV for non-production environments", () => {
        expect(getEnvironmentLabel({ APP_ENV: "develop" })).toEqual({ label: "develop" });
    });

    it.each(["localhost:3000", "127.0.0.1:3000", "[::1]:3000"])(
        "shows LOCAL for local request host %s when APP_ENV is missing",
        (requestHost) => {
            expect(getEnvironmentLabel({}, requestHost)).toEqual({ label: "LOCAL" });
        }
    );

    it("does not show LOCAL for non-local request hosts when APP_ENV is missing", () => {
        expect(getEnvironmentLabel({}, "example.com")).toBeNull();
    });

    it("prefers APP_ENV_LABEL when it is set", () => {
        expect(getEnvironmentLabel({ APP_ENV: "develop", APP_ENV_LABEL: "STAGING" }, "localhost:3000")).toEqual(
            {
                label: "STAGING"
            }
        );
    });
});
