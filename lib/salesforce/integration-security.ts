import { SalesforceApiError } from "./client";
import { getSalesforceIntegrationConfig } from "./config";

export const INTEGRATION_API_KEY_HEADER = "x-integration-api-key";

export function assertIntegrationApiKey(request: Pick<Request, "headers">): void {
    const { apiKey } = getSalesforceIntegrationConfig();
    const actual = request.headers.get(INTEGRATION_API_KEY_HEADER);

    if (actual !== apiKey) {
        throw new SalesforceApiError("Invalid integration API key.", 401);
    }
}
