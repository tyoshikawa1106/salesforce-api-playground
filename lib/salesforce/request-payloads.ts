import type {
    AccountInput,
    AccountUpdateInput,
    BulkDeleteInput,
    ContactInput,
    ContactUpdateInput
} from "./records";
import type { RecycleBinUndeleteItem } from "./records";
import { isRecycleBinObjectApiName } from "./recycle-bin";
import { assertSalesforceRecordId } from "./request-security";
import {
    accountFieldNames,
    contactFieldNames
} from "./record-fields";
import {
    badPayload,
    isJsonObject,
    readJsonObjectBody,
    type JsonRequest
} from "./json-payload";

type SalesforcePayloadOptions = {
    allowNull: boolean;
    fields: readonly string[];
    objectLabel: string;
    required: readonly string[];
};

type SalesforcePayloadReaderConfig = {
    createRequired: readonly string[];
    fields: readonly string[];
    objectLabel: string;
};

type SalesforcePayloadValue = string | null;
type SalesforcePayload = Record<string, SalesforcePayloadValue>;

function normalizeStringValue(value: string, allowNull: boolean): SalesforcePayloadValue | undefined {
    const trimmed = value.trim();

    if (trimmed) {
        return trimmed;
    }

    return allowNull ? null : undefined;
}

function validateSalesforcePayload(body: Record<string, unknown>, options: SalesforcePayloadOptions): SalesforcePayload {
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
    const body = await readJsonObjectBody(request);

    return validateSalesforcePayload(body, options) as T;
}

function createSalesforcePayloadReaders<TCreate, TUpdate>({
    createRequired,
    fields,
    objectLabel
}: SalesforcePayloadReaderConfig) {
    return {
        readCreatePayload(request: JsonRequest): Promise<TCreate> {
            return readSalesforcePayload<TCreate>(request, {
                allowNull: false,
                fields,
                objectLabel,
                required: createRequired
            });
        },
        readUpdatePayload(request: JsonRequest): Promise<TUpdate> {
            return readSalesforcePayload<TUpdate>(request, {
                allowNull: true,
                fields,
                objectLabel,
                required: []
            });
        }
    };
}

export async function readBulkDeletePayload(request: JsonRequest): Promise<BulkDeleteInput> {
    const body = await readJsonObjectBody(request);

    if (!("ids" in body)) {
        throw badPayload("ids is required.");
    }

    if (!Array.isArray(body.ids)) {
        throw badPayload("ids must be an array.");
    }

    if (body.ids.length === 0) {
        throw badPayload("ids must include at least one id.");
    }

    const ids = body.ids.map((id) => {
        if (typeof id !== "string" || !id.trim()) {
            throw badPayload("ids must include only non-empty strings.");
        }

        return id.trim();
    });

    return { ids };
}

export async function readRecycleBinUndeletePayload(request: JsonRequest): Promise<{ items: RecycleBinUndeleteItem[] }> {
    const body = await readJsonObjectBody(request);

    if (!("items" in body)) {
        throw badPayload("items is required.");
    }

    if (!Array.isArray(body.items)) {
        throw badPayload("items must be an array.");
    }

    if (body.items.length === 0) {
        throw badPayload("items must include at least one item.");
    }

    const items = body.items.map((item) => {
        if (!isJsonObject(item)) {
            throw badPayload("items must include only objects.");
        }

        if (typeof item.objectApiName !== "string" || !isRecycleBinObjectApiName(item.objectApiName)) {
            throw badPayload("Unsupported recycle bin object.");
        }

        if (typeof item.id !== "string" || !item.id.trim()) {
            throw badPayload("items must include only non-empty ids.");
        }

        const id = item.id.trim();
        assertSalesforceRecordId(id, item.objectApiName);

        return {
            objectApiName: item.objectApiName,
            id
        };
    });

    return { items };
}

const accountPayloadReaders = createSalesforcePayloadReaders<AccountInput, AccountUpdateInput>({
    createRequired: ["Name"],
    fields: accountFieldNames,
    objectLabel: "Account"
});

const contactPayloadReaders = createSalesforcePayloadReaders<ContactInput, ContactUpdateInput>({
    createRequired: ["LastName"],
    fields: contactFieldNames,
    objectLabel: "Contact"
});

export const readAccountCreatePayload = accountPayloadReaders.readCreatePayload;
export const readAccountUpdatePayload = accountPayloadReaders.readUpdatePayload;
export const readContactCreatePayload = contactPayloadReaders.readCreatePayload;
export const readContactUpdatePayload = contactPayloadReaders.readUpdatePayload;
