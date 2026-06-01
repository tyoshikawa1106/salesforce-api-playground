import { timingSafeEqual } from "node:crypto";
import { SalesforceApiError } from "./client";
import { getSalesforceIntegrationConfig } from "./config";

export const INTEGRATION_API_KEY_HEADER = "x-integration-api-key";

function isSameApiKey(actual: string | null, expected: string): boolean {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(actual ?? "", "utf8");
    const comparableActualBuffer = Buffer.alloc(expectedBuffer.length);

    actualBuffer.copy(
        comparableActualBuffer,
        0,
        0,
        Math.min(actualBuffer.length, expectedBuffer.length)
    );

    return (
        timingSafeEqual(comparableActualBuffer, expectedBuffer) &&
        actual !== null &&
        actualBuffer.length === expectedBuffer.length
    );
}

export function assertIntegrationApiKey(request: Pick<Request, "headers">): void {
    const { apiKey } = getSalesforceIntegrationConfig();
    const actual = request.headers.get(INTEGRATION_API_KEY_HEADER);

    if (!isSameApiKey(actual, apiKey)) {
        throw new SalesforceApiError("Invalid integration API key.", 401);
    }
}
