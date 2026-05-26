import { readContactUpdatePayload } from "@/lib/salesforce/request-payloads";
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
        const input = await readContactUpdatePayload(request);
        return updateContact(id, input);
    });
}

export async function DELETE(_request: Request, { params }: Params) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        return deleteContact(id);
    });
}
