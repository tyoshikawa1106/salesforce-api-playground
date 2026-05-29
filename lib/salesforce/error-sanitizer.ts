const REDACTED_VALUE = "[REDACTED]";

const sensitiveKeyPattern = /(^|[_-])(access[_-]?token|refresh[_-]?token|client[_-]?secret|api[_-]?key|authorization|password|secret|token)$/i;
const authorizationParamPattern = /\bauthorization=Bearer\s+[^&\s]+/gi;
const sensitiveStringPattern = /\b(access_token|refresh_token|client_secret|clientSecret|api_key|apiKey|token|authorization)=([^&\s]+)/gi;
const bearerTokenPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isSensitiveKey(key: string): boolean {
    return sensitiveKeyPattern.test(key);
}

function redactSensitiveString(value: string): string {
    return value
        .replace(authorizationParamPattern, "authorization=[REDACTED]")
        .replace(sensitiveStringPattern, "$1=[REDACTED]")
        .replace(bearerTokenPattern, "Bearer [REDACTED]");
}

export function sanitizeSalesforceDetails(value: unknown, seen = new WeakSet<object>()): unknown {
    if (typeof value === "string") {
        return redactSensitiveString(value);
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeSalesforceDetails(item, seen));
    }

    if (!isObject(value)) {
        return value;
    }

    if (seen.has(value)) {
        return "[Circular]";
    }
    seen.add(value);

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
            key,
            isSensitiveKey(key) ? REDACTED_VALUE : sanitizeSalesforceDetails(item, seen)
        ])
    );
}

export function sanitizeErrorForLog(error: unknown): unknown {
    if (error instanceof Error) {
        const candidate = error as Error & {
            status?: unknown;
            details?: unknown;
            cause?: unknown;
        };

        return sanitizeSalesforceDetails({
            name: error.name,
            message: error.message,
            status: candidate.status,
            details: candidate.details,
            cause: candidate.cause
        });
    }

    return sanitizeSalesforceDetails(error);
}
