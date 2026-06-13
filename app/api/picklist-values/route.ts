import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { listPicklistValues, readPicklistValuesParams } from "@/services/salesforce/picklist-values";

export function GET(request: Request) {
    return handleSalesforceRoute(() => listPicklistValues(readPicklistValuesParams(request)));
}
