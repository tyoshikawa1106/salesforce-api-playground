import {
    readAccountCreatePayload,
    readBulkDeletePayload
} from "@/lib/salesforce/request-payloads";
import {
    handleSalesforceBulkDeleteRoute,
    handleSalesforceCreateRoute,
    handleSalesforceRoute
} from "@/lib/salesforce/route-handler";
import { createAccount, deleteAccounts, listAccounts } from "@/services/salesforce/records";

export async function GET() {
    return handleSalesforceRoute(() => listAccounts());
}

export async function POST(request: Request) {
    return handleSalesforceCreateRoute(request, readAccountCreatePayload, createAccount);
}

export async function DELETE(request: Request) {
    return handleSalesforceBulkDeleteRoute(request, "Account", readBulkDeletePayload, deleteAccounts);
}
