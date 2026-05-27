import { Connection } from "jsforce";
import type { SaveResult } from "jsforce";
import { toJsforceApiVersion } from "@/lib/salesforce/api-version";
import {
    getSalesforceConfig,
    getSalesforceIntegrationConfig
} from "@/lib/salesforce/config";
import {
    SalesforceApiError,
    exchangeClientCredentialsForToken,
    refreshAccessToken
} from "@/lib/salesforce/client";
import type { SalesforceSession } from "@/lib/salesforce/session";
import { getSession } from "@/lib/salesforce/session";

export type SalesforceServiceResult<T> = {
    data: T;
    session: SalesforceSession;
};

export type SalesforceIntegrationServiceResult<T> = {
    data: T;
};

async function requireSalesforceSession(): Promise<SalesforceSession> {
    const session = await getSession();
    if (!session) {
        throw new SalesforceApiError("Not connected to Salesforce.", 401);
    }

    return session;
}

function createConnection(session: SalesforceSession): Connection {
    const {
        apiVersion,
        clientId,
        clientSecret,
        loginUrl,
        redirectUri
    } = getSalesforceConfig();

    return new Connection({
        accessToken: session.accessToken,
        instanceUrl: session.instanceUrl,
        loginUrl,
        oauth2: {
            clientId,
            clientSecret,
            loginUrl,
            redirectUri
        },
        refreshToken: session.refreshToken,
        version: toJsforceApiVersion(apiVersion)
    });
}

async function createIntegrationConnection(): Promise<Connection> {
    const config = getSalesforceIntegrationConfig();
    const session = await exchangeClientCredentialsForToken();

    return new Connection({
        accessToken: session.accessToken,
        instanceUrl: session.instanceUrl,
        loginUrl: config.loginUrl,
        oauth2: {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            loginUrl: config.loginUrl
        },
        version: toJsforceApiVersion(config.apiVersion)
    });
}

function isUnauthorizedSalesforceError(error: unknown): boolean {
    if (error instanceof SalesforceApiError) {
        return error.status === 401;
    }

    if (typeof error !== "object" || error === null) {
        return false;
    }

    const candidate = error as { errorCode?: unknown; statusCode?: unknown };
    return candidate.statusCode === 401 || candidate.errorCode === "INVALID_SESSION_ID";
}

function salesforceErrorFromUnknown(error: unknown): SalesforceApiError {
    if (error instanceof SalesforceApiError) {
        return error;
    }

    if (typeof error === "object" && error !== null) {
        const candidate = error as {
            message?: unknown;
            statusCode?: unknown;
            errorCode?: unknown;
        };
        const status = typeof candidate.statusCode === "number" ? candidate.statusCode : 500;
        const message = typeof candidate.message === "string" ? candidate.message : "Salesforce API request failed.";

        return new SalesforceApiError(message, status, error);
    }

    return new SalesforceApiError(
        error instanceof Error ? error.message : "Salesforce API request failed.",
        500,
        error
    );
}

async function withSalesforceConnection<T>(
    operation: (connection: Connection) => Promise<T>
): Promise<SalesforceServiceResult<T>> {
    const session = await requireSalesforceSession();

    try {
        const data = await operation(createConnection(session));
        return { data, session };
    } catch (error) {
        if (!isUnauthorizedSalesforceError(error)) {
            throw salesforceErrorFromUnknown(error);
        }

        const refreshedSession = await refreshAccessToken(session);
        try {
            const data = await operation(createConnection(refreshedSession));
            return { data, session: refreshedSession };
        } catch (retryError) {
            throw salesforceErrorFromUnknown(retryError);
        }
    }
}

export async function withStandardObjectConnection<T>(
    operation: (connection: Connection) => Promise<T>
): Promise<SalesforceServiceResult<T>> {
    return withSalesforceConnection(operation);
}

export async function withIntegrationConnection<T>(
    operation: (connection: Connection) => Promise<T>
): Promise<SalesforceIntegrationServiceResult<T>> {
    try {
        const data = await operation(await createIntegrationConnection());
        return { data };
    } catch (error) {
        throw salesforceErrorFromUnknown(error);
    }
}

export async function salesforceRequest<T>(
    request: Parameters<Connection["request"]>[0],
    options?: Parameters<Connection["request"]>[1]
): Promise<SalesforceServiceResult<T>> {
    return withSalesforceConnection((connection) => connection.request<T>(request, options));
}

export function emptySalesforceResult(result: SaveResult): Record<string, never> {
    if (!result.success) {
        throw new SalesforceApiError("Salesforce API request failed.", 400, result.errors);
    }

    return {};
}

export function createdSalesforceResult(result: SaveResult): { id: string; success: true } {
    if (!result.success || !result.id) {
        throw new SalesforceApiError("Salesforce API request failed.", 400, result.errors);
    }

    return {
        id: result.id,
        success: true
    };
}
