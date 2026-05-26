import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
import {
    assertSalesforceRecordId,
    assertSameOriginRequest
} from "@/lib/salesforce/request-security";
import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { deleteAccount, updateAccount } from "@/services/salesforce/records";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(request: Request, { params }: Params) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSameOriginRequest(request);
        assertSalesforceRecordId(id, "Account");
        const input = await readAccountUpdatePayload(request);
        return updateAccount(id, input);
    });
}

export async function DELETE(request: Request, { params }: Params) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSameOriginRequest(request);
        assertSalesforceRecordId(id, "Account");
        return deleteAccount(id);
    });
}
