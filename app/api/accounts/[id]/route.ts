import {
  jsonWithSession,
  salesforceErrorResponse,
  salesforceFetch
} from "@/lib/salesforce/client";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const input = await request.json();
    const { data, session } = await salesforceFetch<Record<string, never>>(
      `/sobjects/Account/${encodeURIComponent(params.id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input)
      }
    );
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { data, session } = await salesforceFetch<Record<string, never>>(
      `/sobjects/Account/${encodeURIComponent(params.id)}`,
      {
        method: "DELETE"
      }
    );
    return jsonWithSession(data, session);
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
