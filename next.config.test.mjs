import { describe, expect, it } from "vitest";
import nextConfig from "./next.config.mjs";

function getHeaderValue(headers, key) {
    return headers.find((header) => header.key === key)?.value;
}

describe("next security headers", () => {
    it("applies baseline security headers to all routes", async () => {
        const routes = await nextConfig.headers();
        const route = routes.find((candidate) => candidate.source === "/:path*");

        expect(route).toBeDefined();
        expect(getHeaderValue(route.headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
        expect(getHeaderValue(route.headers, "X-Content-Type-Options")).toBe("nosniff");
        expect(getHeaderValue(route.headers, "X-Frame-Options")).toBe("DENY");
        expect(getHeaderValue(route.headers, "Permissions-Policy")).toBe("camera=(), geolocation=(), microphone=()");
    });

    it("sets a CSP that preserves Next and SLDS browser compatibility without production unsafe eval", async () => {
        const routes = await nextConfig.headers();
        const route = routes.find((candidate) => candidate.source === "/:path*");
        const csp = getHeaderValue(route.headers, "Content-Security-Policy");

        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("base-uri 'self'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("img-src 'self' data: blob:");
        expect(csp).toContain("style-src 'self' 'unsafe-inline'");
        expect(csp).toContain("script-src 'self' 'unsafe-inline'");
        expect(csp).not.toContain("'unsafe-eval'");
    });
});
