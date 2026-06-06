import { readRecycleBinUndeletePayload } from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceActionRoute
} from "@/lib/salesforce/route-handler";
import { undeleteRecycleBinItems } from "@/services/salesforce/recycle-bin";

export async function POST(request: Request) {
    return handleSalesforceActionRoute(
        request,
        readRecycleBinUndeletePayload,
        (input) => undeleteRecycleBinItems(input.items)
    );
}
