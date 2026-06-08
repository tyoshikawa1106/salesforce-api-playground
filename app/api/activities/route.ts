import {
    readActivityParentFromUrl
} from "@/lib/salesforce/activity-payloads";
import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { listActivities } from "@/services/salesforce/activities";

export function GET(request: Request) {
    return handleSalesforceRoute(() => listActivities(readActivityParentFromUrl(request)));
}
