import type {
    AccountForm,
    AccountInput,
    AccountUpdateInput,
    ContactForm,
    ContactInput,
    ContactUpdateInput
} from "./salesforce/records";

export type SessionInfo = {
    connected: boolean;
    instanceUrl?: string;
    issuedAt?: number;
    userId?: string;
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

export type CreatePayload<T extends Record<string, string>> = Partial<{
    [K in keyof T]: string | undefined;
}>;

export type UpdatePayload<T extends Record<string, string>> = Partial<{
    [K in keyof T]: string | null;
}>;

export const playgroundApiPaths = {
    session: "/api/session",
    accounts: "/api/accounts",
    contacts: "/api/contacts",
    integrationAccounts: "/api/integration/ui/accounts",
    recycleBin: "/api/recycle-bin",
    recycleBinUndelete: "/api/recycle-bin/undelete",
    search(query: string): string {
        return `/api/search?q=${encodeURIComponent(query)}`;
    },
    record(resource: PlaygroundApiResource, id: string): string {
        return `/api/${resource}/${encodeURIComponent(id)}`;
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
    form: T
): CreatePayload<T>;
export function compactPayload<T extends Record<string, string>>(
    form: T,
    options: { emptyAsNull: true }
): UpdatePayload<T>;
export function compactPayload<T extends Record<string, string>>(
    form: T,
    options: { emptyAsNull?: boolean } = {}
): CreatePayload<T> | UpdatePayload<T> {
    return Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
            const trimmed = value.trim();
            return [key, trimmed || (options.emptyAsNull ? null : undefined)];
        })
    ) as CreatePayload<T> | UpdatePayload<T>;
}

export function buildAccountCreatePayload(form: AccountForm): AccountInput {
    return compactPayload(form) as AccountInput;
}

export function buildAccountUpdatePayload(form: AccountForm): AccountUpdateInput {
    return compactPayload(form, { emptyAsNull: true });
}

export function buildContactCreatePayload(form: ContactForm): ContactInput {
    return compactPayload(form) as ContactInput;
}

export function buildContactUpdatePayload(form: ContactForm): ContactUpdateInput {
    return compactPayload(form, { emptyAsNull: true });
}
