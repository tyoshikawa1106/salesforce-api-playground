import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceIntegrationUpdateRoute,
    type SalesforceRouteParams
} from "@/lib/salesforce/route-handler";
import { updateIntegrationAccount } from "@/services/salesforce/records";

export async function PATCH(request: Request, { params }: SalesforceRouteParams) {
    return handleSalesforceIntegrationUpdateRoute(
        request,
        { params },
        "Account",
        readAccountUpdatePayload,
        updateIntegrationAccount
    );
}
