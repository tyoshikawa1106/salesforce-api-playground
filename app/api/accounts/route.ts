import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";
import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { createAccount, listAccounts } from "@/services/salesforce/records";

export async function GET() {
    return handleSalesforceRoute(() => listAccounts());
}

export async function POST(request: Request) {
    return handleSalesforceRoute(async () => {
        const input = await readAccountCreatePayload(request);
        return createAccount(input);
    }, 201);
}
