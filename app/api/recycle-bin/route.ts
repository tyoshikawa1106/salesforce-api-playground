import {
    handleSalesforceRoute
} from "@/lib/salesforce/route-handler";
import { listRecycleBinItems } from "@/services/salesforce/recycle-bin";

export async function GET() {
    return handleSalesforceRoute(() => listRecycleBinItems());
}
