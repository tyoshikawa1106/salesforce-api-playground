import type { SalesforceSession } from "./session";
import { normalizeHttpsOriginUrl } from "./url-security";

export type SalesforceErrorPayload = {
    message?: string;
    errorCode?: string;
    fields?: string[];
};

export type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    instance_url: string;
    id?: string;
    issued_at?: string;
};

type TokenEndpointConfig = {
    loginUrl: string;
};

type AuthorizationEndpointConfig = {
    loginUrl: string;
};

type AuthorizationUrlParamsConfig = {
    clientId: string;
    redirectUri: string;
};

type AuthorizationCodeTokenParamsConfig = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
};

type RefreshTokenParamsConfig = {
    clientId: string;
    clientSecret: string;
};

type ClientCredentialsTokenParamsConfig = {
    clientId: string;
    clientSecret: string;
};

type RevokeEndpointConfig = {
    instanceUrl: string;
};

export type SalesforceRequest = {
    url: string;
    init: RequestInit;
};

function buildSalesforceTokenEndpointUrl(config: TokenEndpointConfig): string {
    return new URL(
        "/services/oauth2/token",
        normalizeHttpsOriginUrl(config.loginUrl, "Salesforce login URL")
    ).toString();
}

export function buildAuthorizationEndpointUrl(
    config: AuthorizationEndpointConfig
): string {
    return new URL(
        "/services/oauth2/authorize",
        normalizeHttpsOriginUrl(config.loginUrl, "Salesforce login URL")
    ).toString();
}

export function buildAuthorizationUrlParams(
    config: AuthorizationUrlParamsConfig,
    state: string
): URLSearchParams {
    return new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: "api refresh_token",
        state
    });
}

export function buildAuthorizationUrl(
    config: AuthorizationEndpointConfig & AuthorizationUrlParamsConfig,
    state: string
): string {
    const authorizeUrl = new URL(buildAuthorizationEndpointUrl(config));
    authorizeUrl.search = buildAuthorizationUrlParams(config, state).toString();

    return authorizeUrl.toString();
}

export function buildAuthorizationCodeTokenEndpointUrl(
    config: TokenEndpointConfig
): string {
    return buildSalesforceTokenEndpointUrl(config);
}

export function buildAuthorizationCodeTokenParams(
    config: AuthorizationCodeTokenParamsConfig,
    code: string
): URLSearchParams {
    return new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri
    });
}

export function buildRefreshTokenEndpointUrl(config: TokenEndpointConfig): string {
    return buildSalesforceTokenEndpointUrl(config);
}

export function buildRefreshTokenParams(
    config: RefreshTokenParamsConfig,
    refreshToken: string
): URLSearchParams {
    return new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
    });
}

export function buildRefreshTokenRequest(
    config: TokenEndpointConfig & RefreshTokenParamsConfig,
    refreshToken: string
): SalesforceRequest {
    const params = buildRefreshTokenParams(config, refreshToken);

    return {
        url: buildRefreshTokenEndpointUrl(config),
        init: buildTokenRequestInit(params)
    };
}

export function buildClientCredentialsTokenEndpointUrl(
    config: TokenEndpointConfig
): string {
    return buildSalesforceTokenEndpointUrl(config);
}

export function buildClientCredentialsTokenParams(
    config: ClientCredentialsTokenParamsConfig
): URLSearchParams {
    return new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret
    });
}

export function buildRevokeEndpointUrl(config: RevokeEndpointConfig): string {
    return new URL(
        "/services/oauth2/revoke",
        normalizeHttpsOriginUrl(config.instanceUrl, "Salesforce instance URL")
    ).toString();
}

export function selectRevokeToken(
    session: Pick<SalesforceSession, "accessToken" | "refreshToken">
): string {
    return session.refreshToken ?? session.accessToken;
}

export function buildRevokeParams(token: string): URLSearchParams {
    return new URLSearchParams({ token });
}

export function buildRevokeRequestInit(params: URLSearchParams): RequestInit {
    return {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: params.toString(),
        cache: "no-store"
    };
}

export function buildTokenRequestInit(params: URLSearchParams): RequestInit {
    return {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: params.toString(),
        cache: "no-store"
    };
}

export function extractSalesforceErrorMessage(
    details: unknown,
    statusText: string
): string {
    if (!Array.isArray(details)) {
        return statusText;
    }

    return details
        .map((item: SalesforceErrorPayload) => item.message)
        .filter(Boolean)
        .join(" ");
}

export async function readSalesforceErrorDetails(response: Response): Promise<unknown> {
    try {
        return await response.clone().json();
    } catch {
        return await response.text();
    }
}

export function tokenResponseToSession(
    token: TokenResponse,
    issuedAtFallback = Date.now()
): SalesforceSession {
    const [, organizationId, userId] = token.id?.match(/\/id\/([^/]+)\/([^/]+)$/) ?? [];

    return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        instanceUrl: normalizeHttpsOriginUrl(token.instance_url, "Salesforce instance URL"),
        issuedAt: token.issued_at ? Number(token.issued_at) : issuedAtFallback,
        userId,
        organizationId
    };
}

export function tokenResponseToRefreshedSession(
    session: SalesforceSession,
    token: TokenResponse,
    issuedAtFallback = Date.now()
): SalesforceSession {
    return {
        ...session,
        accessToken: token.access_token,
        instanceUrl: token.instance_url ?? session.instanceUrl,
        issuedAt: token.issued_at ? Number(token.issued_at) : issuedAtFallback
    };
}
