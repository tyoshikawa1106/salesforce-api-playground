import { SalesforceApiError } from "./client";

export type JsonRequest = Pick<Request, "json">;

export function badPayload(message: string): SalesforceApiError {
    return new SalesforceApiError(message, 400);
}

export function isJsonObject(body: unknown): body is Record<string, unknown> {
    return typeof body === "object" && body !== null && !Array.isArray(body);
}

export async function readJsonBody(request: JsonRequest): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        throw badPayload("Request body must be valid JSON.");
    }
}

export async function readJsonObjectBody(request: JsonRequest): Promise<Record<string, unknown>> {
    const body = await readJsonBody(request);

    if (!isJsonObject(body)) {
        throw badPayload("Request body must be a JSON object.");
    }

    return body;
}
