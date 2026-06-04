import {
    readBulkDeletePayload,
    readContactCreatePayload
} from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceBulkDeleteRoute,
    handleSalesforceCreateRoute,
    handleSalesforceRoute
} from "@/lib/salesforce/route-handler";
import { createContact, deleteContacts, listContacts } from "@/services/salesforce/records";

export async function GET() {
    return handleSalesforceRoute(() => listContacts());
}

export async function POST(request: Request) {
    return handleSalesforceCreateRoute(request, readContactCreatePayload, createContact);
}

export async function DELETE(request: Request) {
    return handleSalesforceBulkDeleteRoute(request, "Contact", readBulkDeletePayload, deleteContacts);
}
