import type { SalesforceSession } from "./session";

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

type RevokeEndpointConfig = {
  instanceUrl: string;
};

function buildSalesforceTokenEndpointUrl(config: TokenEndpointConfig): string {
  return `${config.loginUrl}/services/oauth2/token`;
}

export function buildAuthorizationEndpointUrl(
  config: AuthorizationEndpointConfig
): string {
  return `${config.loginUrl}/services/oauth2/authorize`;
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

export function buildRevokeEndpointUrl(config: RevokeEndpointConfig): string {
  return `${config.instanceUrl}/services/oauth2/revoke`;
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

export function buildAuthenticatedSalesforceRequestInit(
  session: Pick<SalesforceSession, "accessToken">,
  init: RequestInit = {}
): RequestInit {
  return {
    ...init,
    headers: {
      authorization: `Bearer ${session.accessToken}`,
      "content-type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  };
}

export function buildSalesforceApiUrl(
  session: Pick<SalesforceSession, "instanceUrl">,
  apiVersion: string,
  path: string
): string {
  return `${session.instanceUrl}/services/data/${apiVersion}${path}`;
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

export async function readSalesforceResponseData<T>(response: Response): Promise<T> {
  return response.status === 204 ? ({} as T) : ((await response.json()) as T);
}

export function tokenResponseToSession(
  token: TokenResponse,
  issuedAtFallback = Date.now()
): SalesforceSession {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    instanceUrl: token.instance_url,
    issuedAt: token.issued_at ? Number(token.issued_at) : issuedAtFallback,
    userId: token.id?.split("/").at(-1)
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
