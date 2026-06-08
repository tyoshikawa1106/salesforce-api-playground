import { SalesforceApiError } from "./client";
import type {
    ActivityParent,
    ActivityParentType,
    EventActivityInput,
    TaskActivityInput
} from "./activities";
import { assertSalesforceRecordId } from "./request-security";

type JsonRequest = Pick<Request, "json">;

const activityParentTypes = new Set<ActivityParentType>(["account", "contact"]);

function badPayload(message: string): SalesforceApiError {
    return new SalesforceApiError(message, 400);
}

function isJsonObject(body: unknown): body is Record<string, unknown> {
    return typeof body === "object" && body !== null && !Array.isArray(body);
}

function readOptionalString(body: Record<string, unknown>, key: string): string | undefined {
    const value = body[key];

    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== "string") {
        throw badPayload(`${key} must be a string.`);
    }

    return value.trim() || undefined;
}

function readRequiredString(body: Record<string, unknown>, key: string): string {
    const value = readOptionalString(body, key);

    if (!value) {
        throw badPayload(`${key} is required.`);
    }

    return value;
}

function readParent(body: Record<string, unknown>): ActivityParent {
    const parentType = readRequiredString(body, "parentType");
    const parentId = readRequiredString(body, "parentId");

    if (!activityParentTypes.has(parentType as ActivityParentType)) {
        throw badPayload("parentType must be account or contact.");
    }

    assertSalesforceRecordId(parentId, parentType === "account" ? "Account" : "Contact");

    return {
        parentType: parentType as ActivityParentType,
        parentId
    };
}

async function readActivityBody(request: JsonRequest): Promise<Record<string, unknown>> {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        throw badPayload("Request body must be valid JSON.");
    }

    if (!isJsonObject(body)) {
        throw badPayload("Request body must be a JSON object.");
    }

    return body;
}

export async function readTaskActivityCreatePayload(request: JsonRequest): Promise<TaskActivityInput> {
    const body = await readActivityBody(request);

    return {
        ...readParent(body),
        Subject: readRequiredString(body, "Subject"),
        ActivityDate: readOptionalString(body, "ActivityDate"),
        Status: readOptionalString(body, "Status"),
        Priority: readOptionalString(body, "Priority"),
        Description: readOptionalString(body, "Description")
    };
}

export async function readEventActivityCreatePayload(request: JsonRequest): Promise<EventActivityInput> {
    const body = await readActivityBody(request);

    return {
        ...readParent(body),
        Subject: readRequiredString(body, "Subject"),
        StartDateTime: readRequiredString(body, "StartDateTime"),
        EndDateTime: readRequiredString(body, "EndDateTime"),
        Location: readOptionalString(body, "Location"),
        Description: readOptionalString(body, "Description")
    };
}

export function readActivityParentFromUrl(request: Pick<Request, "url">): ActivityParent {
    const searchParams = new URL(request.url).searchParams;
    const parentType = searchParams.get("parentType") ?? "";
    const parentId = searchParams.get("parentId") ?? "";

    if (!activityParentTypes.has(parentType as ActivityParentType)) {
        throw badPayload("parentType must be account or contact.");
    }

    assertSalesforceRecordId(parentId, parentType === "account" ? "Account" : "Contact");

    return {
        parentType: parentType as ActivityParentType,
        parentId
    };
}
