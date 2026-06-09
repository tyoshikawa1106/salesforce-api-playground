import {
    readEventActivityUpdatePayload
} from "@/lib/salesforce/activity-payloads";
import {
    handleSalesforceDeleteRoute,
    handleSalesforceRoute,
    handleSalesforceUpdateRoute,
    type SalesforceRouteParams
} from "@/lib/salesforce/route-handler";
import { assertSalesforceRecordId } from "@/lib/salesforce/request-security";
import { deleteEventActivity, getEventActivity, updateEventActivity } from "@/services/salesforce/activities";

export function GET(_request: Request, { params }: SalesforceRouteParams) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSalesforceRecordId(id, "Event");
        return getEventActivity(id);
    });
}

export function PATCH(request: Request, params: SalesforceRouteParams) {
    return handleSalesforceUpdateRoute(
        request,
        params,
        "Event",
        readEventActivityUpdatePayload,
        updateEventActivity
    );
}

export function DELETE(request: Request, params: SalesforceRouteParams) {
    return handleSalesforceDeleteRoute(request, params, "Event", deleteEventActivity);
}
