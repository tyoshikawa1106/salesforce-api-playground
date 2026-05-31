import { readContactCreatePayload } from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceCreateRoute,
    handleSalesforceRoute
} from "@/lib/salesforce/route-handler";
import { createContact, listContacts } from "@/services/salesforce/records";

export async function GET() {
    return handleSalesforceRoute(() => listContacts());
}

export async function POST(request: Request) {
    return handleSalesforceCreateRoute(request, readContactCreatePayload, createContact);
}
