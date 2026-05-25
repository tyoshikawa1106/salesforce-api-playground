import type { NextResponse } from "next/server";
import {
    jsonWithSession,
    salesforceErrorResponse
} from "./client";
import type { SalesforceSession } from "./session";

type SalesforceRouteResult<T> = {
    data: T;
    session: SalesforceSession;
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
