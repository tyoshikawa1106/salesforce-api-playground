import {
    readTaskActivityUpdatePayload
} from "@/lib/salesforce/activity-payloads";
import {
    handleSalesforceUpdateRoute,
    type SalesforceRouteParams
} from "@/lib/salesforce/route-handler";
import { updateTaskActivity } from "@/services/salesforce/activities";

export function PATCH(request: Request, params: SalesforceRouteParams) {
    return handleSalesforceUpdateRoute(
        request,
        params,
        "Task",
        readTaskActivityUpdatePayload,
        updateTaskActivity
    );
}
