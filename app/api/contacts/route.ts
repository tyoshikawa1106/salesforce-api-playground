import {
  ContactRecord,
  SalesforceQueryResponse,
  jsonWithSession,
  salesforceErrorResponse,
  salesforceFetch
} from "@/lib/salesforce/client";

type ContactInput = {
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Title?: string;
  AccountId?: string;
};

export async function GET() {
  try {
    const query = [
      "SELECT Id, FirstName, LastName, Email, Phone, Title, AccountId, Account.Name, LastModifiedDate",
      "FROM Contact",
      "ORDER BY LastModifiedDate DESC",
      "LIMIT 100"
    ].join(" ");
    const { data, session } = await salesforceFetch<SalesforceQueryResponse<ContactRecord>>(
      `/query?q=${encodeURIComponent(query)}`
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
      "/sobjects/Contact",
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
