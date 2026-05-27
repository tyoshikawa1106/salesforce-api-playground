import { assertIntegrationApiKey } from "@/lib/salesforce/integration-security";
import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";
import { handleSalesforceIntegrationRoute } from "@/lib/salesforce/route-handler";
import { createIntegrationAccount } from "@/services/salesforce/records";

export async function POST(request: Request) {
    return handleSalesforceIntegrationRoute(async () => {
        assertIntegrationApiKey(request);
        const input = await readAccountCreatePayload(request);
        const { data } = await createIntegrationAccount(input);
        return data;
    }, 201);
}
