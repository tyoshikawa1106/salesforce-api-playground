import {
  AccountRecord,
  SalesforceQueryResponse,
  jsonWithSession,
  salesforceErrorResponse,
  salesforceFetch
} from "@/lib/salesforce/client";

type AccountInput = {
  Name: string;
  Phone?: string;
  Website?: string;
  Industry?: string;
  Type?: string;
  BillingCity?: string;
  BillingCountry?: string;
};

export async function GET() {
  try {
    const query = [
      "SELECT Id, Name, Phone, Website, Industry, Type, BillingCity, BillingCountry, LastModifiedDate",
      "FROM Account",
      "ORDER BY LastModifiedDate DESC",
      "LIMIT 100"
    ].join(" ");
    const { data, session } = await salesforceFetch<SalesforceQueryResponse<AccountRecord>>(
      `/query?q=${encodeURIComponent(query)}`
    );
    return jsonWithSession({ accounts: data.records }, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AccountInput;
    const { data, session } = await salesforceFetch<{ id: string; success: boolean }>(
      "/sobjects/Account",
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    );
    return jsonWithSession(data, session, 201);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
