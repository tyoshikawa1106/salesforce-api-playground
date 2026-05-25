import {
  jsonWithSession,
  salesforceErrorResponse
} from "@/lib/salesforce/client";
import { readAccountUpdatePayload } from "@/lib/salesforce/request-payloads";
import { deleteAccount, updateAccount } from "@/services/salesforce/records";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const input = await readAccountUpdatePayload(request);
    const { data, session } = await updateAccount(id, input);
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { data, session } = await deleteAccount(id);
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
