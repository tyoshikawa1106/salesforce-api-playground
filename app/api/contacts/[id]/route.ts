import {
  jsonWithSession,
  salesforceErrorResponse
} from "@/lib/salesforce/client";
import { readContactUpdatePayload } from "@/lib/salesforce/request-payloads";
import { deleteContact, updateContact } from "@/services/salesforce/records";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const input = await readContactUpdatePayload(request);
    const { data, session } = await updateContact(id, input);
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { data, session } = await deleteContact(id);
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
