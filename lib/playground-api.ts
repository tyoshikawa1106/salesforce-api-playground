export type SessionInfo = {
  connected: boolean;
  instanceUrl?: string;
  issuedAt?: number;
};

export type PlaygroundApiResource = "accounts" | "contacts";

export type PlaygroundApiMethod = "POST" | "PATCH" | "DELETE";

export type PlaygroundApiRequest = {
  url: string;
  init: RequestInit;
};

type PlaygroundApiRequestOptions = {
  method?: PlaygroundApiMethod;
  body?: unknown;
};

export const playgroundApiPaths = {
  session: "/api/session",
  accounts: "/api/accounts",
  contacts: "/api/contacts",
  record(resource: PlaygroundApiResource, id: string): string {
    return `/api/${resource}/${id}`;
  }
} as const;

export function buildPlaygroundApiRequest(
  url: string,
  options: PlaygroundApiRequestOptions = {}
): PlaygroundApiRequest {
  return {
    url,
    init: {
      headers: {
        "content-type": "application/json"
      },
      ...(options.method ? { method: options.method } : {}),
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) })
    }
  };
}

export function compactPayload<T extends Record<string, string>>(
  form: T,
  options: { emptyAsNull?: boolean } = {}
): Partial<Record<keyof T, string | null>> {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      const trimmed = value.trim();
      return [key, trimmed || (options.emptyAsNull ? null : undefined)];
    })
  ) as Partial<Record<keyof T, string | null>>;
}
