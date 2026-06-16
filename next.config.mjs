import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    `connect-src 'self'${isDevelopment ? " ws://localhost:* ws://127.0.0.1:*" : ""}`
].join("; ");

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff"
    },
    {
        key: "X-Frame-Options",
        value: "DENY"
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), geolocation=(), microphone=()"
    }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders
            }
        ];
    },
    outputFileTracingRoot: currentDirectory,
    reactStrictMode: true
};

export default nextConfig;
