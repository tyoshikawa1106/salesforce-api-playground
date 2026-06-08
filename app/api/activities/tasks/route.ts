import { readTaskActivityCreatePayload } from "@/lib/salesforce/activity-payloads";
import { handleSalesforceActionRoute } from "@/lib/salesforce/route-handler";
import { createTaskActivity } from "@/services/salesforce/activities";

export function POST(request: Request) {
    return handleSalesforceActionRoute(request, readTaskActivityCreatePayload, createTaskActivity);
}
