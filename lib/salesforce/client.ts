import { NextResponse } from "next/server";
import {
    buildAuthorizationCodeTokenEndpointUrl,
    buildAuthorizationCodeTokenParams,
    buildClientCredentialsTokenEndpointUrl,
    buildClientCredentialsTokenParams,
    buildRefreshTokenRequest,
    buildRevokeEndpointUrl,
    buildRevokeParams,
    buildRevokeRequestInit,
    buildTokenRequestInit,
    extractSalesforceErrorMessage,
    readSalesforceErrorDetails,
    selectRevokeToken,
    tokenResponseToRefreshedSession,
    tokenResponseToSession
} from "./client-core";
import type { TokenResponse } from "./client-core";
import { getSalesforceConfig, getSalesforceIntegrationConfig } from "./config";
import {
    SalesforceSession,
    clearSessionCookie,
    clearStateCookie,
    setSessionCookie
} from "./session";

export type { SalesforceErrorPayload, TokenResponse } from "./client-core";

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

export async function exchangeClientCredentialsForToken(): Promise<SalesforceSession> {
    const config = getSalesforceIntegrationConfig();
    const params = buildClientCredentialsTokenParams(config);
    const response = await fetch(
        buildClientCredentialsTokenEndpointUrl(config),
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

export function jsonWithSession<T>(data: T, session: SalesforceSession, status = 200): NextResponse {
    const response = NextResponse.json(data, { status });
    setSessionCookie(response, session);
    return response;
}

type SalesforceErrorResponseOptions = {
    normalizeExpiredSession?: boolean;
};

function isExpiredSessionError(error: SalesforceApiError): boolean {
    const detailsText = error.details ? JSON.stringify(error.details) : "";
    return (
        error.status === 401 ||
        /invalid_grant|expired access\/refresh token|session expired/i.test(error.message) ||
        /invalid_grant|expired access\/refresh token|expired refresh token/i.test(detailsText)
    );
}

export function salesforceErrorResponse(
    error: unknown,
    options: SalesforceErrorResponseOptions = {}
): NextResponse {
    const { normalizeExpiredSession = true } = options;

    if (error instanceof SalesforceApiError) {
        if (normalizeExpiredSession && isExpiredSessionError(error)) {
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
