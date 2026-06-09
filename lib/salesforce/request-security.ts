import { SalesforceApiError } from "./client";
import { getConfiguredAppOrigin } from "./urls";

export type SalesforceObjectLabel = "Account" | "Contact" | "Task" | "User";

const salesforceRecordIdPattern = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;
const recordIdPrefixes: Record<SalesforceObjectLabel, string> = {
    Account: "001",
    Contact: "003",
    Task: "00T",
    User: "005"
};

function getHeaderOrigin(value: string): string | null {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

function isLocalhostOrigin(origin: string): boolean {
    try {
        const hostname = new URL(origin).hostname;
        return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    } catch {
        return false;
    }
}

function getRequestOrigin(request: Pick<Request, "url">): string | null {
    try {
        return new URL(request.url).origin;
    } catch {
        return null;
    }
}

export function assertSameOriginRequest(request: Pick<Request, "headers" | "url">): void {
    const expectedOrigin = getConfiguredAppOrigin();
    const requestOrigin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const actualOrigin = requestOrigin ?? (referer ? getHeaderOrigin(referer) : null);
    const localRequestOrigin = getRequestOrigin(request);

    if (
        actualOrigin !== expectedOrigin &&
        !(actualOrigin && actualOrigin === localRequestOrigin && isLocalhostOrigin(actualOrigin))
    ) {
        throw new SalesforceApiError("Invalid request origin.", 403);
    }
}

export function assertSalesforceRecordId(id: string, objectLabel: SalesforceObjectLabel): void {
    if (!salesforceRecordIdPattern.test(id) || !id.startsWith(recordIdPrefixes[objectLabel])) {
        throw new SalesforceApiError(`Invalid ${objectLabel} id.`, 400);
    }
}
