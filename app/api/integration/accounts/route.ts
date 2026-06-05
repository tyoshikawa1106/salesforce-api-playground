import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";
import { handleSalesforceIntegrationCreateRoute } from "@/lib/salesforce/route-handler";
import { createIntegrationAccount } from "@/services/salesforce/records";

export async function POST(request: Request) {
    return handleSalesforceIntegrationCreateRoute(
        request,
        readAccountCreatePayload,
        createIntegrationAccount
    );
}
