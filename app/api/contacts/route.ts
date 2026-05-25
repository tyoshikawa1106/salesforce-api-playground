import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import { readContactCreatePayload } from "@/lib/salesforce/request-payloads";
import { createContact, listContacts } from "@/services/salesforce/records";

export async function GET() {
    try {
        const { data, session } = await listContacts();
        return jsonWithSession(data, session);
    } catch (error) {
        return salesforceErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const input = await readContactCreatePayload(request);
        const { data, session } = await createContact(input);
        return jsonWithSession(data, session, 201);
    } catch (error) {
        return salesforceErrorResponse(error);
    }
}
