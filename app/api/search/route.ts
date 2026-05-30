import { SalesforceApiError } from "@/lib/salesforce/client";
import { handleSalesforceRoute } from "@/lib/salesforce/route-handler";
import { searchAccountsAndContacts } from "@/services/salesforce/records";

const minSearchQueryLength = 2;
const maxSearchQueryLength = 80;

function readSearchQuery(request: Request): string {
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

    if (!query) {
        throw new SalesforceApiError("検索キーワードを入力してください。", 400);
    }

    if (query.length < minSearchQueryLength) {
        throw new SalesforceApiError("検索キーワードは 2 文字以上で入力してください。", 400);
    }

    return query.slice(0, maxSearchQueryLength);
}

export async function GET(request: Request) {
    return handleSalesforceRoute(() => searchAccountsAndContacts(readSearchQuery(request)));
}
