import { SalesforceApiError } from "./client";
import { getConfiguredAppOrigin } from "./urls";

export type SalesforceObjectLabel = "Account" | "Contact";

const salesforceRecordIdPattern = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;
const recordIdPrefixes: Record<SalesforceObjectLabel, string> = {
    Account: "001",
    Contact: "003"
};

function getHeaderOrigin(value: string): string | null {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

export function assertSameOriginRequest(request: Pick<Request, "headers">): void {
    const expectedOrigin = getConfiguredAppOrigin();
    const requestOrigin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const actualOrigin = requestOrigin ?? (referer ? getHeaderOrigin(referer) : null);

    if (actualOrigin !== expectedOrigin) {
        throw new SalesforceApiError("Invalid request origin.", 403);
    }
}

export function assertSalesforceRecordId(id: string, objectLabel: SalesforceObjectLabel): void {
    if (!salesforceRecordIdPattern.test(id) || !id.startsWith(recordIdPrefixes[objectLabel])) {
        throw new SalesforceApiError(`Invalid ${objectLabel} id.`, 400);
    }
}
