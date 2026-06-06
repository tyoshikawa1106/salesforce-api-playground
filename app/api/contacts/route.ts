import {
    readBulkDeletePayload,
    readContactCreatePayload
} from "@/lib/salesforce/request-payloads";
import { createSalesforceCollectionRouteHandlers } from "@/lib/salesforce/route-handler";
import { createContact, deleteContacts, listContacts } from "@/services/salesforce/records";

const contactRoutes = createSalesforceCollectionRouteHandlers({
    objectLabel: "Contact",
    readCreatePayload: readContactCreatePayload,
    readBulkDeletePayload,
    listRecords: listContacts,
    createRecord: createContact,
    deleteRecords: deleteContacts
});

export const { GET, POST, DELETE } = contactRoutes;
