import type {
  AccountInput,
  AccountUpdateInput,
  ContactInput,
  ContactUpdateInput
} from "./records";

type JsonRequest = Pick<Request, "json">;

function salesforcePayload<T>(body: unknown): T {
  return body as T;
}

async function readSalesforcePayload<T>(request: JsonRequest): Promise<T> {
  return salesforcePayload<T>(await request.json());
}

export async function readAccountCreatePayload(request: JsonRequest): Promise<AccountInput> {
  return readSalesforcePayload<AccountInput>(request);
}

export async function readAccountUpdatePayload(request: JsonRequest): Promise<AccountUpdateInput> {
  return readSalesforcePayload<AccountUpdateInput>(request);
}

export async function readContactCreatePayload(request: JsonRequest): Promise<ContactInput> {
  return readSalesforcePayload<ContactInput>(request);
}

export async function readContactUpdatePayload(request: JsonRequest): Promise<ContactUpdateInput> {
  return readSalesforcePayload<ContactUpdateInput>(request);
}
