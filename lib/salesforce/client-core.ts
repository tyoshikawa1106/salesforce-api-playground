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
