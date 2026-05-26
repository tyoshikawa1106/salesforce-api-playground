import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
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
        const input = await readAccountUpdatePayload(request);
        return updateAccount(id, input);
    });
}

export async function DELETE(_request: Request, { params }: Params) {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        return deleteAccount(id);
    });
}
