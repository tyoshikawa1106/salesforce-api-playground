function isLocalhost(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function parseUrl(value: string, label: string): URL {
    try {
        return new URL(value);
    } catch {
        throw new Error(`${label} must be a valid URL.`);
    }
}

function assertNoCredentials(url: URL, label: string): void {
    if (url.username || url.password) {
        throw new Error(`${label} must not include credentials.`);
    }
}

function assertNoSearchOrHash(url: URL, label: string): void {
    if (url.search || url.hash) {
        throw new Error(`${label} must not include query or fragment.`);
    }
}

function assertOriginOnly(url: URL, label: string): void {
    if (url.pathname !== "/" && url.pathname !== "") {
        throw new Error(`${label} must not include a path.`);
    }
}

export function normalizeHttpsOriginUrl(value: string, label: string): string {
    const url = parseUrl(value, label);
    assertNoCredentials(url, label);

    if (url.protocol !== "https:") {
        throw new Error(`${label} must use https.`);
    }

    assertNoSearchOrHash(url, label);
    assertOriginOnly(url, label);

    return url.origin;
}

export function normalizeAppRedirectUri(value: string, label: string): string {
    const url = parseUrl(value, label);
    assertNoCredentials(url, label);
    assertNoSearchOrHash(url, label);

    if (url.protocol === "http:" && isLocalhost(url.hostname)) {
        return url.toString();
    }

    if (url.protocol !== "https:") {
        throw new Error(`${label} must use https, except localhost development URLs.`);
    }

    return url.toString();
}
