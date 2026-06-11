import type {
    ActivityParent,
    ActivityParentType,
    EventActivityInput,
    EventActivityUpdateInput,
    TaskActivityInput,
    TaskActivityUpdateInput
} from "./activities";
import {
    assertSalesforceRecordId,
    assertSalesforceRecordIdForAnyObject,
    assertSalesforceRecordIdFormat
} from "./request-security";
import {
    badPayload,
    readJsonObjectBody,
    type JsonRequest
} from "./json-payload";

const activityParentTypes = new Set<ActivityParentType>(["account", "contact"]);
const taskSubtypeValues = new Set(["Task", "Email", "LinkedIn", "ListEmail", "Cadence", "Call"]);

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

function readOptionalNullableString(body: Record<string, unknown>, key: string): string | null | undefined {
    const value = body[key];

    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value !== "string") {
        throw badPayload(`${key} must be a string.`);
    }

    return value.trim() || null;
}

function readRequiredString(body: Record<string, unknown>, key: string): string {
    const value = readOptionalString(body, key);

    if (!value) {
        throw badPayload(`${key} is required.`);
    }

    return value;
}

function readOptionalPicklistValue(body: Record<string, unknown>, key: string, values: Set<string>): string | undefined {
    const value = readOptionalString(body, key);

    if (value && !values.has(value)) {
        throw badPayload(`${key} is invalid.`);
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
    return readJsonObjectBody(request);
}

function assertActivityLookupIds({
    OwnerId,
    WhoId,
    WhatId
}: {
    OwnerId?: string | null;
    WhoId?: string | null;
    WhatId?: string | null;
}) {
    if (OwnerId) {
        assertSalesforceRecordId(OwnerId, "User");
    }

    if (WhoId) {
        assertSalesforceRecordIdForAnyObject(WhoId, ["Contact", "Lead"], "Who");
    }

    if (WhatId) {
        assertSalesforceRecordIdFormat(WhatId, "What");
    }
}

function readActivityLookupIds(body: Record<string, unknown>) {
    const OwnerId = readOptionalString(body, "OwnerId");
    const WhoId = readOptionalString(body, "WhoId");
    const WhatId = readOptionalString(body, "WhatId");

    assertActivityLookupIds({ OwnerId, WhoId, WhatId });

    return {
        ...(OwnerId ? { OwnerId } : {}),
        ...(WhoId ? { WhoId } : {}),
        ...(WhatId ? { WhatId } : {})
    };
}

function readActivityLookupUpdateIds(body: Record<string, unknown>) {
    const OwnerId = readOptionalNullableString(body, "OwnerId");
    const WhoId = readOptionalNullableString(body, "WhoId");
    const WhatId = readOptionalNullableString(body, "WhatId");

    assertActivityLookupIds({ OwnerId, WhoId, WhatId });

    return {
        ...(OwnerId !== undefined ? { OwnerId } : {}),
        ...(WhoId !== undefined ? { WhoId } : {}),
        ...(WhatId !== undefined ? { WhatId } : {})
    };
}

function compactUpdatePayload<T extends Record<string, string | null | undefined>>(payload: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
}

export async function readTaskActivityCreatePayload(request: JsonRequest): Promise<TaskActivityInput> {
    const body = await readActivityBody(request);
    const lookupIds = readActivityLookupIds(body);

    return {
        ...readParent(body),
        Subject: readRequiredString(body, "Subject"),
        ActivityDate: readOptionalString(body, "ActivityDate"),
        ...lookupIds,
        Status: readOptionalString(body, "Status"),
        Priority: readOptionalString(body, "Priority"),
        TaskSubtype: readOptionalPicklistValue(body, "TaskSubtype", taskSubtypeValues),
        Description: readOptionalString(body, "Description")
    };
}

export async function readTaskActivityUpdatePayload(request: JsonRequest): Promise<TaskActivityUpdateInput> {
    const body = await readActivityBody(request);
    const lookupIds = readActivityLookupUpdateIds(body);

    return compactUpdatePayload({
        Subject: readOptionalString(body, "Subject"),
        ActivityDate: readOptionalNullableString(body, "ActivityDate"),
        ...lookupIds,
        Status: readOptionalString(body, "Status"),
        Priority: readOptionalNullableString(body, "Priority"),
        Description: readOptionalNullableString(body, "Description")
    });
}

export async function readEventActivityCreatePayload(request: JsonRequest): Promise<EventActivityInput> {
    const body = await readActivityBody(request);
    const lookupIds = readActivityLookupIds(body);

    return {
        ...readParent(body),
        Subject: readRequiredString(body, "Subject"),
        StartDateTime: readRequiredString(body, "StartDateTime"),
        EndDateTime: readRequiredString(body, "EndDateTime"),
        ...lookupIds,
        Location: readOptionalString(body, "Location"),
        Description: readOptionalString(body, "Description")
    };
}

export async function readEventActivityUpdatePayload(request: JsonRequest): Promise<EventActivityUpdateInput> {
    const body = await readActivityBody(request);
    const lookupIds = readActivityLookupUpdateIds(body);

    return compactUpdatePayload({
        Subject: readOptionalString(body, "Subject"),
        StartDateTime: readOptionalString(body, "StartDateTime"),
        EndDateTime: readOptionalString(body, "EndDateTime"),
        ...lookupIds,
        Location: readOptionalNullableString(body, "Location"),
        Description: readOptionalNullableString(body, "Description")
    });
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
