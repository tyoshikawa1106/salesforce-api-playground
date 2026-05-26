export const DEFAULT_SALESFORCE_API_VERSION = "v66.0";

export function toJsforceApiVersion(apiVersion: string): string {
    return apiVersion.replace(/^v/, "");
}
