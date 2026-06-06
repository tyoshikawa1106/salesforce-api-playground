import { readContactUpdatePayload } from "@/lib/salesforce/request-payloads";
import { createSalesforceRecordRouteHandlers } from "@/lib/salesforce/route-handler";
import { deleteContact, updateContact } from "@/services/salesforce/records";

const contactRecordRoutes = createSalesforceRecordRouteHandlers({
    objectLabel: "Contact",
    readUpdatePayload: readContactUpdatePayload,
    updateRecord: updateContact,
    deleteRecord: deleteContact
});

export const { PATCH, DELETE } = contactRecordRoutes;
