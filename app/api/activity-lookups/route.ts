import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import {
    listActivityLookupOptions,
    readActivityLookupParams
} from "@/services/salesforce/activity-lookups";

export function GET(request: Request) {
    return handleSalesforceRoute(() => listActivityLookupOptions(readActivityLookupParams(request)));
}
