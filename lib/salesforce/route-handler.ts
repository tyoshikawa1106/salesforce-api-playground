import type { NextResponse } from "next/server";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "./client";
import {
    assertSalesforceRecordId,
    assertSameOriginRequest
} from "./request-security";
import type { SalesforceObjectLabel } from "./request-security";
import type { SalesforceSession } from "./session";

type SalesforceRouteResult<T> = {
    data: T;
    session: SalesforceSession;
};

export type SalesforceRouteParams = {
    params: Promise<{
        id: string;
    }>;
};

type JsonRequest = Pick<Request, "json">;
type MutatingRequest = Pick<Request, "headers" | "json">;

type ReadPayload<TInput> = (request: JsonRequest) => Promise<TInput>;
type CreateRecord<TInput, TData> = (input: TInput) => Promise<SalesforceRouteResult<TData>>;
type UpdateRecord<TInput, TData> = (id: string, input: TInput) => Promise<SalesforceRouteResult<TData>>;
type DeleteRecord<TData> = (id: string) => Promise<SalesforceRouteResult<TData>>;

export async function handleSalesforceRoute<T>(
    handler: () => Promise<SalesforceRouteResult<T>>,
    status?: number
): Promise<NextResponse> {
    try {
        const { data, session } = await handler();
        return status === undefined
            ? jsonWithSession(data, session)
            : jsonWithSession(data, session, status);
    } catch (error) {
        return salesforceErrorResponse(error);
    }
}

export function handleSalesforceCreateRoute<TInput, TData>(
    request: MutatingRequest,
    readPayload: ReadPayload<TInput>,
    createRecord: CreateRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceRoute(async () => {
        assertSameOriginRequest(request);
        const input = await readPayload(request);
        return createRecord(input);
    }, 201);
}

export function handleSalesforceUpdateRoute<TInput, TData>(
    request: MutatingRequest,
    { params }: SalesforceRouteParams,
    objectLabel: SalesforceObjectLabel,
    readPayload: ReadPayload<TInput>,
    updateRecord: UpdateRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSameOriginRequest(request);
        assertSalesforceRecordId(id, objectLabel);
        const input = await readPayload(request);
        return updateRecord(id, input);
    });
}

export function handleSalesforceDeleteRoute<TData>(
    request: Pick<Request, "headers">,
    { params }: SalesforceRouteParams,
    objectLabel: SalesforceObjectLabel,
    deleteRecord: DeleteRecord<TData>
): Promise<NextResponse> {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSameOriginRequest(request);
        assertSalesforceRecordId(id, objectLabel);
        return deleteRecord(id);
    });
}

export async function handleSalesforceIntegrationRoute<T>(
    handler: () => Promise<T>,
    status = 200
): Promise<NextResponse> {
    try {
        return Response.json(await handler(), { status }) as NextResponse;
    } catch (error) {
        return salesforceErrorResponse(error, { normalizeExpiredSession: false });
    }
}
