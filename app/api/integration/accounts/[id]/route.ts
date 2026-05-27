import { assertIntegrationApiKey } from "@/lib/salesforce/integration-security";
import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
import { assertSalesforceRecordId } from "@/lib/salesforce/request-security";
import { handleSalesforceIntegrationRoute } from "@/lib/salesforce/route-handler";
import { updateIntegrationAccount } from "@/services/salesforce/records";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(request: Request, { params }: Params) {
    return handleSalesforceIntegrationRoute(async () => {
        const { id } = await params;
        assertIntegrationApiKey(request);
        assertSalesforceRecordId(id, "Account");
        const input = await readAccountUpdatePayload(request);
        const { data } = await updateIntegrationAccount(id, input);
        return data;
    });
}
