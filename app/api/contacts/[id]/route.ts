import { readContactUpdatePayload } from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceDeleteRoute,
    handleSalesforceUpdateRoute
} from "@/lib/salesforce/route-handler";
import type { SalesforceRouteParams } from "@/lib/salesforce/route-handler";
import { deleteContact, updateContact } from "@/services/salesforce/records";

export async function PATCH(request: Request, { params }: SalesforceRouteParams) {
    return handleSalesforceUpdateRoute(
        request,
        { params },
        "Contact",
        readContactUpdatePayload,
        updateContact
    );
}

export async function DELETE(request: Request, { params }: SalesforceRouteParams) {
    return handleSalesforceDeleteRoute(request, { params }, "Contact", deleteContact);
}
