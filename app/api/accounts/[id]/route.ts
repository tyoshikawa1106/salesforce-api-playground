import {
  jsonWithSession,
  salesforceErrorResponse,
  salesforceFetch
} from "@/lib/salesforce/client";
import {
  buildSalesforceRequestInit,
  buildSalesforceSObjectRecordPath
} from "@/lib/salesforce/client-core";
import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const input = await readAccountUpdatePayload(request);
    const { data, session } = await salesforceFetch<Record<string, never>>(
      buildSalesforceSObjectRecordPath("Account", params.id),
      buildSalesforceRequestInit("PATCH", input)
    );
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { data, session } = await salesforceFetch<Record<string, never>>(
      buildSalesforceSObjectRecordPath("Account", params.id),
      buildSalesforceRequestInit("DELETE")
    );
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
