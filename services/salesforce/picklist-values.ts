import type { Connection, DescribeSObjectResult } from "jsforce";
import type { PicklistValue, PicklistValuesResponse } from "@/lib/salesforce/picklist-values";
import { SalesforceApiError } from "@/lib/salesforce/client";
import { assertSalesforceRecordIdFormat } from "@/lib/salesforce/request-security";
import { withStandardObjectConnection } from "./client";
import { assertObjectPermission } from "./object-permissions";

const supportedPicklistFields = {
    Account: ["Industry", "Type"],
    Task: ["Status"]
} as const;

type SupportedPicklistObject = keyof typeof supportedPicklistFields;
type SupportedPicklistField<TObject extends SupportedPicklistObject = SupportedPicklistObject> =
    (typeof supportedPicklistFields)[TObject][number];

type PicklistValuesRequest = {
    objectApiName: SupportedPicklistObject;
    fieldApiNames: SupportedPicklistField[];
    recordTypeId?: string;
};

type SalesforceDescribePicklistEntry = {
    active?: boolean;
    defaultValue?: boolean;
    label?: string;
    value?: string;
};

type SalesforceUiPicklistValue = {
    defaultValue?: boolean;
    label?: string;
    value?: string;
};

type SalesforceUiPicklistValuesResponse = {
    values?: SalesforceUiPicklistValue[];
};

function isSupportedPicklistObject(value: string): value is SupportedPicklistObject {
    return value in supportedPicklistFields;
}

function isSupportedPicklistField(
    objectApiName: SupportedPicklistObject,
    value: string
): value is SupportedPicklistField {
    return (supportedPicklistFields[objectApiName] as readonly string[]).includes(value);
}

export function readPicklistValuesParams(request: Request): PicklistValuesRequest {
    const url = new URL(request.url);
    const objectApiName = url.searchParams.get("object") ?? "";
    const fields = (url.searchParams.get("fields") ?? "")
        .split(",")
        .map((field) => field.trim())
        .filter(Boolean);
    const recordTypeId = url.searchParams.get("recordTypeId")?.trim() || undefined;

    if (!isSupportedPicklistObject(objectApiName)) {
        throw new SalesforceApiError("Unsupported picklist object.", 400);
    }

    if (fields.length === 0) {
        throw new SalesforceApiError("Picklist fields are required.", 400);
    }

    const unsupportedField = fields.find((field) => !isSupportedPicklistField(objectApiName, field));
    if (unsupportedField) {
        throw new SalesforceApiError(`Unsupported ${objectApiName} picklist field: ${unsupportedField}.`, 400);
    }

    if (recordTypeId) {
        assertSalesforceRecordIdFormat(recordTypeId, "Record Type");
    }

    return {
        objectApiName,
        fieldApiNames: fields as SupportedPicklistField[],
        recordTypeId
    };
}

function toPicklistValues(entries: SalesforceDescribePicklistEntry[] | undefined): PicklistValue[] {
    return (entries ?? [])
        .filter((entry) => entry.active !== false && typeof entry.value === "string" && entry.value)
        .map((entry) => ({
            defaultValue: entry.defaultValue,
            label: typeof entry.label === "string" && entry.label ? entry.label : entry.value as string,
            value: entry.value as string
        }));
}

function getFieldPicklistValues(describe: DescribeSObjectResult, fieldApiName: string): PicklistValue[] {
    const field = describe.fields.find((candidate) => candidate.name === fieldApiName);

    if (!field) {
        throw new SalesforceApiError(`${describe.name}.${fieldApiName} の項目定義を取得できませんでした。`, 404);
    }

    return toPicklistValues(field.picklistValues as SalesforceDescribePicklistEntry[] | undefined);
}

function getTargetRecordTypeId(describe: DescribeSObjectResult, recordTypeId?: string): string | undefined {
    if (recordTypeId) {
        return recordTypeId;
    }

    return describe.recordTypeInfos.find((recordType) => recordType.available && recordType.defaultRecordTypeMapping)
        ?.recordTypeId;
}

function hasCustomRecordTypes(describe: DescribeSObjectResult): boolean {
    return describe.recordTypeInfos.some((recordType) => recordType.available && !recordType.master);
}

async function getRecordTypePicklistValues({
    connection,
    fieldApiName,
    objectApiName,
    recordTypeId
}: {
    connection: Connection;
    fieldApiName: string;
    objectApiName: SupportedPicklistObject;
    recordTypeId: string;
}): Promise<PicklistValue[]> {
    const response = await connection.request<SalesforceUiPicklistValuesResponse>(
        `/ui-api/object-info/${encodeURIComponent(objectApiName)}/picklist-values/${encodeURIComponent(recordTypeId)}/${encodeURIComponent(fieldApiName)}`
    );

    return toPicklistValues(response.values);
}

export async function listPicklistValues({
    fieldApiNames,
    objectApiName,
    recordTypeId
}: PicklistValuesRequest) {
    return withStandardObjectConnection(async (connection) => {
        const describe = await assertObjectPermission(connection, objectApiName, "queryable");
        const targetRecordTypeId = getTargetRecordTypeId(describe, recordTypeId);
        const useRecordTypePicklists = Boolean(targetRecordTypeId) && hasCustomRecordTypes(describe);
        const fields: PicklistValuesResponse["fields"] = {};

        await Promise.all(fieldApiNames.map(async (fieldApiName) => {
            const describeValues = getFieldPicklistValues(describe, fieldApiName);

            if (!useRecordTypePicklists || !targetRecordTypeId) {
                fields[fieldApiName] = describeValues;
                return;
            }

            try {
                fields[fieldApiName] = await getRecordTypePicklistValues({
                    connection,
                    fieldApiName,
                    objectApiName,
                    recordTypeId: targetRecordTypeId
                });
            } catch {
                fields[fieldApiName] = describeValues;
            }
        }));

        return {
            fields,
            recordTypeId: useRecordTypePicklists ? targetRecordTypeId : undefined
        };
    });
}
