import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceDeleteRoute,
    handleSalesforceUpdateRoute
} from "@/lib/salesforce/route-handler";
import type { SalesforceRouteParams } from "@/lib/salesforce/route-handler";
import { deleteAccount, updateAccount } from "@/services/salesforce/records";

export async function PATCH(request: Request, { params }: SalesforceRouteParams) {
    return handleSalesforceUpdateRoute(
        request,
        { params },
        "Account",
        readAccountUpdatePayload,
        updateAccount
    );
}

export async function DELETE(request: Request, { params }: SalesforceRouteParams) {
    return handleSalesforceDeleteRoute(request, { params }, "Account", deleteAccount);
}
