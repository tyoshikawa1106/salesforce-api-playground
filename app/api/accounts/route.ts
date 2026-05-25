import {
    jsonWithSession,
    salesforceErrorResponse
} from "@/lib/salesforce/client";
import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";
import { createAccount, listAccounts } from "@/services/salesforce/records";

export async function GET() {
    try {
        const { data, session } = await listAccounts();
        return jsonWithSession(data, session);
    } catch (error) {
        return salesforceErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const input = await readAccountCreatePayload(request);
        const { data, session } = await createAccount(input);
        return jsonWithSession(data, session, 201);
    } catch (error) {
        return salesforceErrorResponse(error);
    }
}
