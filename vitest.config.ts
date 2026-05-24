import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url))
        }
    },
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json-summary"],
            include: ["app/api/**/*.ts", "lib/**/*.ts"],
            exclude: ["**/*.test.ts", "app/api/test-helpers.ts"]
        },
        environment: "node"
    }
});
