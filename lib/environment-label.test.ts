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

    it("prefers APP_ENV_LABEL when it is set", () => {
        expect(getEnvironmentLabel({ APP_ENV: "develop", APP_ENV_LABEL: "Staging" })).toEqual({
            label: "Staging"
        });
    });
});
