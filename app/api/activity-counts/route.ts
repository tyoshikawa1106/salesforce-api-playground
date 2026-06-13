import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { countActivities } from "@/services/salesforce/activities";

export function GET() {
    return handleSalesforceRoute(() => countActivities());
}
