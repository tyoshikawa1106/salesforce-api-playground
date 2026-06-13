import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { getCurrentUserName } from "@/services/salesforce/current-user";

export function GET() {
    return handleSalesforceRoute(async () => {
        const result = await getCurrentUserName();

        return {
            data: { userName: result.data },
            session: result.session
        };
    });
}
