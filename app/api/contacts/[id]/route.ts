import { readContactUpdatePayload } from "@/lib/salesforce/request-payloads";
import {
    assertSalesforceRecordId,
    assertSameOriginRequest
} from "@/lib/salesforce/request-security";
import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { deleteContact, updateContact } from "@/services/salesforce/records";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(request: Request, { params }: Params) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSameOriginRequest(request);
        assertSalesforceRecordId(id, "Contact");
        const input = await readContactUpdatePayload(request);
        return updateContact(id, input);
    });
}

export async function DELETE(request: Request, { params }: Params) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSameOriginRequest(request);
        assertSalesforceRecordId(id, "Contact");
        return deleteContact(id);
    });
}
