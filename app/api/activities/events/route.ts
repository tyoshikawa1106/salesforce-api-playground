import { readEventActivityCreatePayload } from "@/lib/salesforce/activity-payloads";
import { handleSalesforceActionRoute } from "@/lib/salesforce/route-handler";
import { createEventActivity } from "@/services/salesforce/activities";

export function POST(request: Request) {
    return handleSalesforceActionRoute(request, readEventActivityCreatePayload, createEventActivity);
}
