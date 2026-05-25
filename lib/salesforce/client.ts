import { NextResponse } from "next/server";
import {
    buildAuthorizationCodeTokenEndpointUrl,
    buildAuthorizationCodeTokenParams,
    buildRefreshTokenRequest,
    buildRevokeEndpointUrl,
    buildRevokeParams,
    buildRevokeRequestInit,
    buildSalesforceApiRequest,
    buildTokenRequestInit,
    extractSalesforceErrorMessage,
    readSalesforceErrorDetails,
    readSalesforceResponseData,
    selectRevokeToken,
    tokenResponseToRefreshedSession,
    tokenResponseToSession
} from "./client-core";
import type { TokenResponse } from "./client-core";
import { getSalesforceConfig } from "./config";
import {
    SalesforceSession,
    clearSessionCookie,
    clearStateCookie,
    getSession,
    setSessionCookie
} from "./session";

export type { SalesforceErrorPayload, TokenResponse } from "./client-core";
export type {
    AccountInput,
    AccountRecord,
    AccountUpdateInput,
    ContactInput,
    ContactRecord,
    ContactUpdateInput,
    SalesforceQueryResponse
} from "./records";

export class SalesforceApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public details?: unknown
    ) {
        super(message);
    }
}

export async function salesforceApiErrorFromResponse(response: Response): Promise<SalesforceApiError> {
    const details = await readSalesforceErrorDetails(response);
    const message = extractSalesforceErrorMessage(details, response.statusText);

    return new SalesforceApiError(message || "Salesforce API request failed.", response.status, details);
}

async function fetchWithSession(
    session: SalesforceSession,
    path: string,
    init: RequestInit
): Promise<Response> {
    const { apiVersion } = getSalesforceConfig();
    const request = buildSalesforceApiRequest(session, apiVersion, path, init);

    return fetch(request.url, request.init);
}

async function refreshAndRetrySalesforceFetch(
    session: SalesforceSession,
    path: string,
    init: RequestInit
): Promise<{ response: Response; session: SalesforceSession }> {
    const refreshedSession = await refreshAccessToken(session);
    const response = await fetchWithSession(refreshedSession, path, init);

    return { response, session: refreshedSession };
}

async function fetchSalesforceWithRefresh(
    session: SalesforceSession,
    path: string,
    init: RequestInit
): Promise<{ response: Response; session: SalesforceSession }> {
    const response = await fetchWithSession(session, path, init);

    if (response.status !== 401) {
        return { response, session };
    }

    return refreshAndRetrySalesforceFetch(session, path, init);
}

export async function exchangeCodeForToken(code: string): Promise<SalesforceSession> {
    const config = getSalesforceConfig();
    const params = buildAuthorizationCodeTokenParams(config, code);
    const response = await fetch(
        buildAuthorizationCodeTokenEndpointUrl(config),
        buildTokenRequestInit(params)
    );

    if (!response.ok) {
        throw await salesforceApiErrorFromResponse(response);
    }

    const token = (await response.json()) as TokenResponse;
    return tokenResponseToSession(token);
}

export async function revokeSalesforceSession(session: SalesforceSession): Promise<void> {
    const params = buildRevokeParams(selectRevokeToken(session));
    const response = await fetch(
        buildRevokeEndpointUrl(session),
        buildRevokeRequestInit(params)
    );

    if (!response.ok) {
        throw await salesforceApiErrorFromResponse(response);
    }
}

export async function refreshAccessToken(session: SalesforceSession): Promise<SalesforceSession> {
    if (!session.refreshToken) {
        throw new SalesforceApiError("Salesforce session expired. Please connect again.", 401);
    }

    const config = getSalesforceConfig();
    const request = buildRefreshTokenRequest(config, session.refreshToken);
    const response = await fetch(request.url, request.init);

    if (!response.ok) {
        throw await salesforceApiErrorFromResponse(response);
    }

    const token = (await response.json()) as TokenResponse;
    return tokenResponseToRefreshedSession(session, token);
}

export async function salesforceFetch<T>(
    path: string,
    init: RequestInit = {}
): Promise<{ data: T; session: SalesforceSession }> {
    const session = await getSession();
    if (!session) {
        throw new SalesforceApiError("Not connected to Salesforce.", 401);
    }

    const result = await fetchSalesforceWithRefresh(session, path, init);

    if (!result.response.ok) {
        throw await salesforceApiErrorFromResponse(result.response);
    }

    const data = await readSalesforceResponseData<T>(result.response);
    return { data, session: result.session };
}

export function jsonWithSession<T>(data: T, session: SalesforceSession, status = 200): NextResponse {
    const response = NextResponse.json(data, { status });
    setSessionCookie(response, session);
    return response;
}

function isExpiredSessionError(error: SalesforceApiError): boolean {
    const detailsText = error.details ? JSON.stringify(error.details) : "";
    return (
        error.status === 401 ||
        /invalid_grant|expired access\/refresh token|session expired/i.test(error.message) ||
        /invalid_grant|expired access\/refresh token|expired refresh token/i.test(detailsText)
    );
}

export function salesforceErrorResponse(error: unknown): NextResponse {
    if (error instanceof SalesforceApiError) {
        if (isExpiredSessionError(error)) {
            const response = NextResponse.json(
                {
                    error: "Salesforce session expired. Please connect again.",
                    details: error.details
                },
                { status: 401 }
            );
            clearSessionCookie(response);
            clearStateCookie(response);
            return response;
        }

        return NextResponse.json(
            {
                error: error.message,
                details: error.details
            },
            { status: error.status }
        );
    }

    return NextResponse.json(
        {
            error: error instanceof Error ? error.message : "Unexpected server error."
        },
        { status: 500 }
    );
}

export function soql(strings: TemplateStringsArray, ...values: string[]): string {
    return strings.reduce((query, part, index) => `${query}${part}${values[index] ?? ""}`, "");
}
