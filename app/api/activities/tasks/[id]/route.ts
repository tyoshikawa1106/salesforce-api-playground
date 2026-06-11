import {
    readTaskActivityUpdatePayload
} from "@/lib/salesforce/activity-payloads";
import { createSalesforceReadableRecordRouteHandlers } from "@/lib/salesforce/route-handler";
import { deleteTaskActivity, getTaskActivity, updateTaskActivity } from "@/services/salesforce/activities";

const taskActivityRoutes = createSalesforceReadableRecordRouteHandlers({
    objectLabel: "Task",
    readUpdatePayload: readTaskActivityUpdatePayload,
    getRecord: getTaskActivity,
    updateRecord: updateTaskActivity,
    deleteRecord: deleteTaskActivity
});

export const { GET, PATCH, DELETE } = taskActivityRoutes;
