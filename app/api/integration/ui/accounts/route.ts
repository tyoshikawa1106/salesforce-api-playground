import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";
import { assertSameOriginRequest } from "@/lib/salesforce/request-security";
import { handleSalesforceIntegrationRoute } from "@/lib/salesforce/route-handler";
import { getSession } from "@/lib/salesforce/session";
import { SalesforceApiError } from "@/lib/salesforce/client";
import { createIntegrationAccount } from "@/services/salesforce/records";

export async function POST(request: Request) {
    return handleSalesforceIntegrationRoute(async () => {
        assertSameOriginRequest(request);
        const session = await getSession();
        if (!session) {
            throw new SalesforceApiError("Salesforce session is required.", 401);
        }

        const input = await readAccountCreatePayload(request);
        const { data } = await createIntegrationAccount(input);
        return data;
    }, 201);
}
