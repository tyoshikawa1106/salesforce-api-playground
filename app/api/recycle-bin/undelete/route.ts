import { readRecycleBinUndeletePayload } from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceRoute
} from "@/lib/salesforce/route-handler";
import { assertSameOriginRequest } from "@/lib/salesforce/request-security";
import { undeleteRecycleBinItems } from "@/services/salesforce/recycle-bin";

export async function POST(request: Request) {
    return handleSalesforceRoute(async () => {
        assertSameOriginRequest(request);
        const input = await readRecycleBinUndeletePayload(request);
        return undeleteRecycleBinItems(input.items);
    });
}
