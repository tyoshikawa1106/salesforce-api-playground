import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { countRecordObjects } from "@/services/salesforce/record-counts";

export function GET() {
    return handleSalesforceRoute(() => countRecordObjects());
}
