import {
  AccountRecord,
  SalesforceQueryResponse,
  jsonWithSession,
  salesforceErrorResponse,
  salesforceFetch
} from "@/lib/salesforce/client";
import {
  buildSalesforceQueryPath,
  buildSalesforceRequestInit,
  buildSalesforceSObjectCollectionPath
} from "@/lib/salesforce/client-core";
import { readAccountCreatePayload } from "@/lib/salesforce/request-payloads";

export async function GET() {
  try {
    const query = [
      "SELECT Id, Name, Phone, Website, Industry, Type, BillingCity, BillingCountry, LastModifiedDate",
      "FROM Account",
      "ORDER BY LastModifiedDate DESC",
      "LIMIT 100"
    ].join(" ");
    const { data, session } = await salesforceFetch<SalesforceQueryResponse<AccountRecord>>(
      buildSalesforceQueryPath(query)
    );
    return jsonWithSession({ accounts: data.records }, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await readAccountCreatePayload(request);
    const { data, session } = await salesforceFetch<{ id: string; success: boolean }>(
      buildSalesforceSObjectCollectionPath("Account"),
      buildSalesforceRequestInit("POST", input)
    );
    return jsonWithSession(data, session, 201);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
