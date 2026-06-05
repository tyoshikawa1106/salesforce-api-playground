import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";
import { handleSalesforceIntegrationUiCreateRoute } from "@/lib/salesforce/route-handler";
import { createIntegrationAccount } from "@/services/salesforce/records";

export async function POST(request: Request) {
    return handleSalesforceIntegrationUiCreateRoute(
        request,
        readAccountCreatePayload,
        createIntegrationAccount
    );
}
