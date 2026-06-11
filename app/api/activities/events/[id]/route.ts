import {
    readEventActivityUpdatePayload
} from "@/lib/salesforce/activity-payloads";
import { createSalesforceReadableRecordRouteHandlers } from "@/lib/salesforce/route-handler";
import { deleteEventActivity, getEventActivity, updateEventActivity } from "@/services/salesforce/activities";

const eventActivityRoutes = createSalesforceReadableRecordRouteHandlers({
    objectLabel: "Event",
    readUpdatePayload: readEventActivityUpdatePayload,
    getRecord: getEventActivity,
    updateRecord: updateEventActivity,
    deleteRecord: deleteEventActivity
});

export const { GET, PATCH, DELETE } = eventActivityRoutes;
