import type {
    AccountInput,
    AccountUpdateInput,
    ContactInput,
    ContactUpdateInput
} from "./records";
import {
    accountFieldNames,
    contactFieldNames
} from "./record-fields";
import { SalesforceApiError } from "./client";

type JsonRequest = Pick<Request, "json">;

type SalesforcePayloadOptions = {
    allowNull: boolean;
    fields: readonly string[];
    objectLabel: string;
    required: readonly string[];
};

type SalesforcePayloadValue = string | null;
type SalesforcePayload = Record<string, SalesforcePayloadValue>;

function isJsonObject(body: unknown): body is Record<string, unknown> {
    return typeof body === "object" && body !== null && !Array.isArray(body);
}

function badPayload(message: string): SalesforceApiError {
    return new SalesforceApiError(message, 400);
}

function normalizeStringValue(value: string, allowNull: boolean): SalesforcePayloadValue | undefined {
    const trimmed = value.trim();

    if (trimmed) {
        return trimmed;
    }

    return allowNull ? null : undefined;
}

function validateSalesforcePayload(body: unknown, options: SalesforcePayloadOptions): SalesforcePayload {
    if (!isJsonObject(body)) {
        throw badPayload("Request body must be a JSON object.");
    }

    const allowedFields = new Set(options.fields);
    const payload: SalesforcePayload = {};

    for (const [key, value] of Object.entries(body)) {
        if (!allowedFields.has(key)) {
            throw badPayload(`Unexpected ${options.objectLabel} field: ${key}.`);
        }

        if (value === undefined) {
            continue;
        }

        if (value === null) {
            if (!options.allowNull) {
                throw badPayload(`${key} must be a string.`);
            }
            payload[key] = null;
            continue;
        }

        if (typeof value !== "string") {
            throw badPayload(`${key} must be a string.`);
        }

        const normalizedValue = normalizeStringValue(value, options.allowNull);
        if (normalizedValue !== undefined) {
            payload[key] = normalizedValue;
        }
    }

    for (const key of options.required) {
        if (typeof payload[key] !== "string") {
            throw badPayload(`${key} is required.`);
        }
    }

    return payload;
}

async function readSalesforcePayload<T>(
    request: JsonRequest,
    options: SalesforcePayloadOptions
): Promise<T> {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        throw badPayload("Request body must be valid JSON.");
    }

    return validateSalesforcePayload(body, options) as T;
}

export async function readAccountCreatePayload(request: JsonRequest): Promise<AccountInput> {
    return readSalesforcePayload<AccountInput>(request, {
        allowNull: false,
        fields: accountFieldNames,
        objectLabel: "Account",
        required: ["Name"]
    });
}

export async function readAccountUpdatePayload(request: JsonRequest): Promise<AccountUpdateInput> {
    return readSalesforcePayload<AccountUpdateInput>(request, {
        allowNull: true,
        fields: accountFieldNames,
        objectLabel: "Account",
        required: []
    });
}

export async function readContactCreatePayload(request: JsonRequest): Promise<ContactInput> {
    return readSalesforcePayload<ContactInput>(request, {
        allowNull: false,
        fields: contactFieldNames,
        objectLabel: "Contact",
        required: ["LastName"]
    });
}

export async function readContactUpdatePayload(request: JsonRequest): Promise<ContactUpdateInput> {
    return readSalesforcePayload<ContactUpdateInput>(request, {
        allowNull: true,
        fields: contactFieldNames,
        objectLabel: "Contact",
        required: []
    });
}
