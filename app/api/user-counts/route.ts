import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { countActiveUsers } from "@/services/salesforce/users";

export function GET() {
    return handleSalesforceRoute(() => countActiveUsers());
}
