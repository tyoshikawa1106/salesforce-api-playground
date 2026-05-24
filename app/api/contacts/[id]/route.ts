import {
  jsonWithSession,
  salesforceErrorResponse
} from "@/lib/salesforce/client";
import { readContactUpdatePayload } from "@/lib/salesforce/request-payloads";
import { deleteContact, updateContact } from "@/services/salesforce/records";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const input = await readContactUpdatePayload(request);
    const { data, session } = await updateContact(params.id, input);
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { data, session } = await deleteContact(params.id);
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
