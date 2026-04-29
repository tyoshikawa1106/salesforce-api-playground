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
