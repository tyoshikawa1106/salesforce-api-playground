import { readContactCreatePayload } from "@/lib/salesforce/request-payloads";
import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { createContact, listContacts } from "@/services/salesforce/records";

export async function GET() {
    return handleSalesforceRoute(() => listContacts());
}

export async function POST(request: Request) {
    return handleSalesforceRoute(async () => {
        const input = await readContactCreatePayload(request);
        return createContact(input);
    }, 201);
}
