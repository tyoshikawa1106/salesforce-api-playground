import { defineConfig } from "vitest/config";
import { transformWithOxc } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
    plugins: [
        {
            name: "test-tsx-transform",
            enforce: "pre",
            async transform(code, id) {
                if (!id.endsWith(".tsx")) {
                    return null;
                }

                return transformWithOxc(code, id, {
                    lang: "tsx",
                    jsx: {
                        runtime: "automatic"
                    }
                });
            }
        }
    ],
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
            exclude: ["**/*.test.ts", "app/api/test-helpers.ts"],
            thresholds: {
                statements: 90,
                branches: 85,
                functions: 90,
                lines: 90
            }
        },
        environment: "node"
    }
});
