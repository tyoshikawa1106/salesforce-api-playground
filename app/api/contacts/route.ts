import {
  ContactInput,
  ContactRecord,
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

export async function GET() {
  try {
    const query = [
      "SELECT Id, FirstName, LastName, Email, Phone, Title, AccountId, Account.Name, LastModifiedDate",
      "FROM Contact",
      "ORDER BY LastModifiedDate DESC",
      "LIMIT 100"
    ].join(" ");
    const { data, session } = await salesforceFetch<SalesforceQueryResponse<ContactRecord>>(
      buildSalesforceQueryPath(query)
    );
    return jsonWithSession({ contacts: data.records }, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ContactInput;
    const { data, session } = await salesforceFetch<{ id: string; success: boolean }>(
      buildSalesforceSObjectCollectionPath("Contact"),
      buildSalesforceRequestInit("POST", input)
    );
    return jsonWithSession(data, session, 201);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
