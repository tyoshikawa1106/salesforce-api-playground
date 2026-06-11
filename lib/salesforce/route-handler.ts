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
import type { JsonRequest } from "./json-payload";

export type SalesforceRouteResult<T> = {
    data: T;
    session: SalesforceSession;
};

export type SalesforceRouteParams = {
    params: Promise<{
        id: string;
    }>;
};

type MutatingRequest = Pick<Request, "headers" | "json" | "url">;

type ReadPayload<TInput> = (request: JsonRequest) => Promise<TInput>;
type CreateRecord<TInput, TData> = (input: TInput) => Promise<SalesforceRouteResult<TData>>;
type UpdateRecord<TInput, TData> = (id: string, input: TInput) => Promise<SalesforceRouteResult<TData>>;
type DeleteRecord<TData> = (id: string) => Promise<SalesforceRouteResult<TData>>;
type GetRecord<TData> = (id: string) => Promise<SalesforceRouteResult<TData>>;
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
type IntegrationRouteAuth = (request: Pick<Request, "headers" | "url">) => Promise<void> | void;

type SalesforceCollectionRouteConfig<TCreateInput, TListData, TCreateData, TBulkDeleteData> = {
    objectLabel: SalesforceObjectLabel;
    readCreatePayload: ReadPayload<TCreateInput>;
    readBulkDeletePayload: ReadPayload<BulkDeleteInput>;
    listRecords: () => Promise<SalesforceRouteResult<TListData>>;
    createRecord: CreateRecord<TCreateInput, TCreateData>;
    deleteRecords: BulkDeleteRecord<TBulkDeleteData>;
};

type SalesforceRecordRouteConfig<TUpdateInput, TUpdateData, TDeleteData> = {
    objectLabel: SalesforceObjectLabel;
    readUpdatePayload: ReadPayload<TUpdateInput>;
    updateRecord: UpdateRecord<TUpdateInput, TUpdateData>;
    deleteRecord: DeleteRecord<TDeleteData>;
};

type SalesforceReadableRecordRouteConfig<TUpdateInput, TReadData, TUpdateData, TDeleteData> =
    SalesforceRecordRouteConfig<TUpdateInput, TUpdateData, TDeleteData> & {
        getRecord: GetRecord<TReadData>;
    };

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
    request: Pick<Request, "headers" | "url">,
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

export function handleSalesforceGetRecordRoute<TData>(
    { params }: SalesforceRouteParams,
    objectLabel: SalesforceObjectLabel,
    getRecord: GetRecord<TData>
): Promise<NextResponse> {
    return handleSalesforceRoute(async () => {
        const { id } = await params;
        assertSalesforceRecordId(id, objectLabel);
        return getRecord(id);
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

export function handleSalesforceActionRoute<TInput, TData>(
    request: MutatingRequest,
    readPayload: ReadPayload<TInput>,
    runAction: (input: TInput) => Promise<SalesforceRouteResult<TData>>
): Promise<NextResponse> {
    return handleSalesforceRoute(async () => {
        assertSameOriginRequest(request);
        const input = await readPayload(request);
        return runAction(input);
    });
}

export function createSalesforceCollectionRouteHandlers<TCreateInput, TListData, TCreateData, TBulkDeleteData>({
    createRecord,
    deleteRecords,
    listRecords,
    objectLabel,
    readBulkDeletePayload,
    readCreatePayload
}: SalesforceCollectionRouteConfig<TCreateInput, TListData, TCreateData, TBulkDeleteData>) {
    return {
        GET() {
            return handleSalesforceRoute(() => listRecords());
        },
        POST(request: Request) {
            return handleSalesforceCreateRoute(request, readCreatePayload, createRecord);
        },
        DELETE(request: Request) {
            return handleSalesforceBulkDeleteRoute(request, objectLabel, readBulkDeletePayload, deleteRecords);
        }
    };
}

export function createSalesforceRecordRouteHandlers<TUpdateInput, TUpdateData, TDeleteData>({
    deleteRecord,
    objectLabel,
    readUpdatePayload,
    updateRecord
}: SalesforceRecordRouteConfig<TUpdateInput, TUpdateData, TDeleteData>) {
    return {
        PATCH(request: Request, params: SalesforceRouteParams) {
            return handleSalesforceUpdateRoute(request, params, objectLabel, readUpdatePayload, updateRecord);
        },
        DELETE(request: Request, params: SalesforceRouteParams) {
            return handleSalesforceDeleteRoute(request, params, objectLabel, deleteRecord);
        }
    };
}

export function createSalesforceReadableRecordRouteHandlers<TUpdateInput, TReadData, TUpdateData, TDeleteData>({
    deleteRecord,
    getRecord,
    objectLabel,
    readUpdatePayload,
    updateRecord
}: SalesforceReadableRecordRouteConfig<TUpdateInput, TReadData, TUpdateData, TDeleteData>) {
    return {
        GET(_request: Request, params: SalesforceRouteParams) {
            return handleSalesforceGetRecordRoute(params, objectLabel, getRecord);
        },
        PATCH(request: Request, params: SalesforceRouteParams) {
            return handleSalesforceUpdateRoute(request, params, objectLabel, readUpdatePayload, updateRecord);
        },
        DELETE(request: Request, params: SalesforceRouteParams) {
            return handleSalesforceDeleteRoute(request, params, objectLabel, deleteRecord);
        }
    };
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

function assertIntegrationApiKeyRequest(request: Pick<Request, "headers">) {
    assertIntegrationApiKey(request);
}

async function assertIntegrationUiSessionRequest(request: Pick<Request, "headers" | "url">) {
    assertSameOriginRequest(request);
    const session = await getSession();
    if (!session) {
        throw new SalesforceApiError("Salesforce session is required.", 401);
    }
}

function handleSalesforceIntegrationCreateRouteWithAuth<TInput, TData>(
    request: MutatingRequest,
    authenticate: IntegrationRouteAuth,
    readPayload: ReadPayload<TInput>,
    createRecord: CreateIntegrationRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceIntegrationRoute(async () => {
        await authenticate(request);
        const input = await readPayload(request);
        const { data } = await createRecord(input);
        return data;
    }, 201);
}

export function handleSalesforceIntegrationCreateRoute<TInput, TData>(
    request: MutatingRequest,
    readPayload: ReadPayload<TInput>,
    createRecord: CreateIntegrationRecord<TInput, TData>
): Promise<NextResponse> {
    return handleSalesforceIntegrationCreateRouteWithAuth(
        request,
        assertIntegrationApiKeyRequest,
        readPayload,
        createRecord
    );
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
        assertIntegrationApiKeyRequest(request);
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
    return handleSalesforceIntegrationCreateRouteWithAuth(
        request,
        assertIntegrationUiSessionRequest,
        readPayload,
        createRecord
    );
}
