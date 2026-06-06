import {
    readAccountCreatePayload,
    readBulkDeletePayload
} from "@/lib/salesforce/request-payloads";
import { createSalesforceCollectionRouteHandlers } from "@/lib/salesforce/route-handler";
import { createAccount, deleteAccounts, listAccounts } from "@/services/salesforce/records";

const accountRoutes = createSalesforceCollectionRouteHandlers({
    objectLabel: "Account",
    readCreatePayload: readAccountCreatePayload,
    readBulkDeletePayload,
    listRecords: listAccounts,
    createRecord: createAccount,
    deleteRecords: deleteAccounts
});

export const { GET, POST, DELETE } = accountRoutes;
