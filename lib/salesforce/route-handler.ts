import type { NextResponse } from "next/server";
import {
    SalesforceApiError,
    jsonWithSession,
    salesforceErrorResponse
} from "./client";
import { assertIntegrationApiKey } from "./integration-security";
import {
    assertSalesforceRecordId,
    assertSameOriginRequest
} from "./request-security";
import type { SalesforceObjectLabel } from "./request-security";
import type { SalesforceSession } from "./session";
import { getSession } from "./session";

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
type BulkDeleteInput = {
    ids: string[];
};
type BulkDeleteRecord<TData> = (ids: string[]) => Promise<SalesforceRouteResult<TData>>;
type SalesforceIntegrationRouteResult<T> = {
    data: T;
};
type CreateIntegrationRecord<TInput, TData> = (input: TInput) => Promise<SalesforceIntegrationRouteResult<TData>>;
type UpdateIntegrationRecord<TInput, TData> = (
    id: string,
    input: TInput
) => Promise<SalesforceIntegrationRouteResult<TData>>;

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

export function handleSalesforceBulkDeleteRoute<TData>(
    request: MutatingRequest,
    objectLabel: SalesforceObjectLabel,
    readPayload: ReadPayload<BulkDeleteInput>,
    deleteRecords: BulkDeleteRecord<TData>
): Promise<NextResponse> {
    return handleSalesforceRoute(async () => {
        assertSameOriginRequest(request);
        const input = await readPayload(request);
        input.ids.forEach((id) => assertSalesforceRecordId(id, objectLabel));
        return deleteRecords(input.ids);
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

export function handleSalesforceIntegrationCreateRoute<TInput, TData>(
    request: MutatingRequest,
    readPayload: ReadPayload<TInput>,
    createRecord: CreateIntegrationRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceIntegrationRoute(async () => {
        assertIntegrationApiKey(request);
        const input = await readPayload(request);
        const { data } = await createRecord(input);
        return data;
    }, 201);
}

export function handleSalesforceIntegrationUpdateRoute<TInput, TData>(
    request: MutatingRequest,
    { params }: SalesforceRouteParams,
    objectLabel: SalesforceObjectLabel,
    readPayload: ReadPayload<TInput>,
    updateRecord: UpdateIntegrationRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceIntegrationRoute(async () => {
        const { id } = await params;
        assertIntegrationApiKey(request);
        assertSalesforceRecordId(id, objectLabel);
        const input = await readPayload(request);
        const { data } = await updateRecord(id, input);
        return data;
    });
}

export function handleSalesforceIntegrationUiCreateRoute<TInput, TData>(
    request: MutatingRequest,
    readPayload: ReadPayload<TInput>,
    createRecord: CreateIntegrationRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceIntegrationRoute(async () => {
        assertSameOriginRequest(request);
        const session = await getSession();
        if (!session) {
            throw new SalesforceApiError("Salesforce session is required.", 401);
        }

        const input = await readPayload(request);
        const { data } = await createRecord(input);
        return data;
    }, 201);
}
