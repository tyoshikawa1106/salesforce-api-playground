import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
import { createSalesforceRecordRouteHandlers } from "@/lib/salesforce/route-handler";
import { deleteAccount, updateAccount } from "@/services/salesforce/records";

const accountRecordRoutes = createSalesforceRecordRouteHandlers({
    objectLabel: "Account",
    readUpdatePayload: readAccountUpdatePayload,
    updateRecord: updateAccount,
    deleteRecord: deleteAccount
});

export const { PATCH, DELETE } = accountRecordRoutes;
