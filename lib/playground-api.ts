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

type RecordPayloadBuilders<TForm extends Record<string, string>, TCreateInput, TUpdateInput> = {
    buildCreatePayload: (form: TForm) => TCreateInput;
    buildUpdatePayload: (form: TForm) => TUpdateInput;
};

export type CreatePayload<T extends Record<string, string>> = Partial<{
    [K in keyof T]: string | undefined;
}>;

export type UpdatePayload<T extends Record<string, string>> = Partial<{
    [K in keyof T]: string | null;
}>;

export const playgroundApiPaths = {
    activities(parentType: "account" | "contact", parentId: string): string {
        return `/api/activities?parentType=${encodeURIComponent(parentType)}&parentId=${encodeURIComponent(parentId)}`;
    },
    activityTasks: "/api/activities/tasks",
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

function collectionPath(resource: PlaygroundApiResource) {
    return playgroundApiResourcePaths[resource];
}

export function buildCreateRecordRequest(resource: PlaygroundApiResource, body: unknown): PlaygroundApiRequest {
    return buildPlaygroundApiRequest(collectionPath(resource), {
        method: "POST",
        body
    });
}

export function buildUpdateRecordRequest(
    resource: PlaygroundApiResource,
    id: string,
    body: unknown
): PlaygroundApiRequest {
    return buildPlaygroundApiRequest(playgroundApiPaths.record(resource, id), {
        method: "PATCH",
        body
    });
}

export function buildDeleteRecordRequest(resource: PlaygroundApiResource, id: string): PlaygroundApiRequest {
    return buildPlaygroundApiRequest(playgroundApiPaths.record(resource, id), {
        method: "DELETE"
    });
}

export function buildBulkDeleteRecordsRequest(
    resource: PlaygroundApiResource,
    ids: string[]
): PlaygroundApiRequest {
    return buildPlaygroundApiRequest(collectionPath(resource), {
        method: "DELETE",
        body: { ids }
    });
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

const playgroundApiResourcePaths: Record<PlaygroundApiResource, string> = {
    accounts: playgroundApiPaths.accounts,
    contacts: playgroundApiPaths.contacts
};

const recordPayloadBuilders: {
    accounts: RecordPayloadBuilders<AccountForm, AccountInput, AccountUpdateInput>;
    contacts: RecordPayloadBuilders<ContactForm, ContactInput, ContactUpdateInput>;
} = {
    accounts: {
        buildCreatePayload: buildAccountCreatePayload,
        buildUpdatePayload: buildAccountUpdatePayload
    },
    contacts: {
        buildCreatePayload: buildContactCreatePayload,
        buildUpdatePayload: buildContactUpdatePayload
    }
};

export function buildCreateRecordPayload(resource: "accounts", form: AccountForm): AccountInput;
export function buildCreateRecordPayload(resource: "contacts", form: ContactForm): ContactInput;
export function buildCreateRecordPayload(
    resource: PlaygroundApiResource,
    form: AccountForm | ContactForm
): AccountInput | ContactInput {
    if (resource === "accounts") {
        return recordPayloadBuilders.accounts.buildCreatePayload(form as AccountForm);
    }

    return recordPayloadBuilders.contacts.buildCreatePayload(form as ContactForm);
}

export function buildUpdateRecordPayload(resource: "accounts", form: AccountForm): AccountUpdateInput;
export function buildUpdateRecordPayload(resource: "contacts", form: ContactForm): ContactUpdateInput;
export function buildUpdateRecordPayload(
    resource: PlaygroundApiResource,
    form: AccountForm | ContactForm
): AccountUpdateInput | ContactUpdateInput {
    if (resource === "accounts") {
        return recordPayloadBuilders.accounts.buildUpdatePayload(form as AccountForm);
    }

    return recordPayloadBuilders.contacts.buildUpdatePayload(form as ContactForm);
}
