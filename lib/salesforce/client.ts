import { NextResponse } from "next/server";
import { getSalesforceConfig } from "./config";
import {
  SalesforceSession,
  getSession,
  setSessionCookie
} from "./session";

export type SalesforceErrorPayload = {
  message?: string;
  errorCode?: string;
  fields?: string[];
};

export type SalesforceQueryResponse<T> = {
  totalSize: number;
  done: boolean;
  records: T[];
};

export type AccountRecord = {
  Id: string;
  Name: string;
  Phone?: string;
  Website?: string;
  Industry?: string;
  Type?: string;
  BillingCity?: string;
  BillingCountry?: string;
  LastModifiedDate?: string;
};

export type ContactRecord = {
  Id: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Title?: string;
  AccountId?: string;
  Account?: {
    Name?: string;
  };
  LastModifiedDate?: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  instance_url: string;
  id?: string;
  issued_at?: string;
};

export class SalesforceApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
  }
}

function buildApiUrl(session: SalesforceSession, path: string): string {
  const { apiVersion } = getSalesforceConfig();
  return `${session.instanceUrl}/services/data/${apiVersion}${path}`;
}

async function parseSalesforceError(response: Response): Promise<SalesforceApiError> {
  let details: unknown;
  try {
    details = await response.json();
  } catch {
    details = await response.text();
  }

  const message = Array.isArray(details)
    ? details.map((item: SalesforceErrorPayload) => item.message).filter(Boolean).join(" ")
    : response.statusText;

  return new SalesforceApiError(message || "Salesforce API request failed.", response.status, details);
}

export async function exchangeCodeForToken(code: string): Promise<SalesforceSession> {
  const config = getSalesforceConfig();
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri
  });

  const response = await fetch(`${config.loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw await parseSalesforceError(response);
  }

  const token = (await response.json()) as TokenResponse;
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    instanceUrl: token.instance_url,
    issuedAt: token.issued_at ? Number(token.issued_at) : Date.now(),
    userId: token.id?.split("/").at(-1)
  };
}

async function refreshAccessToken(session: SalesforceSession): Promise<SalesforceSession> {
  if (!session.refreshToken) {
    throw new SalesforceApiError("Salesforce session expired. Please connect again.", 401);
  }

  const config = getSalesforceConfig();
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret
  });

  const response = await fetch(`${config.loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw await parseSalesforceError(response);
  }

  const token = (await response.json()) as TokenResponse;
  return {
    ...session,
    accessToken: token.access_token,
    instanceUrl: token.instance_url ?? session.instanceUrl,
    issuedAt: token.issued_at ? Number(token.issued_at) : Date.now()
  };
}

export async function salesforceFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ data: T; session: SalesforceSession }> {
  let session = getSession();
  if (!session) {
    throw new SalesforceApiError("Not connected to Salesforce.", 401);
  }

  let response = await fetch(buildApiUrl(session, path), {
    ...init,
    headers: {
      authorization: `Bearer ${session.accessToken}`,
      "content-type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (response.status === 401) {
    session = await refreshAccessToken(session);
    response = await fetch(buildApiUrl(session, path), {
      ...init,
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        "content-type": "application/json",
        ...(init.headers ?? {})
      },
      cache: "no-store"
    });
  }

  if (!response.ok) {
    throw await parseSalesforceError(response);
  }

  const data = response.status === 204 ? ({} as T) : ((await response.json()) as T);
  return { data, session };
}

export function jsonWithSession<T>(data: T, session: SalesforceSession, status = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  setSessionCookie(response, session);
  return response;
}

export function salesforceErrorResponse(error: unknown): NextResponse {
  if (error instanceof SalesforceApiError) {
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
